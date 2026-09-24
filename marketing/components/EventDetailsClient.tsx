'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ArrowLeft, BadgeCheck, Calendar, Expand, MapPin, Share2, Volume2, VolumeX, X } from 'lucide-react';
import Button from './ui/Button';
import { SIGN_IN_URL } from '../lib/site';
import toast from 'react-hot-toast';

interface EventData {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  price_range: {
    min: number;
    max: number;
  };
  reach: number;
  footfall?: number;
  media_urls: string[];
  status: string;
  created_at: string;
  requirements?: string;
  benefits?: string;
  organization_name?: string;
  organization_address?: string;
  poc_name?: string;
  poc_position?: string;
  calendly_link?: string;
  sponsorship_brochure_url?: string;
  is_verified: boolean;
  is_vip: boolean;
  category?: { 
    id: string; 
    name: string;
    description?: string;
  };
  creator?: {
    id: string;
    company_name?: string;
    contact_person_name?: string;
  };
}

export default function EventDetails() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const opportunityId = searchParams.get('id');
  
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMediaIndex, setSelectedMediaIndex] = useState(0);
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [failedMedia, setFailedMedia] = useState<string[]>([]);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!opportunityId) {
      toast.error('Event ID is required');
      router.push('/trending-events');
      return;
    }

    fetchEventDetails();
  }, [opportunityId]);

  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/get-opportunity-by-id?id=${opportunityId}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch event');
      }

      const result = await response.json();

      if (!result.data) {
        toast.error('Event not found');
        router.push('/trending-events');
        return;
      }

      setEvent(result.data);
    } catch (error: any) {
      console.error('Error fetching event:', error);
      toast.error('Failed to load event details');
      router.push('/trending-events');
    } finally {
      setLoading(false);
    }
  };

  const isVideoUrl = (url: string) => {
    return url.match(/\.(mp4|webm|ogg|mov)$/i) || url.includes('video');
  };

  const handleToggleMute = () => {
    if (videoRef.current) {
      const newMuteState = !isMuted;
      setIsMuted(newMuteState);
      videoRef.current.muted = newMuteState;
    }
  };

  const handleShare = async () => {
    const shareUrl = window.location.href;
    const shareData = {
      title: event?.title || 'Check out this event',
      text: event?.description || '',
      url: shareUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        toast.success('Shared successfully!');
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast.success('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatReach = (reach: number) => {
    if (reach >= 1000000) {
      return `${(reach / 1000000).toFixed(1)}M`;
    } else if (reach >= 1000) {
      return `${(reach / 1000).toFixed(1)}K`;
    }
    return reach.toString();
  };

  if (loading) {
    return (
      <div className="container-page py-14" aria-busy="true">
        <div className="h-3 w-32 animate-pulse rounded bg-background-secondary" />
        <div className="mt-5 h-12 w-2/3 animate-pulse rounded bg-background-secondary" />
        <div className="mt-10 grid gap-10 lg:grid-cols-12">
          <div className="aspect-[16/10] animate-pulse rounded-card bg-background-secondary lg:col-span-8" />
          <div className="h-80 animate-pulse rounded-card bg-background-secondary lg:col-span-4" />
        </div>
      </div>
    );
  }

  if (!event) {
    return null;
  }

  const selectedMedia = event.media_urls?.[selectedMediaIndex];
  // Broken media URLs fall back to the empty-state placeholder rather than a broken image.
  const currentMedia = selectedMedia && !failedMedia.includes(selectedMedia) ? selectedMedia : undefined;
  const markFailed = (url: string) => setFailedMedia((prev) => (prev.includes(url) ? prev : [...prev, url]));
  const isCurrentVideo = currentMedia ? isVideoUrl(currentMedia) : false;
  const organiser = event.creator?.company_name || event.organization_name || event.creator?.contact_person_name;
  const dateLabel =
    event.end_date && event.end_date !== event.start_date
      ? `${formatDate(event.start_date)} – ${formatDate(event.end_date)}`
      : formatDate(event.start_date);

  const facts = [
    { label: 'Expected reach', value: `${formatReach(event.reach)}+` },
    event.footfall ? { label: 'Footfall', value: formatReach(event.footfall) } : null,
    { label: 'Dates', value: dateLabel },
    { label: 'Location', value: event.location },
    organiser ? { label: 'Organiser', value: organiser } : null,
  ].filter(Boolean) as { label: string; value: string }[];

  const sections = [
    { title: 'About the event', body: event.description },
    { title: 'What sponsors get', body: event.benefits },
    { title: 'What the organiser is looking for', body: event.requirements },
  ].filter((section) => section.body);

  return (
    <>
      <div className="container-page py-10 lg:py-14">
        <Link
          href="/#opportunities"
          className="inline-flex items-center gap-1.5 text-sm text-text-secondary transition-colors hover:text-text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Opportunities
        </Link>

        <header className="mt-8 flex flex-col gap-6 border-b border-border pb-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              {event.category && (
                <span className="rounded-full border border-border px-2.5 py-0.5 text-xs text-text-secondary">{event.category.name}</span>
              )}
              {event.is_verified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">
                  <BadgeCheck className="h-3.5 w-3.5" /> Verified
                </span>
              )}
              {event.status === 'active' && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-0.5 text-xs text-text-secondary">
                  <span className="h-1.5 w-1.5 rounded-full bg-success" /> Open for sponsors
                </span>
              )}
            </div>
            <h1 className="mt-4 text-4xl text-text-primary sm:text-5xl">{event.title}</h1>
            <p className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-text-secondary">
              <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4" />{event.location}</span>
              <span className="inline-flex items-center gap-1.5"><Calendar className="h-4 w-4" />{dateLabel}</span>
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={handleShare} className="self-start sm:self-auto">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </header>

        <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-8">
            {/* Gallery */}
            <div className="group relative aspect-[16/10] overflow-hidden rounded-card border border-border bg-brand-50">
              {currentMedia ? (
                isCurrentVideo ? (
                  <>
                    <video ref={videoRef} src={currentMedia} onError={() => markFailed(currentMedia)} className="h-full w-full object-cover" autoPlay loop muted={isMuted} playsInline />
                    <button
                      type="button"
                      onClick={handleToggleMute}
                      aria-label={isMuted ? 'Unmute video' : 'Mute video'}
                      className="absolute right-4 top-4 rounded-full bg-black/50 p-2.5 text-white hover:bg-black/70"
                    >
                      {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                    </button>
                  </>
                ) : (
                  <button type="button" onClick={() => setIsMediaModalOpen(true)} className="h-full w-full" aria-label="View full size">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={currentMedia} alt={event.title} onError={() => markFailed(currentMedia)} className="h-full w-full object-cover" />
                  </button>
                )
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-text-muted">No media yet</div>
              )}
              {currentMedia && (
                <button
                  type="button"
                  onClick={() => setIsMediaModalOpen(true)}
                  aria-label="Open media full screen"
                  className="absolute bottom-4 right-4 rounded-full bg-black/50 p-2.5 text-white opacity-0 transition-opacity hover:bg-black/70 group-hover:opacity-100 focus:opacity-100"
                >
                  <Expand className="h-4 w-4" />
                </button>
              )}
            </div>

            {event.media_urls && event.media_urls.length > 1 && (
              <div className="mt-3 flex gap-3 overflow-x-auto no-scrollbar">
                {event.media_urls.map((url, index) => (
                  <button
                    key={url + index}
                    type="button"
                    onClick={() => setSelectedMediaIndex(index)}
                    aria-label={`Show media ${index + 1}`}
                    className={`relative aspect-[4/3] w-24 shrink-0 overflow-hidden rounded-lg border transition ${
                      selectedMediaIndex === index ? 'border-brand-600 ring-1 ring-brand-600' : 'border-border opacity-70 hover:opacity-100'
                    }`}
                  >
                    {isVideoUrl(url) ? (
                      <video src={url} className="h-full w-full object-cover" muted playsInline />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={url} alt="" className="h-full w-full object-cover" />
                    )}
                  </button>
                ))}
              </div>
            )}

            <div className="mt-12 divide-y divide-border">
              {sections.map((section) => (
                <section key={section.title} className="py-8 first:pt-0">
                  <h2 className="text-2xl text-text-primary">{section.title}</h2>
                  <p className="mt-4 whitespace-pre-wrap leading-relaxed text-text-secondary">{section.body}</p>
                </section>
              ))}
            </div>
          </div>

          {/* Sponsorship summary */}
          <aside className="lg:col-span-4">
            <div className="rounded-card bg-navy p-6 text-white lg:sticky lg:top-[calc(var(--nav-height)+1.5rem)]">
              <p className="text-sm text-white/60">Sponsorship ask</p>
              <p className="mt-2 font-display text-3xl text-white">
                {formatCurrency(event.price_range.min)} – {formatCurrency(event.price_range.max)}
              </p>
              <dl className="mt-6 divide-y divide-white/15 border-y border-white/15">
                {facts.map((fact) => (
                  <div key={fact.label} className="flex justify-between gap-4 py-3 text-sm">
                    <dt className="text-white/60">{fact.label}</dt>
                    <dd className="text-right font-medium text-white">{fact.value}</dd>
                  </div>
                ))}
              </dl>
              <Button href={SIGN_IN_URL} size="lg" variant="inverse" className="mt-6 w-full">
                Express interest
              </Button>
              <p className="mt-3 text-center text-xs text-white/60">
                Sign in or create a free account to connect with the organiser.
              </p>
            </div>
          </aside>
        </div>
      </div>

      {/* Media Modal */}
      <AnimatePresence>
        {isMediaModalOpen && currentMedia && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
            onClick={() => setIsMediaModalOpen(false)}
          >
            <button
              onClick={() => setIsMediaModalOpen(false)}
              className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="max-w-7xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              {isCurrentVideo ? (
                <div className="relative">
                  <video
                    src={currentMedia}
                    className="w-full h-auto max-h-[90vh] rounded-lg"
                    autoPlay
                    loop
                    muted={isMuted}
                    playsInline
                    controls
                  />
                </div>
              ) : (
                <img
                  src={currentMedia}
                  alt={event.title}
                  className="w-full h-auto max-h-[90vh] object-contain rounded-lg"
                />
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
