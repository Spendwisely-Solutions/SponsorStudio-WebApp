'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Calendar, MapPin } from 'lucide-react';
import Button from '../ui/Button';
import SectionHeader from '../ui/SectionHeader';
import { SIGN_IN_URL } from '../../lib/site';

type TrendingEvent = {
  title: string;
  description: string;
  media_urls: string[];
  start_date: string;
  end_date: string;
  location: string;
};

interface TrendingEventsProps {
  showAuthForm?: () => void;
  onSelectEvent?: (event: TrendingEvent) => void;
}

const IMAGE = /\.(jpg|jpeg|png|webp|avif)$/i;
const VIDEO = /\.(mp4|webm|ogg)$/i;

// Prefer an image for the card; fall back to a video, then to whatever is first.
function coverFor(event: TrendingEvent): { url: string; type: 'image' | 'video' } | null {
  const urls = event.media_urls || [];
  const image = urls.find((url) => IMAGE.test(url));
  if (image) return { url: image, type: 'image' };
  const video = urls.find((url) => VIDEO.test(url));
  if (video) return { url: video, type: 'video' };
  return urls[0] ? { url: urls[0], type: 'image' } : null;
}

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

function TrendingEvents({ showAuthForm }: TrendingEventsProps) {
  const [events, setEvents] = useState<TrendingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const railRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/fetch-trending-events`)
      .then((res) => res.json())
      .then((res) => setEvents(res.success && Array.isArray(res.data) ? res.data : []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  // Hide test entries, listings without media and events that have already started.
  const upcoming = useMemo(() => {
    const now = new Date();
    return events.filter((e) => {
      if (e.title?.toLowerCase().includes('test event')) return false;
      if (!Array.isArray(e.media_urls) || e.media_urls.length === 0) return false;
      const start = new Date(e.start_date);
      return isNaN(start.getTime()) || start >= now;
    });
  }, [events]);

  const openEvent = (event: TrendingEvent) => {
    // Full listings are behind sign-in; remember which one to open afterwards.
    sessionStorage.setItem('pending_event_view_details', JSON.stringify(event));
    showAuthForm?.();
  };

  const scrollBy = (direction: 1 | -1) => {
    const rail = railRef.current;
    if (!rail) return;
    rail.scrollBy({ left: direction * rail.clientWidth * 0.8, behavior: 'smooth' });
  };

  return (
    <section id="opportunities" className="border-t border-border bg-background-secondary py-20 lg:py-28">
      <div className="container-page">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeader
            title={
              <>
                Opportunities <span className="italic">open for sponsors</span>
              </>
            }
            description="A few of the verified events currently looking for brand partners."
          />
          {upcoming.length > 1 && (
            <div className="hidden shrink-0 gap-2 sm:flex">
              <button
                type="button"
                onClick={() => scrollBy(-1)}
                aria-label="Previous opportunities"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-text-primary hover:border-border-hover"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => scrollBy(1)}
                aria-label="More opportunities"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-text-primary hover:border-border-hover"
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        <div className="mt-12">
          {loading ? (
            <div className="grid gap-4 sm:grid-cols-3" aria-busy="true" aria-label="Loading opportunities">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="aspect-[4/5] animate-pulse rounded-card bg-surface" />
              ))}
            </div>
          ) : upcoming.length === 0 ? (
            <div className="mx-auto max-w-xl rounded-card border border-border bg-surface px-6 py-10 text-center">
              <p className="font-display text-2xl text-text-primary">New listings are verified every week.</p>
              <p className="mt-3 text-text-secondary">
                Sign in to browse every event, creator and outdoor placement that&apos;s currently open.
              </p>
              <Button href={SIGN_IN_URL} className="mt-6">
                Browse opportunities
              </Button>
            </div>
          ) : (
            <ul
              ref={railRef}
              className="no-scrollbar -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto scroll-smooth px-4 pb-2 sm:-mx-6 sm:scroll-px-6 sm:px-6"
            >
              {upcoming.map((event, i) => {
                const cover = coverFor(event);
                return (
                  <li key={`${event.title}-${event.start_date}-${i}`} className="w-[78vw] shrink-0 snap-start sm:w-[20rem]">
                    <button type="button" onClick={() => openEvent(event)} className="group block w-full text-left">
                      <div className="relative aspect-[4/5] overflow-hidden rounded-card border border-border bg-brand-50">
                        {cover?.type === 'video' ? (
                          <video src={cover.url} className="h-full w-full object-cover" muted loop autoPlay playsInline />
                        ) : cover ? (
                          // Event media comes from Supabase storage with unknown dimensions.
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={cover.url}
                            alt=""
                            loading="lazy"
                            className="h-full w-full object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.03]"
                          />
                        ) : null}
                        <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-surface/95 px-2.5 py-1 font-mono text-[11px] text-text-primary">
                          <Calendar className="h-3 w-3" />
                          {formatDate(event.start_date)}
                        </span>
                      </div>
                      <h3 className="mt-4 text-lg font-semibold leading-snug text-text-primary transition-colors group-hover:text-brand-700">
                        {event.title}
                      </h3>
                      <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-text-secondary">
                        <MapPin className="h-3.5 w-3.5" />
                        {event.location}
                      </p>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}

export default TrendingEvents;
