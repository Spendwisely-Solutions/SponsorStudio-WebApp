'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  BarChart2,
  Calendar,
  Check,
  FileSignature,
  FileText,
  Home,
  Lock,
  MessageSquare,
  ShieldCheck,
  Video,
} from 'lucide-react';
import { useIntroReady } from '../motion/Intro';
import { mockBrands, mockEvent } from '../../lib/mockEvents';
import HeroProductDemo from './HeroProductDemo';

// The hero's product reel: one screen per headline feature, for both sides of the
// marketplace. The swipe demo is interactive; the others are short animated screens.
// All names and figures are sample data.

type Audience = 'Brands' | 'Organisers' | 'Both';

const EASE = [0.22, 1, 0.36, 1] as const;

/** Rise-in used by the rows of each screen, staggered by index. */
const rise = (i: number, base = 0.15) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay: base + i * 0.12, ease: EASE },
});

/** The app's sidebar and page title, shared by the screens below. */
function Shell({ title, sidebar, children }: { title: string; sidebar: 'brand' | 'organizer'; children: React.ReactNode }) {
  const nav = [
    { icon: Home, active: true },
    { icon: MessageSquare },
    { icon: Calendar },
    { icon: sidebar === 'brand' ? FileText : BarChart2 },
  ];
  return (
    <div className="flex h-full bg-surface">
      <nav className="hidden w-14 shrink-0 flex-col items-center gap-2 border-r border-border py-4 sm:flex" aria-hidden="true">
        {nav.map(({ icon: Icon, active }, i) => (
          <span key={i} className={`flex h-9 w-9 items-center justify-center rounded-lg ${active ? 'bg-brand-50 text-brand-700' : 'text-text-muted'}`}>
            <Icon className="h-4 w-4" />
          </span>
        ))}
      </nav>
      <div className="min-w-0 flex-1 bg-background-secondary p-3 sm:p-4">
        <p className="text-sm font-semibold text-text-primary">{title}</p>
        <div className="mt-3">{children}</div>
      </div>
    </div>
  );
}

function RiskReport() {
  const event = mockEvent('vibefest');
  const factors = [
    { label: 'Organiser track record', score: 88 },
    { label: 'Audience verification', score: 81 },
    { label: 'Past sponsor feedback', score: 92 },
    { label: 'Permits and venue', score: 70 },
  ];
  return (
    <Shell title="Risk analysis report" sidebar="brand">
      <div className="rounded-xl border border-border bg-surface p-3 text-[11px]">
        <motion.div {...rise(0)} className="flex items-center gap-3">
          <div className="relative h-11 w-14 shrink-0 overflow-hidden rounded-lg">
            <Image src={event.image} alt="" fill sizes="56px" className="object-cover" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-text-primary">{event.title}</p>
            <p className="text-text-muted">{event.city} · {event.dates}</p>
          </div>
          <div className="text-right">
            <p className="font-display text-3xl leading-none text-text-primary">83</p>
            <p className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-success/10 px-1.5 py-0.5 font-medium text-success">
              <ShieldCheck className="h-3 w-3" /> Low risk
            </p>
          </div>
        </motion.div>
        <ul className="mt-4 space-y-2.5">
          {factors.map((factor, i) => (
            <motion.li key={factor.label} {...rise(i, 0.3)}>
              <div className="flex justify-between text-text-secondary">
                <span>{factor.label}</span>
                <span className="font-medium tabular-nums text-text-primary">{factor.score}</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-background-secondary">
                <motion.div
                  className={`h-full rounded-full ${factor.score >= 80 ? 'bg-brand-600' : 'bg-warning'}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${factor.score}%` }}
                  transition={{ duration: 0.9, delay: 0.45 + i * 0.12, ease: EASE }}
                />
              </div>
            </motion.li>
          ))}
        </ul>
        <motion.p {...rise(5, 0.3)} className="mt-4 rounded-lg bg-background-secondary p-2.5 leading-relaxed text-text-secondary">
          Established organiser with three past editions. Confirm the stage permit before signing.
        </motion.p>
      </div>
    </Shell>
  );
}

function PostEventReport() {
  const event = mockEvent('founders-summit');
  const metrics = [
    { label: 'Footfall', value: '4,820', note: '+7% on target' },
    { label: 'Brand impressions', value: '1.2M', note: 'On-ground and social' },
    { label: 'Leads captured', value: '640', note: 'At the booth' },
  ];
  const days = [42, 68, 55, 90, 76];
  return (
    <Shell title="Post-event report" sidebar="brand">
      <div className="space-y-3 text-[11px]">
        <motion.div {...rise(0)} className="flex items-center justify-between rounded-xl border border-border bg-surface p-3">
          <div>
            <p className="text-sm font-semibold text-text-primary">{event.title}</p>
            <p className="text-text-muted">Delivered for Northwind Beverages</p>
          </div>
          <span className="rounded-full bg-success/10 px-2 py-0.5 font-medium text-success">Complete</span>
        </motion.div>
        <div className="grid grid-cols-3 gap-2">
          {metrics.map((metric, i) => (
            <motion.div key={metric.label} {...rise(i, 0.25)} className="rounded-xl border border-border bg-surface p-2.5">
              <p className="text-text-muted">{metric.label}</p>
              <p className="mt-1 font-display text-2xl leading-none text-text-primary">{metric.value}</p>
              <p className="mt-1 text-[10px] text-text-muted">{metric.note}</p>
            </motion.div>
          ))}
        </div>
        <motion.div {...rise(3, 0.25)} className="rounded-xl border border-border bg-surface p-3">
          <p className="text-text-muted">Brand-zone visits by hour</p>
          <div className="mt-3 flex h-20 items-end gap-3">
            {days.map((height, i) => (
              <motion.div
                key={i}
                className={`flex-1 rounded-t-md ${i === 3 ? 'bg-brand-600' : 'bg-brand-100'}`}
                initial={{ height: 0 }}
                animate={{ height: `${height}%` }}
                transition={{ duration: 0.8, delay: 0.6 + i * 0.08, ease: EASE }}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </Shell>
  );
}

function OrganizerDashboard() {
  const event = mockEvent('neon-nights');
  return (
    <Shell title="Opportunity Dashboard" sidebar="organizer">
      <div className="space-y-3 text-[11px]">
        <div className="grid grid-cols-3 gap-2">
          {[
            ['Live listings', '2'],
            ['Interested brands', '7'],
            ['Secured', '₹14.5L'],
          ].map(([label, value], i) => (
            <motion.div key={label} {...rise(i)} className="rounded-xl border border-border bg-surface p-2.5">
              <p className="text-text-muted">{label}</p>
              <p className="mt-1 font-display text-2xl leading-none text-text-primary">{value}</p>
            </motion.div>
          ))}
        </div>
        <motion.div {...rise(3)} className="overflow-hidden rounded-xl border border-border bg-surface">
          <div className="flex items-center gap-3 p-2.5">
            <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded-lg">
              <Image src={event.image} alt="" fill sizes="56px" className="object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-text-primary">{event.title}</p>
              <p className="text-text-muted">{event.city} · {event.dates}</p>
            </div>
            <span className="rounded-full bg-success/10 px-2 py-0.5 font-medium text-success">Live</span>
          </div>
          <div className="border-t border-border bg-background-secondary/60 p-2.5">
            <p className="font-medium text-text-primary">3 brands are interested</p>
            <div className="mt-2 flex items-center justify-between gap-2">
              <div className="flex -space-x-1.5">
                {/* Brand names stay hidden until the organiser unlocks them. */}
                {mockBrands.slice(0, 3).map((brand, i) => (
                  <span
                    key={brand.name}
                    className={`flex h-7 w-7 items-center justify-center rounded-full border-2 border-surface text-[10px] font-semibold text-white blur-[1px] ${['bg-brand-600', 'bg-warning', 'bg-success'][i]}`}
                  >
                    {brand.initial}
                  </span>
                ))}
              </div>
              <motion.span
                {...rise(4, 0.4)}
                className="inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1.5 font-medium text-white"
              >
                <Lock className="h-3 w-3" /> Unlock brands · ₹5,000
              </motion.span>
            </div>
          </div>
        </motion.div>
        <motion.div {...rise(5)} className="flex items-center justify-between rounded-xl border border-border bg-surface p-2.5">
          <p className="text-text-secondary">Campus Spark Carnival</p>
          <span className="rounded-full bg-warning/10 px-2 py-0.5 font-medium text-warning">Under review</span>
        </motion.div>
      </div>
    </Shell>
  );
}

function MouSigning() {
  const [first] = mockBrands;
  const clauses = ['Package: Powered by, ₹12,00,000', 'Deliverables: stage branding, 2 activations, social posts', 'Payment: 50% on signing, 50% after the event'];
  return (
    <Shell title="Sponsorship MOU" sidebar="organizer">
      <div className="rounded-xl border border-border bg-surface p-3 text-[11px]">
        <motion.div {...rise(0)} className="flex items-center gap-2 border-b border-border pb-2.5">
          <FileSignature className="h-4 w-4 text-brand-600" />
          <p className="font-semibold text-text-primary">VibeFest Carnival 2026 × {first.name}</p>
        </motion.div>
        <ul className="mt-3 space-y-2">
          {clauses.map((clause, i) => (
            <motion.li key={clause} {...rise(i, 0.25)} className="flex gap-2 text-text-secondary">
              <span className="font-mono text-[10px] text-text-muted">{String(i + 1).padStart(2, '0')}</span>
              {clause}
            </motion.li>
          ))}
        </ul>
        <div className="mt-4 rounded-lg border border-border p-2.5">
          <p className="text-text-muted">Signed for the brand</p>
          <div className="relative mt-1 h-9 border-b border-dashed border-border-hover">
            <svg viewBox="0 0 120 30" className="absolute bottom-1 left-0 h-8 w-32 text-brand-700" fill="none">
              <motion.path
                d="M4 22 C 14 4, 22 4, 26 18 S 38 28, 46 12 S 60 6, 64 20 S 84 24, 92 10 L 116 14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 0.9, delay: 1.1, ease: 'easeInOut' }}
              />
            </svg>
          </div>
          <p className="mt-1 font-medium text-text-primary">Sarah Jenkins, {first.name}</p>
        </div>
      </div>
    </Shell>
  );
}

function MeetAndAgree() {
  const slots = ['Wed 4:00 pm', 'Thu 11:30 am', 'Fri 3:00 pm'];
  return (
    <Shell title="Meetings" sidebar="brand">
      <div className="space-y-3 text-[11px]">
        <motion.div {...rise(0)} className="rounded-xl border border-border bg-surface p-3">
          <p className="font-semibold text-text-primary">Pick a time with Spark Events</p>
          <div className="mt-2.5 grid grid-cols-3 gap-2">
            {slots.map((slot, i) => (
              <motion.span
                key={slot}
                initial={{ backgroundColor: 'rgba(0,0,0,0)', color: '#4a5168' }}
                animate={i === 1 ? { backgroundColor: '#2a3a92', color: '#ffffff' } : {}}
                transition={{ delay: 0.9, duration: 0.25 }}
                className="rounded-lg border border-border py-2 text-center font-medium"
              >
                {slot}
              </motion.span>
            ))}
          </div>
        </motion.div>
        <motion.div {...rise(1, 1.2)} className="flex items-center gap-3 rounded-xl border border-border bg-surface p-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
            <Video className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-text-primary">Sponsorship call · Thu, 11:30 am</p>
            <p className="text-text-muted">Northwind Beverages, Spark Events and Sponsor Studio</p>
          </div>
          <span className="rounded-md bg-success px-2 py-1 font-medium text-white">Join</span>
        </motion.div>
        <motion.div {...rise(2, 1.5)} className="rounded-xl border border-success/25 bg-success/5 p-3">
          <p className="flex items-center gap-1.5 font-semibold text-success">
            <Check className="h-3.5 w-3.5" /> Agreed after the call
          </p>
          <p className="mt-1 text-text-secondary">Powered by package, ₹12L. MOU sent to both sides for signing.</p>
        </motion.div>
      </div>
    </Shell>
  );
}

const features: { id: string; label: string; audience: Audience; duration: number; Screen: React.FC }[] = [
  { id: 'swipe', label: 'Swipe to match', audience: 'Brands', duration: 10500, Screen: HeroProductDemo },
  { id: 'risk', label: 'Risk report', audience: 'Brands', duration: 5500, Screen: RiskReport },
  { id: 'report', label: 'Event report', audience: 'Brands', duration: 5500, Screen: PostEventReport },
  { id: 'organiser', label: 'Organiser view', audience: 'Organisers', duration: 5500, Screen: OrganizerDashboard },
  { id: 'meet', label: 'Meet and agree', audience: 'Both', duration: 5500, Screen: MeetAndAgree },
  { id: 'mou', label: 'Sign the MOU', audience: 'Both', duration: 5500, Screen: MouSigning },
];

export default function HeroFeatureReel() {
  const reduceMotion = useReducedMotion();
  const introReady = useIntroReady();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const feature = features[active];
  const autoplay = introReady && !reduceMotion && !paused;

  useEffect(() => {
    if (!autoplay) return;
    const t = setTimeout(() => setActive((i) => (i + 1) % features.length), feature.duration);
    return () => clearTimeout(t);
  }, [autoplay, active, feature.duration]);

  return (
    <div
      className="overflow-hidden rounded-2xl border border-border bg-surface shadow-pop"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
    >
      {/* Feature tabs */}
      <div className="grid grid-cols-3 gap-1 border-b border-border p-1.5" role="tablist" aria-label="Product features">
        {features.map((f, i) => {
          const selected = i === active;
          return (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => setActive(i)}
              className={`relative min-w-0 overflow-hidden rounded-lg px-2.5 py-1.5 text-left transition-colors ${
                selected ? 'bg-background-secondary' : 'hover:bg-surface-hover'
              }`}
            >
              <span className={`block text-[10px] ${selected ? 'text-brand-700' : 'text-text-muted'}`}>{f.audience}</span>
              <span className={`block truncate text-xs font-medium ${selected ? 'text-text-primary' : 'text-text-secondary'}`}>{f.label}</span>
              {selected && autoplay && (
                <motion.span
                  key={`${f.id}-${active}`}
                  className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-brand-600"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: f.duration / 1000, ease: 'linear' }}
                />
              )}
            </button>
          );
        })}
      </div>

      <div className="relative h-[460px]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={feature.id}
            className="absolute inset-0"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <feature.Screen />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
