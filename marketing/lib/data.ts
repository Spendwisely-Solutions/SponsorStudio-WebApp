import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Server-side data access. Pages call these while rendering, so content arrives in the
// HTML instead of loading in the browser afterwards. Pages set `revalidate` to control
// how often the cached result is refreshed.

const supabase = createClient<Database>(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
  auth: { persistSession: false, autoRefreshToken: false },
});

// The generated types predate the is_blog column.
export type Post = Database['public']['Tables']['success_stories']['Row'] & { is_blog?: boolean | null };
export type ClientLogo = Database['public']['Tables']['client_logos']['Row'];
export type Faq = { id: number; question: string; answer: string; is_brand: boolean; list_order: number };
export type TrendingEvent = {
  title: string;
  description: string;
  media_urls: string[];
  start_date: string;
  end_date: string;
  location: string;
};

export async function getFaqs(): Promise<Faq[]> {
  const { data, error } = await supabase.from('faq').select('*').order('list_order', { ascending: true });
  if (error) console.error('Error fetching FAQs:', error);
  return (data as Faq[] | null) ?? [];
}

export async function getPosts(kind: 'blog' | 'story'): Promise<Post[]> {
  let query = supabase.from('success_stories').select('*').order('created_at', { ascending: false });
  query = kind === 'blog' ? query.eq('is_blog', true) : query.or('is_blog.is.null,is_blog.eq.false');
  const { data, error } = await query;
  if (error) console.error(`Error fetching ${kind} posts:`, error);
  return (data as Post[] | null) ?? [];
}

export async function getAllStories(): Promise<Post[]> {
  const { data, error } = await supabase.from('success_stories').select('*').order('created_at', { ascending: false });
  if (error) console.error('Error fetching success stories:', error);
  return (data as Post[] | null) ?? [];
}

export async function getPost(id: string): Promise<Post | null> {
  const { data, error } = await supabase.from('success_stories').select('*').eq('id', id).maybeSingle();
  if (error) console.error('Error fetching post:', error);
  return (data as Post | null) ?? null;
}

export async function getRelatedPosts(post: Post, limit = 3): Promise<Post[]> {
  let query = supabase.from('success_stories').select('*').neq('id', post.id);
  query = post.is_blog ? query.eq('is_blog', true) : query.or('is_blog.is.null,is_blog.eq.false');
  const { data } = await query.order('created_at', { ascending: false }).limit(limit);
  return (data as Post[] | null) ?? [];
}

export async function getClientLogos(): Promise<ClientLogo[]> {
  const { data, error } = await supabase.from('client_logos').select('*');
  if (error) console.error('Error fetching client logos:', error);
  return data ?? [];
}

export async function getTrendingEvents(): Promise<TrendingEvent[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/fetch-trending-events`, {
      next: { revalidate: 3600 },
    });
    const json = await res.json();
    return json.success && Array.isArray(json.data) ? json.data : [];
  } catch (err) {
    console.error('Error fetching trending events:', err);
    return [];
  }
}
