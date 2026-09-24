'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useInView, useScroll, useSpring } from 'framer-motion';
import { ArrowRight, BadgeCheck, CalendarCheck, CheckCircle2, FileSignature, LineChart, Search, Send, Users } from 'lucide-react';

type Audience = 'brands' | 'organizers';

type Step = {
  title: string;
  description: string;
  detail: string;
  icon: React.ElementType;
};

// Steps follow the platform flow described in the product documentation.
const steps: Record<Audience, Step[]> = {
  brands: [
    {
      title: 'Discover verified listings',
      description: 'Browse events, creators and outdoor media filtered by audience, budget, category and city. Every listing has been checked by our team.',
      detail: 'Filters: category · budget · location',
      icon: Search,
    },
    {
      title: 'Express interest',
      description: 'Like a listing to tell the organiser you are interested. Unlock the full brochure or request a risk analysis before you commit.',
      detail: '50 credits per interest',
      icon: Send,
    },
    {
      title: 'Meet and agree terms',
      description: 'When the organiser accepts, we set up the meeting. Negotiate deliverables and close the deal with the paperwork handled.',
      detail: 'Match status: accepted → meeting',
      icon: CalendarCheck,
    },
    {
      title: 'Measure what you got',
      description: 'After the event, request a post-event report so the next budget conversation starts with real numbers.',
      detail: 'Post-event and risk reports',
      icon: LineChart,
    },
  ],
  organizers: [
    {
      title: 'List your event',
      description: 'Add your dates, audience, packages and brochure. Our team verifies the listing and you sign a simple MOU before it goes live.',
      detail: 'Free to list',
      icon: FileSignature,
    },
    {
      title: 'Get discovered by brands',
      description: 'Brands looking for your audience find your listing and express interest. You see every match in one dashboard.',
      detail: 'Verified badge on your listing',
      icon: BadgeCheck,
    },
    {
      title: 'Choose your sponsors',
      description: 'Unlock the brands that are interested, accept the ones that fit, and we arrange the meeting.',
      detail: '₹5,000 per event to unlock matches',
      icon: Users,
    },
    {
      title: 'Close the deal',
      description: 'Agree terms, deliver the sponsorship and track it from your dashboard. VIP listings get full support from our team.',
      detail: 'Commission only on closed deals',
      icon: CheckCircle2,
    },
  ],
};

function StepCard({ step, index, activeIndex, onActive }: { step: Step; index: number; activeIndex: number; onActive: (i: number) => void }) {
  const ref = useRef<HTMLLIElement>(null);
  // A step counts as current once its middle crosses the centre of the viewport.
  const inView = useInView(ref, { margin: '-45% 0px -45% 0px' });
  useEffect(() => {
    if (inView) onActive(index);
  }, [inView, index, onActive]);

  const isActive = activeIndex === index;
  const Icon = step.icon;
  return (
    <li ref={ref} className="lg:flex lg:min-h-[62vh] lg:items-center">
      <motion.div
        className={`w-full rounded-card border p-6 sm:p-8 transition-all duration-500 ${
          isActive
            ? 'border-white/30 bg-navy-soft shadow-pop scale-[1.01]'
            : 'border-white/10 bg-white/[0.03] opacity-70'
        }`}
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '0px 0px -15% 0px' }}
      >
        <div className="flex items-center justify-between">
          <span className={`font-mono text-xs ${isActive ? 'text-brand-300 font-semibold' : 'text-white/40'}`}>
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className={`flex h-10 w-10 items-center justify-center rounded-lg transition-colors ${
            isActive ? 'bg-brand-600 text-white' : 'bg-white/10 text-white/60'
          }`}>
            <Icon className="h-5 w-5" />
          </span>
        </div>
        <h3 className="mt-8 font-display text-3xl text-white sm:text-4xl">{step.title}</h3>
        <p className="mt-4 max-w-lg leading-relaxed text-white/80">{step.description}</p>
        <p className={`mt-8 inline-flex rounded-full border px-3 py-1 font-mono text-xs transition-colors ${
          isActive ? 'border-brand-300/40 bg-brand-500/20 text-brand-200' : 'border-white/15 text-white/60'
        }`}>
          {step.detail}
        </p>
      </motion.div>
    </li>
  );
}

const HowItWorks = ({ linkToPage = false }: { linkToPage?: boolean }) => {
  const [audience, setAudience] = useState<Audience>('brands');
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLOListElement>(null);

  // Progress line fills as the list of steps scrolls past the centre of the screen.
  const { scrollYProgress } = useScroll({ target: listRef, offset: ['start center', 'end center'] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, mass: 0.3 });

  const current = steps[audience];

  const switchAudience = (next: Audience) => {
    setAudience(next);
    setActive(0);
  };

  return (
    <section id="how-we-work" className="bg-navy py-20 text-white lg:py-28">
      <div className="container-page grid gap-12 lg:grid-cols-12 lg:gap-16">
        {/* Pinned column */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-[calc(var(--nav-height)+4rem)]">
            <h2 className="text-4xl text-white sm:text-5xl">
              From first match to <span className="italic">signed deal.</span>
            </h2>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-white/70">
              The same four steps, whichever side of the sponsorship you&apos;re on.
            </p>

            <div role="tablist" aria-label="How it works for" className="mt-8 inline-flex rounded-xl border border-white/15 bg-white/5 p-1">
              {(['brands', 'organizers'] as const).map((id) => (
                <button
                  key={id}
                  type="button"
                  role="tab"
                  aria-selected={audience === id}
                  onClick={() => switchAudience(id)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                    audience === id ? 'bg-white text-ink' : 'text-white/70 hover:text-white'
                  }`}
                >
                  {id === 'brands' ? 'For brands' : 'For organisers'}
                </button>
              ))}
            </div>

            {/* Step index with scroll progress (desktop) */}
            <div className="relative mt-12 hidden pl-6 lg:block" aria-hidden="true">
              <div className="absolute bottom-1 left-0 top-1 w-px bg-white/15" />
              <motion.div
                className="absolute bottom-1 left-0 top-1 w-px origin-top bg-white"
                style={{ scaleY: progress }}
              />
              <ol className="space-y-4">
                {current.map((step, i) => (
                  <li
                    key={step.title}
                    className={`flex items-baseline gap-3 text-sm transition-colors duration-300 ${
                      i === active ? 'text-white' : 'text-white/40'
                    }`}
                  >
                    <span className="font-mono text-xs">{String(i + 1).padStart(2, '0')}</span>
                    <span className={i === active ? 'font-medium' : ''}>{step.title}</span>
                  </li>
                ))}
              </ol>
            </div>

            {linkToPage && (
              <Link
                href="/how-it-works"
                className="mt-10 inline-flex items-center gap-1.5 text-sm font-medium text-white underline-offset-4 hover:underline"
              >
                See the full process <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>

        {/* Scrolling steps */}
        <ol ref={listRef} key={audience} className="space-y-4 lg:col-span-7 lg:space-y-0" role="tabpanel">
          {current.map((step, i) => (
            <StepCard key={step.title} step={step} index={i} activeIndex={active} onActive={setActive} />
          ))}
        </ol>
      </div>
    </section>
  );
};

export default HowItWorks;
