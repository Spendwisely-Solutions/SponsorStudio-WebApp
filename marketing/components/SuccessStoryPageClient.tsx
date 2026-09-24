'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, Link2 } from 'lucide-react';
import { FaFacebook, FaLinkedin, FaWhatsapp } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import { supabase } from '../lib/supabaseClient';
import type { Database } from '../lib/database.types';
import Button from './ui/Button';

// The generated types predate the is_blog column, so it is added here.
type Post = Database['public']['Tables']['success_stories']['Row'] & { is_blog?: boolean | null };

const stripHtml = (html: string) => html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
const readingMinutes = (content: string) => Math.max(1, Math.ceil(stripHtml(content).split(' ').length / 200));
// Much of the CMS content was pasted from PDFs, which leaves a <br> at every
// visual line end. Breaks after sentence punctuation become paragraph breaks;
// breaks mid-sentence become spaces. Stored content is left untouched.
const normalizeArticleHtml = (html: string) =>
  html
    .replace(/([.!?:"”’)])\s*<br\s*\/?>\s*/g, '$1</p><p>')
    .replace(/\s*<br\s*\/?>\s*/g, ' ')
    .replace(/<p>\s*<\/p>/g, '');

const formatDate = (iso: string, month: 'short' | 'long' = 'long') =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month, year: 'numeric' });

function ReadingProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <div className="fixed inset-x-0 top-[var(--nav-height)] z-40 h-0.5" aria-hidden="true">
      <div className="h-full origin-left bg-brand-600" style={{ transform: `scaleX(${progress})` }} />
    </div>
  );
}

function ShareLinks({ post }: { post: Post }) {
  const [copied, setCopied] = useState(false);

  // The page URL is read at click time, so nothing depends on window during render.
  const t = encodeURIComponent(post.title);
  const links = [
    { label: 'Share on LinkedIn', icon: FaLinkedin, build: (u: string) => `https://www.linkedin.com/sharing/share-offsite/?url=${u}` },
    { label: 'Share on X', icon: FaXTwitter, build: (u: string) => `https://twitter.com/intent/tweet?url=${u}&text=${t}` },
    { label: 'Share on WhatsApp', icon: FaWhatsapp, build: (u: string) => `https://wa.me/?text=${t}%20${u}` },
    { label: 'Share on Facebook', icon: FaFacebook, build: (u: string) => `https://www.facebook.com/sharer/sharer.php?u=${u}` },
  ];
  const open = (build: (u: string) => string) =>
    window.open(build(encodeURIComponent(window.location.href)), '_blank', 'noopener,noreferrer,width=600,height=500');

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const iconClass =
    'inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-text-secondary transition-colors hover:border-border-hover hover:text-text-primary';

  return (
    <div className="flex items-center gap-2">
      {links.map(({ label, icon: Icon, build }) => (
        <button key={label} type="button" onClick={() => open(build)} aria-label={label} className={iconClass}>
          <Icon className="h-4 w-4" />
        </button>
      ))}
      <button type="button" onClick={copy} aria-label="Copy link" className={iconClass}>
        {copied ? <Check className="h-4 w-4 text-success" /> : <Link2 className="h-4 w-4" />}
      </button>
      <span className="sr-only" aria-live="polite">
        {copied ? 'Link copied' : ''}
      </span>
    </div>
  );
}

export default function SuccessStoryPage() {
  const params = useParams();
  const id = params?.id as string;
  const [post, setPost] = useState<Post | null>(null);
  const [related, setRelated] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      const { data, error } = (await supabase.from('success_stories').select('*').eq('id', id).single()) as {
        data: Post | null;
        error: unknown;
      };
      if (error || !data) {
        setLoading(false);
        return;
      }
      // Stories have is_blog = false or null, so match both for the "more stories" list.
      let relatedQuery = supabase.from('success_stories').select('*').neq('id', id);
      relatedQuery = data.is_blog ? relatedQuery.eq('is_blog', true) : relatedQuery.or('is_blog.is.null,is_blog.eq.false');
      const { data: relatedData } = await relatedQuery.order('created_at', { ascending: false }).limit(3);
      setPost(data);
      setRelated(relatedData || []);
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="container-page max-w-3xl py-16" aria-busy="true">
        <div className="h-3 w-40 animate-pulse rounded bg-background-secondary" />
        <div className="mt-6 h-12 w-full animate-pulse rounded bg-background-secondary" />
        <div className="mt-3 h-12 w-2/3 animate-pulse rounded bg-background-secondary" />
        <div className="mt-12 aspect-[16/9] animate-pulse rounded-card bg-background-secondary" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center text-center">
        <h1 className="text-4xl text-text-primary">We couldn&apos;t find that page</h1>
        <p className="mt-4 text-text-secondary">It may have been moved or unpublished.</p>
        <div className="mt-8 flex gap-3">
          <Button href="/blogs" variant="secondary">Blog</Button>
          <Button href="/stories" variant="secondary">Success stories</Button>
        </div>
      </div>
    );
  }

  const isBlog = Boolean(post.is_blog);
  const listHref = isBlog ? '/blogs' : '/stories';
  const itemHref = (itemId: string) => (isBlog ? `/blog/${itemId}` : `/stories/${itemId}`);

  return (
    <>
      <ReadingProgress />
      <article className="pb-20 pt-10 lg:pt-14">
        <div className="container-page">
          <div className="mx-auto max-w-[680px]">
            <Link
              href={listHref}
              className="inline-flex items-center gap-1.5 text-sm text-text-secondary transition-colors hover:text-text-primary"
            >
              <ArrowLeft className="h-4 w-4" />
              {isBlog ? 'All articles' : 'All success stories'}
            </Link>

            <p className="mt-10 font-mono text-xs uppercase tracking-wider text-text-muted">
              {isBlog ? 'Blog' : 'Success story'} · {formatDate(post.created_at)} · {readingMinutes(post.content)} min read
            </p>
            <h1 className="mt-4 text-4xl text-text-primary sm:text-5xl">{post.title}</h1>
            {post.preview_text && <p className="mt-5 text-xl leading-relaxed text-text-secondary">{post.preview_text}</p>}
            <div className="mt-8">
              <ShareLinks post={post} />
            </div>
          </div>

          {post.preview_image && (
            <div className="mx-auto mt-12 max-w-5xl overflow-hidden rounded-card border border-border">
              {/* Cover images come from Supabase storage with unknown dimensions. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={post.preview_image} alt="" className="aspect-[16/9] w-full object-cover" />
            </div>
          )}

          <div
            className="article mx-auto mt-12 max-w-[680px]"
            // Content is authored by admins in the CMS.
            dangerouslySetInnerHTML={{ __html: normalizeArticleHtml(post.content) }}
          />

          <div className="mx-auto mt-16 max-w-[680px] border-t border-border pt-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm font-medium text-text-primary">Share this {isBlog ? 'article' : 'story'}</p>
              <ShareLinks post={post} />
            </div>
            <div className="mt-10 rounded-card bg-navy p-6 text-white sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-8">
              <div>
                <p className="font-display text-2xl">Looking for your next sponsor?</p>
                <p className="mt-1 text-sm text-white/70">See how Sponsor Studio can help, in a short demo.</p>
              </div>
              <Button href="/book-demo" variant="inverse" className="mt-5 shrink-0 sm:mt-0">
                Book a demo
              </Button>
            </div>
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="border-t border-border bg-background-secondary py-16 lg:py-20">
          <div className="container-page">
            <div className="flex items-end justify-between gap-4">
              <h2 className="text-3xl text-text-primary">More {isBlog ? 'articles' : 'success stories'}</h2>
              <Link
                href={listHref}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-text-primary hover:text-brand-700"
              >
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <ul className="mt-10 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <li key={item.id}>
                  <Link href={itemHref(item.id)} className="group block">
                    <div className="overflow-hidden rounded-card border border-border bg-brand-50">
                      {item.preview_image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={item.preview_image}
                          alt=""
                          loading="lazy"
                          className="aspect-[16/10] w-full object-cover transition-transform duration-500 ease-out-expo group-hover:scale-[1.02]"
                        />
                      )}
                    </div>
                    <p className="mt-4 font-mono text-xs uppercase tracking-wider text-text-muted">
                      {formatDate(item.created_at, 'short')} · {readingMinutes(item.content)} min read
                    </p>
                    <h3 className="mt-2 text-lg font-semibold leading-snug text-text-primary transition-colors group-hover:text-brand-700">
                      {item.title}
                    </h3>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </>
  );
}
