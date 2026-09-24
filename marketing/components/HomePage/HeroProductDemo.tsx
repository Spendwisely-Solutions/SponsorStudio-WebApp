'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type PanInfo,
} from 'framer-motion';
import {
  BadgeCheck,
  Calendar,
  CalendarDays,
  Coins,
  FileText,
  Filter,
  Heart,
  HelpCircle,
  Home,
  Lock,
  MapPin,
  MessageSquare,
  Plus,
  Search,
  ShieldCheck,
  Tag,
  Users,
  Video,
  X,
} from 'lucide-react';
import Image from 'next/image';
import { useIntroReady } from '../motion/Intro';
import { mockEvent } from '../../lib/mockEvents';

// A miniature of the post-login brand dashboard, laid out like the real one:
// sidebar, credit bar, Discover / Matches tabs, the swipe card with its details,
// and the Matches view with risk analysis and meetings. Listings are samples.

type Action = 'like' | 'pass';
type View = 'discover' | 'matches';

type Listing = {
  title: string;
  category: string;
  place: string;
  reach: string;
  date: string;
  price: string;
  image: string;
};

const listings: Listing[] = ['vibefest', 'founders-summit', 'coastal-run', 'neon-nights'].map((id) => {
  const event = mockEvent(id);
  return {
    title: event.title,
    category: event.category,
    place: event.city,
    reach: event.reach.split(' ')[0],
    date: event.dates,
    price: event.price,
    image: event.image,
  };
});

const START_CREDITS = 2450;
const LIKE_COST = 50;
const RISK_COST = 500;
const SWIPE_DISTANCE = 460;

type Match = { id: number; title: string; status: 'Pending' | 'Accepted'; riskRequested?: boolean; meeting?: string };

function Cover({ listing }: { listing: Listing }) {
  return (
    <div className="absolute inset-0 bg-ink">
      <Image src={listing.image} alt="" fill sizes="(min-width: 1024px) 320px, 60vw" draggable={false} className="object-cover" />
    </div>
  );
}

function SwipeCard({ listing, command, onSwiped }: { listing: Listing; command: Action | null; onSwiped: (a: Action) => void }) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-240, 240], [-14, 14]);
  const likeOpacity = useTransform(x, [30, 140], [0, 1]);
  const passOpacity = useTransform(x, [-140, -30], [1, 0]);
  const done = useRef(false);

  const fling = useCallback(
    (action: Action) => {
      if (done.current) return;
      done.current = true;
      animate(x, action === 'like' ? SWIPE_DISTANCE : -SWIPE_DISTANCE, {
        duration: 0.55,
        ease: [0.22, 1, 0.36, 1],
        onComplete: () => onSwiped(action),
      });
    },
    [x, onSwiped]
  );

  useEffect(() => {
    if (!command) return;
    // Lean the card first, like a thumb pulling it, then fling it.
    const lean = animate(x, command === 'like' ? 90 : -90, { duration: 0.45, ease: 'easeOut' });
    const t = setTimeout(() => fling(command), 520);
    return () => {
      lean.stop();
      clearTimeout(t);
    };
  }, [command, x, fling]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x > 110 || info.velocity.x > 600) fling('like');
    else if (info.offset.x < -110 || info.velocity.x < -600) fling('pass');
    else animate(x, 0, { type: 'spring', stiffness: 400, damping: 30 });
  };

  return (
    <motion.div
      className="absolute inset-0 cursor-grab touch-pan-y overflow-hidden rounded-xl active:cursor-grabbing"
      style={{ x, rotate }}
      drag="x"
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.9}
      onDragEnd={onDragEnd}
      initial={{ scale: 0.95, y: 8 }}
      animate={{ scale: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      <Cover listing={listing} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
      <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-[10px] font-medium text-brand-700">
        <BadgeCheck className="h-3 w-3" /> Verified
      </span>
      <motion.div style={{ opacity: likeOpacity }} className="pointer-events-none absolute left-4 top-12 -rotate-12 rounded-md border-[3px] border-success px-2 py-0.5 text-xl font-bold tracking-wider text-success">
        LIKE
      </motion.div>
      <motion.div style={{ opacity: passOpacity }} className="pointer-events-none absolute right-4 top-12 rotate-12 rounded-md border-[3px] border-danger px-2 py-0.5 text-xl font-bold tracking-wider text-danger">
        NOPE
      </motion.div>
      {/* Like / dislike, stacked on the right edge as in the app */}
      <div className="absolute right-2.5 top-1/2 flex -translate-y-1/2 flex-col gap-2">
        <button type="button" aria-label="Like" onClick={() => fling('like')} className="flex h-9 w-9 items-center justify-center rounded-full bg-success text-white shadow-pop">
          <Heart className="h-4 w-4" fill="currentColor" />
        </button>
        <button type="button" aria-label="Pass" onClick={() => fling('pass')} className="flex h-9 w-9 items-center justify-center rounded-full bg-danger text-white shadow-pop">
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3 text-white">
        <div className="min-w-0">
          <p className="truncate text-base font-semibold">{listing.title}</p>
          <p className="flex items-center gap-1 text-[11px] text-white/80">
            <MapPin className="h-3 w-3 shrink-0" /> <span className="truncate">{listing.place}</span>
          </p>
        </div>
        <div className="shrink-0 space-y-0.5 text-right text-[11px] text-white/80">
          <p className="flex items-center justify-end gap-1"><Users className="h-3 w-3" /> {listing.reach}</p>
          <p className="flex items-center justify-end gap-1"><Calendar className="h-3 w-3" /> {listing.date}</p>
        </div>
      </div>
    </motion.div>
  );
}

function DiscoverView({
  index,
  command,
  onSwiped,
}: {
  index: number;
  command: Action | null;
  onSwiped: (a: Action) => void;
}) {
  const current = listings[index % listings.length];
  const next = listings[(index + 1) % listings.length];
  return (
    <div className="grid gap-3 sm:grid-cols-5">
      <div className="relative h-[250px] sm:col-span-3 sm:h-[270px]">
        <div className="absolute inset-0 translate-y-2 scale-[0.95] overflow-hidden rounded-xl">
          <Cover listing={next} />
          <div className="absolute inset-0 bg-black/25" />
        </div>
        <SwipeCard key={index} listing={current} command={command} onSwiped={onSwiped} />
      </div>
      {/* Listing details shown under the card in the app */}
      <dl className="hidden space-y-2 text-[11px] sm:col-span-2 sm:block">
        <div className="rounded-lg border border-border bg-surface p-2.5">
          <dt className="flex items-center gap-1.5 text-text-muted"><Coins className="h-3 w-3" /> Price range</dt>
          <dd className="mt-0.5 font-medium text-text-primary">{current.price}</dd>
        </div>
        <div className="rounded-lg border border-border bg-surface p-2.5">
          <dt className="flex items-center gap-1.5 text-text-muted"><FileText className="h-3 w-3" /> Sponsorship brochure</dt>
          <dd className="mt-1 inline-flex items-center gap-1 rounded-md bg-brand-50 px-1.5 py-0.5 font-medium text-brand-700">
            <Lock className="h-3 w-3" /> Unlock · 100 credits
          </dd>
        </div>
        <div className="rounded-lg border border-border bg-surface p-2.5">
          <dt className="flex items-center gap-1.5 text-text-muted"><Tag className="h-3 w-3" /> Category</dt>
          <dd className="mt-0.5 font-medium text-text-primary">{current.category}</dd>
        </div>
      </dl>
    </div>
  );
}

function MatchesView({ matches, onRequestRisk }: { matches: Match[]; onRequestRisk: (id: number) => void }) {
  const pending = matches.filter((m) => m.status === 'Pending');
  const accepted = matches.filter((m) => m.status === 'Accepted');
  return (
    <div className="h-[270px] space-y-3 overflow-hidden text-[11px]">
      <div>
        <p className="mb-1.5 flex items-center gap-1.5 font-medium text-text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-warning" /> Pending response
        </p>
        <ul className="space-y-1.5">
          <AnimatePresence initial={false}>
            {pending.slice(0, 2).map((m) => (
              <motion.li
                key={m.id}
                layout
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between gap-2 rounded-lg border border-warning/25 bg-warning/5 p-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium text-text-primary">{m.title}</p>
                  <p className="text-text-muted">Waiting for the organiser</p>
                </div>
                <button
                  type="button"
                  onClick={() => onRequestRisk(m.id)}
                  disabled={m.riskRequested}
                  className={`inline-flex shrink-0 items-center gap-1 rounded-md px-2 py-1 font-medium transition-colors ${
                    m.riskRequested ? 'bg-success/10 text-success' : 'bg-primary text-white'
                  }`}
                >
                  <ShieldCheck className="h-3 w-3" />
                  {m.riskRequested ? 'Risk analysis requested' : 'Request risk analysis'}
                </button>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>
      <div>
        <p className="mb-1.5 flex items-center gap-1.5 font-medium text-text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-success" /> Accepted matches
        </p>
        <ul className="space-y-1.5">
          {accepted.slice(0, 1).map((m) => (
            <li key={m.id} className="rounded-lg border border-border bg-surface p-2.5">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate font-medium text-text-primary">{m.title}</p>
                <span className="rounded-full bg-success/10 px-1.5 py-0.5 font-medium text-success">Accepted</span>
              </div>
              <p className="mt-1 flex items-center gap-1 text-text-secondary">
                <CalendarDays className="h-3 w-3" /> Meeting scheduled for {m.meeting}
              </p>
              <div className="mt-2 flex gap-1.5">
                <span className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-text-secondary">
                  <FileText className="h-3 w-3" /> View brochure
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-success px-2 py-1 font-medium text-white">
                  <Video className="h-3 w-3" /> Join meeting
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default function HeroProductDemo() {
  const reduceMotion = useReducedMotion();
  const introReady = useIntroReady();
  const [view, setView] = useState<View>('discover');
  const [index, setIndex] = useState(0);
  const [command, setCommand] = useState<Action | null>(null);
  const [credits, setCredits] = useState(START_CREDITS);
  const [paused, setPaused] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [matches, setMatches] = useState<Match[]>([
    { id: -1, title: 'Delhi Design Week Gala', status: 'Accepted', meeting: 'Thu, 11:00 AM' },
  ]);
  const matchId = useRef(0);

  const spend = (cost: number) => setCredits((c) => (c - cost < 600 ? START_CREDITS : c - cost));

  // The card on top is tracked in a ref so side effects stay out of state updaters
  // (React may run updaters twice in development).
  const indexRef = useRef(0);
  const onSwiped = useCallback((action: Action) => {
    const listing = listings[indexRef.current % listings.length];
    if (action === 'like') {
      spend(LIKE_COST);
      setToast(`Interest sent · −${LIKE_COST} credits`);
      const id = matchId.current++;
      setMatches((m) => [{ id, title: listing.title, status: 'Pending' as const }, ...m]);
    } else {
      setToast('Passed');
    }
    indexRef.current += 1;
    setIndex(indexRef.current);
    setCommand(null);
  }, []);

  const requestRisk = (id: number) => {
    setMatches((m) => m.map((x) => (x.id === id && !x.riskRequested ? { ...x, riskRequested: true } : x)));
    spend(RISK_COST);
    setToast(`Risk analysis requested · −${RISK_COST} credits`);
  };

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1600);
    return () => clearTimeout(t);
  }, [toast]);

  // Scripted tour: like a listing, pass one, open Matches, request a risk
  // analysis, then return to Discover. Pauses while the visitor interacts.
  useEffect(() => {
    if (!introReady || reduceMotion || paused || command) return;
    const script: { delay: number; run: () => void }[] = [
      { delay: 2200, run: () => setCommand('like') },
      { delay: 2000, run: () => setCommand('pass') },
      { delay: 1800, run: () => setView('matches') },
      {
        delay: 1500,
        run: () => {
          const target = matches.find((m) => m.status === 'Pending' && !m.riskRequested);
          if (target) requestRisk(target.id);
        },
      },
      { delay: 2600, run: () => setView('discover') },
    ];
    const current = script[step % script.length];
    const t = setTimeout(() => {
      current.run();
      setStep((s) => s + 1);
    }, current.delay);
    return () => clearTimeout(t);
    // requestRisk and matches are read at run time; step drives the sequence.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [introReady, reduceMotion, paused, command, step]);

  const pendingCount = matches.filter((m) => m.status === 'Pending').length;
  const nav = [
    { icon: Home, label: 'Dashboard', active: true },
    { icon: MessageSquare, label: 'Messages' },
    { icon: Calendar, label: 'Meetings' },
    { icon: FileText, label: 'Reports' },
  ];

  return (
    <div
      className="h-full bg-surface"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
    >
      <div className="flex h-full">
        {/* Sidebar */}
        <nav className="hidden w-14 shrink-0 flex-col items-center gap-2 border-r border-border bg-surface py-4 sm:flex" aria-hidden="true">
          {nav.map(({ icon: Icon, label, active }) => (
            <span
              key={label}
              title={label}
              className={`flex h-9 w-9 items-center justify-center rounded-lg ${active ? 'bg-brand-50 text-brand-700' : 'text-text-muted'}`}
            >
              <Icon className="h-4 w-4" />
            </span>
          ))}
        </nav>

        <div className="min-w-0 flex-1 bg-background-secondary p-3 sm:p-4">
          {/* Header */}
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-text-primary">Brand Dashboard</p>
            <div className="flex gap-1.5 text-text-muted">
              <span className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-surface"><Filter className="h-3.5 w-3.5" /></span>
              <span className="flex h-7 w-7 items-center justify-center rounded-md border border-border bg-surface"><Search className="h-3.5 w-3.5" /></span>
            </div>
          </div>

          {/* Credit bar */}
          <div className="mt-3 flex items-center justify-between gap-2 rounded-xl border border-border bg-surface p-2.5">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-50 text-brand-700"><Coins className="h-3.5 w-3.5" /></span>
              <p className="text-sm font-semibold tabular-nums text-text-primary">
                {credits.toLocaleString('en-IN')} <span className="text-xs font-normal text-text-muted">credits</span>
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="hidden items-center gap-1 text-brand-700 sm:inline-flex"><HelpCircle className="h-3.5 w-3.5" /> How credits work</span>
              <span className="inline-flex items-center gap-1 rounded-md bg-primary px-2 py-1 font-medium text-white"><Plus className="h-3 w-3" /> Add credits</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-3 flex border-b border-border text-xs" role="tablist">
            {(['discover', 'matches'] as View[]).map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                aria-selected={view === tab}
                onClick={() => setView(tab)}
                className={`relative -mb-px flex-1 border-b-2 pb-2 font-semibold transition-colors ${
                  view === tab ? 'border-brand-600 text-text-primary' : 'border-transparent text-text-muted hover:text-text-secondary'
                }`}
              >
                {tab === 'discover' ? 'Discover' : 'Matches'}
                {tab === 'matches' && pendingCount > 0 && (
                  <motion.span
                    key={pendingCount}
                    initial={{ scale: 0.6 }}
                    animate={{ scale: 1 }}
                    className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-warning px-1 text-[9px] font-bold text-white"
                  >
                    {pendingCount}
                  </motion.span>
                )}
              </button>
            ))}
          </div>

          <div className="mt-3">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={view}
                initial={{ opacity: 0, x: view === 'matches' ? 16 : -16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: view === 'matches' ? -16 : 16 }}
                transition={{ duration: 0.3 }}
              >
                {view === 'discover' ? (
                  <DiscoverView index={index} command={command} onSwiped={onSwiped} />
                ) : (
                  <MatchesView matches={matches} onRequestRisk={requestRisk} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Feedback line */}
          <div className="mt-2 flex h-6 items-center justify-center" aria-live="polite">
            <AnimatePresence mode="wait">
              {toast ? (
                <motion.p
                  key={toast}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-full bg-ink px-3 py-1 text-[11px] font-medium text-white"
                >
                  {toast}
                </motion.p>
              ) : (
                <motion.p key="hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-[11px] text-text-muted">
                  {view === 'discover' ? 'Drag the card, or tap ♥ / ✕' : 'Try requesting a risk analysis'}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
