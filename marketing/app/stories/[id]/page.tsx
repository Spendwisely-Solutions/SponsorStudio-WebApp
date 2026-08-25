import { createClient } from '@supabase/supabase-js';
import { Metadata } from 'next';
import SuccessStoryPageClient from '../../../components/SuccessStoryPageClient';
import type { Database } from '../../../lib/database.types';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const revalidate = 3600; // Cache on CDN for 1 hour

export async function generateStaticParams() {
  const { data: stories } = (await supabase
    .from('success_stories')
    .select('id')
    .or('is_blog.is.null,is_blog.eq.false')) as { data: any[] | null };
  
  return (stories || []).map((story) => ({
    id: story.id,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const { data: story } = (await supabase
    .from('success_stories')
    .select('*')
    .eq('id', resolvedParams.id)
    .single()) as { data: any };

  if (!story) return {};

  const cleanText = story.content.replace(/<[^>]*>/g, '').trim();
  const description = cleanText.length > 160 ? cleanText.substring(0, 157) + '...' : cleanText;

  return {
    title: `${story.title} | Sponsor Studio`,
    description,
    openGraph: {
      title: story.title,
      description,
      images: [{ url: story.preview_image }],
      type: 'article',
    },
  };
}

export default function StoryDetailPage() {
  return <SuccessStoryPageClient />;
}
