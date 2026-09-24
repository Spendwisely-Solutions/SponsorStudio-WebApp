'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  BarChart2,
  Calendar,
  Check,
  CheckCircle2,
  Coins,
  ExternalLink,
  FileSignature,
  FileText,
  Home,
  ImagePlus,
  LogOut,
  MapPin,
  PlusCircle,
  Search,
  User,
  Users,
  Video,
} from 'lucide-react';
import SectionHeader from '../ui/SectionHeader';
import { SIGN_UP_BRAND_URL, SIGN_UP_ORGANIZER_URL } from '../../lib/site';
import { mockBrands, mockEvent, mockEvents, type MockEvent } from '../../lib/mockEvents';

type DemoRole = 'brand' | 'organizer';

const STEP_MS = 4800;

const roleContent: Record<
  DemoRole,
  { heading: string; subheading: string; cta: string; steps: { title: string; status: string }[] }
> = {
  brand: {
    heading: 'What brands see',
    subheading: 'Browse verified listings, express interest with credits, and follow every match and report from one dashboard.',
    cta: 'Explore opportunities',
    steps: [
      { title: 'Discover events', status: 'Browse verified listings that match your audience' },
      { title: 'Express interest', status: 'Review packages and let the organiser know, for 50 credits' },
      { title: 'Track your matches', status: 'Meet accepted organisers and request risk or post-event reports' },
    ],
  },
  organizer: {
    heading: 'What organisers see',
    subheading: 'Publish your event, set your sponsorship packages and respond to interested brands from one dashboard.',
    cta: 'List your event',
    steps: [
      { title: 'Track your listings', status: 'See what is live, under review, and which brands are interested' },
      { title: 'Set up a listing', status: 'Add dates, audience, photos and sponsorship packages' },
      { title: 'Respond to brands', status: 'Accept a brand, sign the MOU and set up the meeting' },
    ],
  },
};

const users = {
  brand: { name: 'Sarah Jenkins', role: 'Northwind Beverages', initial: 'S' },
  organizer: { name: 'Marcus Chen', role: 'Spark Events', initial: 'M' },
};

const fade = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
  transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] as const },
};

function Photo({ event, className = '' }: { event: MockEvent; className?: string }) {
  return (
    <div className={`relative overflow-hidden bg-gray-200 ${className}`}>
      <Image src={event.image} alt="" fill sizes="(min-width: 1024px) 240px, 45vw" className="object-cover" />
    </div>
  );
}

function Chip({ children, tone = 'gray' }: { children: React.ReactNode; tone?: 'gray' | 'green' | 'amber' | 'blue' }) {
  const tones = {
    gray: 'bg-gray-100 text-gray-600',
    green: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    blue: 'bg-brand-50 text-brand-700',
  };
  return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-semibold ${tones[tone]}`}>{children}</span>;
}

/* ---------- Brand screens ---------- */

function BrandDiscover() {
  return (
    <motion.div key="brand-discover" {...fade} className="grid grid-cols-2 gap-3 xl:grid-cols-3">
      {mockEvents.map((event, i) => (
        <div
          key={event.id}
          className={`overflow-hidden rounded-xl border bg-white text-left shadow-sm ${i === 0 ? 'border-brand-600 ring-2 ring-brand-600/15' : 'border-gray-200'} ${i > 3 ? 'hidden xl:block' : ''}`}
        >
          <div className="relative">
            <Photo event={event} className="aspect-[16/10]" />
            <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[8.5px] font-semibold text-gray-800 backdrop-blur">
              {event.category}
            </span>
          </div>
          <div className="p-2.5">
            <p className="truncate text-[11px] font-semibold text-gray-900">{event.title}</p>
            <p className="mt-0.5 flex items-center gap-1 truncate text-[9px] text-gray-500">
              <MapPin className="h-2.5 w-2.5 shrink-0" /> {event.city} · {event.dates}
            </p>
            <div className="mt-2 flex items-center justify-between text-[9px]">
              <span className="font-semibold text-emerald-700">{event.price}</span>
              <span className="text-gray-500">{event.reach}</span>
            </div>
          </div>
        </div>
      ))}
    </motion.div>
  );
}

function BrandInterest() {
  const event = mockEvent('vibefest');
  const packages = [
    { name: 'Title sponsor', price: '₹20L', left: '1 left' },
    { name: 'Powered by', price: '₹12L', left: '2 left' },
    { name: 'Stage partner', price: '₹8L', left: '3 left' },
  ];
  return (
    <motion.div key="brand-interest" {...fade} className="overflow-hidden rounded-xl border border-gray-200 bg-white text-left shadow-sm">
      <div className="relative">
        <Photo event={event} className="h-36" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-black/0" />
        <div className="absolute inset-x-0 bottom-0 p-3 text-white">
          <p className="text-sm font-semibold">{event.title}</p>
          <p className="text-[10px] text-white/80">
            {event.city} · {event.dates} · {event.reach}
          </p>
        </div>
      </div>
      <div className="grid gap-3 p-3 sm:grid-cols-5">
        <div className="sm:col-span-3">
          <p className="text-[9px] font-semibold uppercase tracking-wide text-gray-500">Sponsorship packages</p>
          <ul className="mt-2 space-y-1.5">
            {packages.map((pkg) => (
              <li key={pkg.name} className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 px-2.5 py-1.5 text-[10px]">
                <span className="font-medium text-gray-800">{pkg.name}</span>
                <span className="text-gray-500">
                  <strong className="text-gray-900">{pkg.price}</strong> · {pkg.left}
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col justify-between gap-2 rounded-lg bg-brand-50 p-2.5 sm:col-span-2">
          <div className="space-y-1 text-[9.5px] text-gray-700">
            <p className="flex items-center gap-1.5"><Users className="h-3 w-3 text-brand-600" /> 18–30, urban</p>
            <p className="flex items-center gap-1.5"><CheckCircle2 className="h-3 w-3 text-brand-600" /> Verified listing</p>
            <p className="flex items-center gap-1.5"><FileText className="h-3 w-3 text-brand-600" /> Brochure: 100 credits</p>
          </div>
          <motion.div
            initial={{ backgroundColor: '#2a3a92' }}
            animate={{ backgroundColor: '#047857' }}
            transition={{ delay: 1.6, duration: 0.3 }}
            className="flex items-center justify-center gap-1 rounded-lg py-1.5 text-[10px] font-semibold text-white"
          >
            <motion.span initial={{ opacity: 1 }} animate={{ opacity: 0, width: 0 }} transition={{ delay: 1.6, duration: 0.2 }} className="overflow-hidden whitespace-nowrap">
              Express interest · 50
            </motion.span>
            <motion.span initial={{ opacity: 0, width: 0 }} animate={{ opacity: 1, width: 'auto' }} transition={{ delay: 1.8, duration: 0.2 }} className="inline-flex items-center gap-1 overflow-hidden whitespace-nowrap">
              <Check className="h-3 w-3" /> Interest sent
            </motion.span>
          </motion.div>
        </div>
      </div>
      <div className="border-t border-gray-100 p-3">
        <p className="text-[9px] font-semibold uppercase tracking-wide text-gray-500">Similar events</p>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {['neon-nights', 'campus-spark', 'founders-summit'].map((id) => {
            const similar = mockEvent(id);
            return (
              <div key={id} className="flex items-center gap-2">
                <Photo event={similar} className="h-8 w-10 shrink-0 rounded-md" />
                <div className="min-w-0 text-[9px]">
                  <p className="truncate font-semibold text-gray-800">{similar.title}</p>
                  <p className="truncate text-gray-500">{similar.city}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

function BrandMatches() {
  const accepted = mockEvent('founders-summit');
  const pending = [mockEvent('vibefest'), mockEvent('coastal-run'), mockEvent('neon-nights')];
  return (
    <motion.div key="brand-matches" {...fade} className="space-y-3 text-left">
      <div className="rounded-xl border border-emerald-100 bg-white p-3 shadow-sm">
        <div className="flex items-center gap-3">
          <Photo event={accepted} className="h-12 w-16 shrink-0 rounded-lg" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-[11px] font-semibold text-gray-900">{accepted.title}</p>
              <Chip tone="green">Accepted</Chip>
            </div>
            <p className="mt-0.5 flex items-center gap-1 text-[9.5px] text-gray-500">
              <Video className="h-3 w-3" /> Meeting with the organiser · Thu, 11:30 am
            </p>
          </div>
        </div>
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          <span className="rounded-lg bg-primary px-2.5 py-1 text-[9.5px] font-semibold text-white">Join meeting</span>
          <span className="rounded-lg border border-gray-200 px-2.5 py-1 text-[9.5px] font-semibold text-gray-700">View brochure</span>
          <span className="rounded-lg border border-gray-200 px-2.5 py-1 text-[9.5px] font-semibold text-gray-700">Post-event report · 100</span>
        </div>
      </div>
      {pending.map((event, i) => (
        <div key={event.id} className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
          <Photo event={event} className="h-10 w-14 shrink-0 rounded-lg" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-[11px] font-semibold text-gray-900">{event.title}</p>
              <Chip tone="amber">Pending</Chip>
            </div>
            <p className="mt-0.5 text-[9.5px] text-gray-500">Sent {['today', '2 days ago', 'last week'][i]} · {event.price}</p>
          </div>
          <span className={`hidden shrink-0 rounded-lg px-2.5 py-1 text-[9.5px] font-semibold sm:inline ${i === 1 ? 'bg-gray-100 text-gray-500' : 'border border-brand-200 bg-brand-50 text-brand-700'}`}>
            {i === 1 ? 'Report requested' : 'Risk analysis · 500'}
          </span>
        </div>
      ))}
    </motion.div>
  );
}

/* ---------- Organiser screens ---------- */

function OrganizerListings() {
  const listings = [
    { event: mockEvent('vibefest'), status: 'Live', tone: 'green' as const, interested: 4 },
    { event: mockEvent('campus-spark'), status: 'Under review', tone: 'amber' as const, interested: 0 },
    { event: mockEvent('neon-nights'), status: 'Live', tone: 'green' as const, interested: 3 },
    { event: mockEvent('design-gala'), status: 'Draft', tone: 'gray' as const, interested: 0 },
  ];
  return (
    <motion.div key="org-listings" {...fade} className="space-y-3 text-left">
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {[
          { label: 'Live listings', value: '2' },
          { label: 'Interested brands', value: '7' },
          { label: 'Accepted', value: '2' },
          { label: 'Secured', value: '₹14.5L' },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-gray-200 bg-white p-2.5">
            <p className="text-[8.5px] font-semibold uppercase tracking-wide text-gray-500">{stat.label}</p>
            <p className="mt-1 text-lg font-semibold text-gray-900">{stat.value}</p>
          </div>
        ))}
      </div>
      <div className="divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white shadow-sm">
        {listings.map(({ event, status, tone, interested }) => (
          <div key={event.id} className="flex items-center gap-3 p-2.5">
            <Photo event={event} className="h-10 w-14 shrink-0 rounded-lg" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[11px] font-semibold text-gray-900">{event.title}</p>
              <p className="text-[9.5px] text-gray-500">
                {event.city} · {event.dates}
              </p>
            </div>
            <Chip tone={tone}>{status}</Chip>
            <span className="hidden w-24 shrink-0 text-right text-[9.5px] text-gray-600 sm:block">
              {interested > 0 ? (
                <>
                  <strong className="text-gray-900">{interested}</strong> brands interested
                </>
              ) : status === 'Draft' ? (
                'Not submitted'
              ) : (
                'Verifying details'
              )}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function OrganizerCreate() {
  const event = mockEvent('campus-spark');
  const field = 'w-full rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-[10px] text-gray-800';
  return (
    <motion.div key="org-create" {...fade} className="rounded-xl border border-gray-200 bg-white p-3 text-left shadow-sm">
      <p className="text-xs font-semibold text-gray-900">Create a listing</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-5">
        <div className="space-y-2 sm:col-span-3">
          <div className="grid grid-cols-2 gap-2">
            <div className={field}>{event.title}</div>
            <div className={field}>{event.category}</div>
            <div className={field}>{event.city}</div>
            <div className={field}>{event.reach}</div>
          </div>
          <p className="pt-1 text-[9px] font-semibold uppercase tracking-wide text-gray-500">Packages</p>
          {[
            ['Title sponsor', '₹6,00,000'],
            ['Food court partner', '₹2,50,000'],
            ['Stall', '₹1,50,000'],
          ].map(([name, price], i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + i * 0.35 }}
              className="flex justify-between rounded-lg bg-gray-50 px-2.5 py-1.5 text-[10px]"
            >
              <span className="text-gray-700">{name}</span>
              <strong className="text-gray-900">{price}</strong>
            </motion.div>
          ))}
        </div>
        <div className="space-y-2 sm:col-span-2">
          <div className="grid grid-cols-2 gap-1.5">
            <Photo event={event} className="aspect-square rounded-lg" />
            <Photo event={mockEvent('neon-nights')} className="aspect-square rounded-lg" />
            <div className="col-span-2 flex items-center justify-center gap-1 rounded-lg border border-dashed border-gray-300 py-2 text-[9.5px] text-gray-500">
              <ImagePlus className="h-3 w-3" /> Add photos
            </div>
          </div>
          <div className="rounded-lg bg-brand-50 p-2 text-[9px] text-gray-700">
            <p className="font-semibold text-brand-700">Basic plan</p>
            <p className="mt-0.5">Free to list · 10% commission on sponsorship closed</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function OrganizerBrands() {
  const [first, ...others] = mockBrands;
  return (
    <motion.div key="org-brands" {...fade} className="space-y-2.5 text-left">
      <p className="text-[10px] font-semibold text-gray-500">Interested in VibeFest Carnival 2026</p>
      <div className="rounded-xl border border-emerald-100 bg-white p-3 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-ink text-xs font-semibold text-white">{first.initial}</span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-[11px] font-semibold text-gray-900">{first.name}</p>
              <Chip tone="green">Accepted</Chip>
            </div>
            <p className="text-[9.5px] text-gray-500">{first.category} · Powered by package</p>
          </div>
        </div>
        <div className="mt-2.5 grid grid-cols-2 gap-1.5 text-[9.5px]">
          <motion.span
            initial={{ opacity: 0.4 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-50 px-2 py-1.5 font-semibold text-emerald-700"
          >
            <FileSignature className="h-3 w-3" /> MOU signed
          </motion.span>
          <span className="flex items-center gap-1.5 rounded-lg bg-gray-50 px-2 py-1.5 font-semibold text-gray-700">
            <Calendar className="h-3 w-3" /> Meeting Thu, 11:30 am
          </span>
        </div>
      </div>
      {others.map((brand) => (
        <div key={brand.name} className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-xs font-semibold text-gray-700">{brand.initial}</span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold text-gray-900">{brand.name}</p>
            <p className="text-[9.5px] text-gray-500">{brand.category}</p>
          </div>
          <span className="rounded-lg border border-gray-200 px-2.5 py-1 text-[9.5px] font-semibold text-gray-600">Decline</span>
          <span className="rounded-lg bg-primary px-2.5 py-1 text-[9.5px] font-semibold text-white">Accept</span>
        </div>
      ))}
    </motion.div>
  );
}

const screens: Record<DemoRole, React.FC[]> = {
  brand: [BrandDiscover, BrandInterest, BrandMatches],
  organizer: [OrganizerListings, OrganizerCreate, OrganizerBrands],
};

const InteractiveDashboard: React.FC = () => {
  const [role, setRole] = useState<DemoRole>('brand');
  const [activeStep, setActiveStep] = useState(0);
  const content = roleContent[role];
  const user = users[role];
  const Screen = screens[role][activeStep];

  const switchRole = (next: DemoRole) => {
    setRole(next);
    setActiveStep(0);
  };

  // Advance through the steps; clicking a step restarts the timer from there.
  useEffect(() => {
    const timer = window.setTimeout(() => setActiveStep((step) => (step + 1) % content.steps.length), STEP_MS);
    return () => window.clearTimeout(timer);
  }, [activeStep, role, content.steps.length]);

  const credits = role === 'brand' ? (activeStep === 0 ? '5,000' : '4,950') : null;

  return (
    <section className="relative z-10 border-t border-border py-20 lg:py-28" id="interactive-demo">
      <div className="container-page relative z-10">
        <SectionHeader
          align="center"
          className="mb-12"
          title={
            <>
              See the platform <span className="italic">from both sides.</span>
            </>
          }
          description="Switch between the brand and organiser views to see the dashboard each side works in."
        />

        <div className="rounded-3xl border border-border bg-surface p-5 shadow-card sm:p-6 lg:p-8">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div role="tablist" aria-label="Dashboard view" className="inline-flex rounded-xl border border-border bg-background p-1">
              {(['brand', 'organizer'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  role="tab"
                  aria-selected={role === r}
                  onClick={() => switchRole(r)}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                    role === r ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {r === 'brand' ? 'Brand view' : 'Organiser view'}
                </button>
              ))}
            </div>
            <p className="text-xs text-text-muted">Plays automatically. Click a step to jump to it.</p>
          </div>

          <div className="grid items-stretch gap-8 lg:grid-cols-12">
            {/* Steps */}
            <div className="flex flex-col justify-between gap-8 lg:col-span-4">
              <div>
                <h3 className="font-display text-3xl text-text-primary">{content.heading}</h3>
                <p className="mt-3 text-sm leading-relaxed text-text-secondary">{content.subheading}</p>
                <ol className="mt-6 space-y-2.5">
                  {content.steps.map((step, index) => {
                    const active = activeStep === index;
                    return (
                      <li key={step.title}>
                        <button
                          type="button"
                          onClick={() => setActiveStep(index)}
                          className={`relative w-full overflow-hidden rounded-xl border p-4 text-left transition-colors ${
                            active ? 'border-brand-600 bg-brand-50/60' : 'border-border hover:border-border-hover'
                          }`}
                        >
                          <p className="text-xs font-semibold text-brand-600">Step {index + 1}</p>
                          <p className="mt-1 text-sm font-semibold text-text-primary">{step.title}</p>
                          <p className="mt-0.5 text-xs text-text-secondary">{step.status}</p>
                          {active && (
                            <motion.span
                              key={`${role}-${index}`}
                              initial={{ scaleX: 0 }}
                              animate={{ scaleX: 1 }}
                              transition={{ duration: STEP_MS / 1000, ease: 'linear' }}
                              className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-brand-600"
                            />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <a
                    href={role === 'brand' ? SIGN_UP_BRAND_URL : SIGN_UP_ORGANIZER_URL}
                    className="inline-flex items-center rounded-[10px] bg-primary px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-primary-hover"
                  >
                    {content.cta}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </a>
                  <a
                    href="https://demo.sponsorstudio.in/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center rounded-[10px] border border-border px-5 py-3 text-sm font-medium text-text-primary transition-colors hover:border-border-hover"
                  >
                    Try the live demo
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </div>
                <p className="mt-2 text-xs text-text-muted">The public demo needs no sign-up.</p>
              </div>
            </div>

            {/* Mock dashboard */}
            <div className="flex min-h-[500px] overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 shadow-pop lg:col-span-8" aria-hidden="true">
              <div className="flex w-14 shrink-0 select-none flex-col justify-between border-r border-gray-200 bg-white p-3 sm:w-44">
                <div className="space-y-4">
                  <Image src="/logo.png" alt="" width={330} height={218} className="hidden h-8 w-auto px-1 sm:block" />
                  <div className="flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 p-1.5">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-white">
                      {user.initial}
                    </span>
                    <span className="hidden min-w-0 leading-tight sm:block">
                      <span className="block truncate text-[10px] font-semibold text-gray-900">{user.name}</span>
                      <span className="block truncate text-[8.5px] text-gray-500">{user.role}</span>
                    </span>
                  </div>
                  <div className="space-y-1">
                    {[
                      { label: 'Dashboard', icon: Home, active: true },
                      { label: 'Meetings', icon: Calendar },
                      role === 'brand' ? { label: 'Reports', icon: FileText } : { label: 'Analytics', icon: BarChart2 },
                      { label: 'Profile', icon: User },
                    ].map(({ label, icon: Icon, active }) => (
                      <div
                        key={label}
                        className={`flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-[10px] font-semibold ${
                          active ? 'bg-brand-50 text-brand-600' : 'text-gray-600'
                        }`}
                      >
                        <Icon className="h-4 w-4 shrink-0" />
                        <span className="hidden sm:inline">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2.5 px-2.5 py-2 text-[10px] font-semibold text-gray-500">
                  <LogOut className="h-4 w-4 shrink-0" />
                  <span className="hidden sm:inline">Sign out</span>
                </div>
              </div>

              <div className="flex min-w-0 flex-1 flex-col gap-3 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-gray-900">{role === 'brand' ? 'Brand Dashboard' : 'Opportunity Dashboard'}</p>
                  {credits ? (
                    <div className="flex items-center gap-2">
                      <span className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-gray-900">
                        <Coins className="h-3.5 w-3.5 text-amber-500" /> {credits} credits
                      </span>
                      <Search className="hidden h-4 w-4 text-gray-400 sm:block" />
                    </div>
                  ) : (
                    <span className="flex items-center gap-1 rounded-lg bg-primary px-2.5 py-1 text-[10px] font-semibold text-white">
                      <PlusCircle className="h-3.5 w-3.5" /> New listing
                    </span>
                  )}
                </div>

                <div className="flex gap-4 border-b border-gray-200 text-[11px] font-semibold">
                  {/* The last step of each tour happens on the matches tab. */}
                  {(role === 'brand' ? ['Discover', 'Matches'] : ['Your listings', 'Brand matches']).map((tab, i) => (
                    <span
                      key={tab}
                      className={`-mb-px border-b-2 pb-2 ${(activeStep === 2 ? 1 : 0) === i ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500'}`}
                    >
                      {tab}
                      {i === 1 && <span className="ml-1.5 rounded-full bg-amber-400 px-1.5 text-[8.5px] text-gray-900">{role === 'brand' ? 3 : 2}</span>}
                    </span>
                  ))}
                </div>

                <div className="flex-1">
                  <AnimatePresence mode="wait">
                    <Screen key={`${role}-${activeStep}`} />
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InteractiveDashboard;
