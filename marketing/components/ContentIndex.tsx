'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Search, X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import type { Database } from '../lib/database.types';
import Button from './ui/Button';

type Post = Database['public']['Tables']['success_stories']['Row'];
type Kind = 'blog' | 'story';
type SortBy = 'newest' | 'oldest' | 'quickest';

// Blog posts and success stories share one table and one layout; only the copy,
// query filter and detail URL differ.
const config: Record<Kind, { title: React.ReactNode; description: string; noun: string; href: (id: string) => string; cta: string }> = {
  blog: {
    title: (
      <>
        Notes on <span className="italic">better sponsorships</span>
      </>
    ),
    description: 'Guides, playbooks and lessons for brands and organisers working on event sponsorship.',
    noun: 'article',
    href: (id) => `/blog/${id}`,
    cta: 'Read article',
  },
  story: {
    title: (
      <>
        Partnerships that <span className="italic">came together</span>
      </>
    ),
    description: 'Events, brands and organisers who found each other on Sponsor Studio, and what happened next.',
    noun: 'story',
    href: (id) => `/stories/${id}`,
    cta: 'Read story',
  },
};

const sortOptions: { value: SortBy; label: string }[] = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'quickest', label: 'Quick reads' },
];

const stripHtml = (html: string) => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

const readingMinutes = (content: string) => Math.max(1, Math.ceil(stripHtml(content).split(' ').length / 200));

const excerpt = (post: Post, max = 160) => {
  const text = post.preview_text || stripHtml(post.content);
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text;
};

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

function Meta({ post }: { post: Post }) {
  return (
    <p className="font-mono text-xs uppercase tracking-wider text-text-muted">
      {formatDate(post.created_at)} · {readingMinutes(post.content)} min read
    </p>
  );
}

function Cover({ post, className }: { post: Post; className: string }) {
  const [failed, setFailed] = useState(false);
  if (failed || !post.preview_image) {
    return <div className={`${className} bg-brand-50`} aria-hidden="true" />;
  }
  return (
    // Cover images come from Supabase storage with unknown dimensions.
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={post.preview_image}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
      className={`${className} object-cover transition-transform duration-500 ease-out-expo group-hover:scale-[1.02]`}
    />
  );
}

export default function ContentIndex({ kind }: { kind: Kind }) {
  const copy = config[kind];
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('newest');

  useEffect(() => {
    const load = async () => {
      let request = supabase.from('success_stories').select('*').order('created_at', { ascending: false });
      request = kind === 'blog' ? request.eq('is_blog', true) : request.or('is_blog.is.null,is_blog.eq.false');
      const { data, error } = await request;
      if (error) console.error(`Error fetching ${copy.noun}s:`, error);
      setPosts(data || []);
      setLoading(false);
    };
    load();
  }, [kind, copy.noun]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? posts.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            p.preview_text?.toLowerCase().includes(q) ||
            stripHtml(p.content).toLowerCase().includes(q)
        )
      : [...posts];
    return filtered.sort((a, b) => {
      if (sortBy === 'oldest') return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sortBy === 'quickest') return readingMinutes(a.content) - readingMinutes(b.content);
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });
  }, [posts, query, sortBy]);

  // Feature the newest post only in the default, unfiltered view.
  const showFeatured = !query && sortBy === 'newest' && visible.length > 0;
  const featured = showFeatured ? visible[0] : null;
  const rest = showFeatured ? visible.slice(1) : visible;

  return (
    <div className="container-page py-14 lg:py-20">
      <header className="flex flex-col gap-8 border-b border-border pb-10 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl">
          <h1 className="text-5xl text-text-primary sm:text-6xl">{copy.title}</h1>
          <p className="mt-5 text-lg leading-relaxed text-text-secondary">{copy.description}</p>
        </div>

        <div className="flex w-full flex-col gap-3 sm:flex-row lg:w-auto">
          <label className="relative block sm:w-72">
            <span className="sr-only">Search {copy.noun}s</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Search ${copy.noun}s`}
              className="h-10 w-full rounded-[10px] border border-border bg-surface pl-9 pr-9 text-sm text-text-primary placeholder:text-text-muted focus:border-brand-500 focus:outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-text-muted hover:text-text-primary"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </label>
          <label className="block">
            <span className="sr-only">Sort by</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortBy)}
              className="h-10 w-full rounded-[10px] border border-border bg-surface px-3 text-sm text-text-primary focus:border-brand-500 focus:outline-none sm:w-auto"
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </header>

      {loading ? (
        <div className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i}>
              <div className="aspect-[16/10] animate-pulse rounded-card bg-background-secondary" />
              <div className="mt-5 h-3 w-32 animate-pulse rounded bg-background-secondary" />
              <div className="mt-3 h-5 w-4/5 animate-pulse rounded bg-background-secondary" />
            </div>
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="mx-auto mt-16 max-w-md text-center">
          <p className="font-display text-2xl text-text-primary">
            {query ? `Nothing matches “${query}”` : `No ${copy.noun}s yet`}
          </p>
          <p className="mt-3 text-text-secondary">
            {query ? 'Try a different word, or clear the search to see everything.' : 'Check back soon.'}
          </p>
          {query && (
            <Button variant="secondary" className="mt-6" onClick={() => setQuery('')}>
              Clear search
            </Button>
          )}
        </div>
      ) : (
        <>
          {featured && (
            <Link
              href={copy.href(featured.id)}
              className="group mt-12 grid items-center gap-8 rounded-card lg:grid-cols-12 lg:gap-12"
            >
              <div className="overflow-hidden rounded-card border border-border lg:col-span-7">
                <Cover post={featured} className="aspect-[16/10] w-full" />
              </div>
              <div className="lg:col-span-5">
                <Meta post={featured} />
                <h2 className="mt-4 text-3xl text-text-primary transition-colors group-hover:text-brand-700 sm:text-4xl">
                  {featured.title}
                </h2>
                <p className="mt-4 leading-relaxed text-text-secondary">{excerpt(featured, 240)}</p>
                <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-text-primary">
                  {copy.cta}
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          )}

          {rest.length > 0 && (
            <div className={`${featured ? 'mt-16 border-t border-border pt-12' : 'mt-12'}`}>
              {query && (
                <p className="mb-8 text-sm text-text-secondary">
                  {visible.length} {visible.length === 1 ? copy.noun : `${copy.noun}s`} found
                </p>
              )}
              <ul className="grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((post) => (
                  <li key={post.id}>
                    <Link href={copy.href(post.id)} className="group block">
                      <div className="overflow-hidden rounded-card border border-border">
                        <Cover post={post} className="aspect-[16/10] w-full" />
                      </div>
                      <div className="mt-5">
                        <Meta post={post} />
                        <h3 className="mt-3 text-lg font-semibold leading-snug text-text-primary transition-colors group-hover:text-brand-700">
                          {post.title}
                        </h3>
                        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-text-secondary">{excerpt(post)}</p>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
  );
}
