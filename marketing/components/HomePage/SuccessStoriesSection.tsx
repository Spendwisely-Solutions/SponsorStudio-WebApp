'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { SuccessStory as SuccessStoryType } from './Home';
import SectionHeader from '../ui/SectionHeader';
import Button from '../ui/Button';

interface SuccessStoriesSectionProps {
  loading: boolean;
  successStories: SuccessStoryType[];
}

// Pixels of vertical scroll per pixel of sideways travel. Above 1 the row moves slower than the wheel.
const SCROLL_PER_PX = 1.8;
// Share of the pinned scroll spent holding still before the row starts and after it ends,
// so the first card settles in and the last card rests on screen before the section leaves.
const HOLD_START = 0.1;
const HOLD_END = 0.2;
const TRAVEL = [HOLD_START, 1 - HOLD_END];

const cardSize = 'aspect-[4/5] w-[80vw] shrink-0 snap-start sm:w-[24rem] lg:w-[28rem]';

function StoryCard({ story, drift }: { story: SuccessStoryType; drift?: MotionValue<string> }) {
  return (
    <Link href={`/stories/${story.id}`} className={`group relative block overflow-hidden rounded-card bg-navy-soft ${cardSize}`}>
      {/* Story posters come from Supabase storage with unknown dimensions. */}
      <motion.img
        src={story.preview_image}
        alt=""
        decoding="async"
        draggable={false}
        // The photo is slightly larger than its frame and drifts against the scroll for depth.
        style={drift ? { x: drift } : undefined}
        className="absolute inset-0 h-full w-full scale-[1.12] object-cover transition-[filter] duration-700 group-hover:brightness-110"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/0" />
      <div className="absolute inset-x-0 bottom-0 p-6 sm:p-7">
        <h3 className="font-display text-2xl leading-tight text-white sm:text-3xl">{story.title}</h3>
        {story.preview_text && <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-white/70">{story.preview_text}</p>}
        <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-white">
          Read story
          <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}

function EndCard() {
  return (
    <Link
      href="/stories"
      className={`group flex flex-col justify-end rounded-card border border-white/15 p-7 transition-colors duration-300 hover:bg-white/5 ${cardSize}`}
    >
      <p className="font-display text-3xl leading-tight text-white sm:text-4xl">
        Every partnership <span className="italic">has a story.</span>
      </p>
      <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-white">
        See all success stories
        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
      </span>
    </Link>
  );
}

function Header() {
  return (
    <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
      <SectionHeader
        tone="dark"
        title={
          <>
            Partnerships that <span className="italic">came together</span>
          </>
        }
        description="Events and brands that found each other on Sponsor Studio."
      />
      <Button href="/stories" variant="outline-inverse" className="shrink-0 self-start sm:self-auto">
        View all stories
      </Button>
    </div>
  );
}

/**
 * On desktop the section pins while vertical scrolling glides the row of stories
 * sideways. On smaller screens, and for reduced-motion visitors, it is a
 * swipeable row instead.
 */
const SuccessStoriesSection: React.FC<SuccessStoriesSectionProps> = ({ loading, successStories }) => {
  const stories = successStories.filter((story) => !story.is_blog);
  const reduceMotion = useReducedMotion();
  const [isDesktop, setIsDesktop] = useState(false);
  const [distance, setDistance] = useState(0);
  const [active, setActive] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const query = window.matchMedia('(min-width: 1024px)');
    const update = () => setIsDesktop(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  const pinned = isDesktop && !reduceMotion && stories.length > 2;

  // How far the track must travel so its last card lines up with the right edge.
  useEffect(() => {
    if (!pinned || !trackRef.current) return;
    const track = trackRef.current;
    const measure = () => setDistance(Math.max(0, track.scrollWidth - track.clientWidth));
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    return () => observer.disconnect();
  }, [pinned, stories.length]);

  // Only track the section while it is pinned; otherwise the ref may not be mounted
  // (e.g. when there are no stories) and Motion would throw.
  const { scrollYProgress } = useScroll({ target: pinned ? sectionRef : undefined, offset: ['start start', 'end end'] });
  // A soft, heavier spring between scroll and movement makes the row glide and ease to a stop
  // instead of tracking every wheel tick.
  const progress = useSpring(scrollYProgress, { stiffness: 38, damping: 18, mass: 0.8, restDelta: 0.0005 });
  const x = useTransform(progress, TRAVEL, [0, -distance]);
  const drift = useTransform(progress, TRAVEL, ['-5%', '5%']);
  const bar = useTransform(progress, TRAVEL, [0.06, 1]);

  useMotionValueEvent(progress, 'change', (p) => {
    const travelled = Math.min(1, Math.max(0, (p - TRAVEL[0]) / (TRAVEL[1] - TRAVEL[0])));
    setActive(Math.min(stories.length - 1, Math.round(travelled * (stories.length - 1))));
  });

  const scrollRoom = (distance * SCROLL_PER_PX) / (TRAVEL[1] - TRAVEL[0]);

  if (!loading && stories.length === 0) return null;

  if (!pinned) {
    return (
      <section id="success" className="bg-navy py-16 text-white lg:py-24">
        <div className="container-page">
          <Header />
        </div>
        <div className="container-page mt-12">
          {loading ? (
            <div className="flex gap-4 overflow-hidden">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className={`animate-pulse rounded-card bg-white/5 ${cardSize}`} />
              ))}
            </div>
          ) : (
            <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-4 overflow-x-auto px-4 pb-2 sm:-mx-6 sm:scroll-px-6 sm:px-6">
              {stories.map((story) => (
                <StoryCard key={story.id} story={story} />
              ))}
              <EndCard />
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <section
      id="success"
      ref={sectionRef}
      className="relative overflow-clip bg-navy text-white"
      // Room for the slowed-down travel plus the holds at either end.
      style={{ height: `calc(100vh - var(--nav-height) + ${scrollRoom}px)` }}
    >
      <div className="sticky top-[var(--nav-height)] flex h-[calc(100vh-var(--nav-height))] flex-col justify-center overflow-hidden py-12">
        <div className="container-page">
          <Header />
        </div>
        <div className="container-page mt-10">
          <motion.div ref={trackRef} style={{ x }} className="flex gap-6 will-change-transform">
            {stories.map((story) => (
              <StoryCard key={story.id} story={story} drift={drift} />
            ))}
            <EndCard />
          </motion.div>
        </div>
        <div className="container-page mt-10 flex items-center gap-6">
          <span className="font-mono text-xs tabular-nums text-white/60">
            {String(active + 1).padStart(2, '0')} / {String(stories.length).padStart(2, '0')}
          </span>
          <div className="h-px flex-1 bg-white/15">
            <motion.div className="h-full origin-left bg-white" style={{ scaleX: bar }} />
          </div>
        </div>
      </div>
    </section>
  );
};

export default SuccessStoriesSection;
