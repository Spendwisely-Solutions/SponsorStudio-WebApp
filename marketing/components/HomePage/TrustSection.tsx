'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BadgeCheck, Check, FileSignature, FileText, ShieldCheck } from 'lucide-react';
import SectionHeader from '../ui/SectionHeader';

// Each card shows a simplified version of a real artifact on the platform,
// rather than an icon-and-sentence feature tile.

function CardFrame({
  icon: Icon,
  title,
  body,
  children,
  className = '',
  index = 0,
}: {
  icon: React.ElementType;
  title: string;
  body: string;
  children: React.ReactNode;
  className?: string;
  index?: number;
}) {
  return (
    <motion.article
      className={`flex flex-col overflow-hidden rounded-card border border-border bg-surface ${className}`}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 0.7, delay: (index % 2) * 0.1 }}
    >
      <div className="flex-1 border-b border-border bg-background-secondary p-5 sm:p-6" aria-hidden="true">
        {/* The artifact settles into place a beat after its card, like a document being set down. */}
        <motion.div
          initial={{ opacity: 0, y: 14, rotate: -1.5 }}
          whileInView={{ opacity: 1, y: 0, rotate: 0 }}
          viewport={{ once: true, margin: '0px 0px -10% 0px' }}
          transition={{ duration: 0.8, delay: 0.15 + (index % 2) * 0.1 }}
        >
          {children}
        </motion.div>
      </div>
      <div className="p-6">
        <h3 className="flex items-center gap-2 text-base font-semibold text-text-primary">
          <Icon className="h-4 w-4 text-brand-600" />
          {title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-text-secondary">{body}</p>
      </div>
    </motion.article>
  );
}

function VerificationArtifact() {
  const checks = ['Organiser identity', 'Event permissions', 'Audience and footfall data', 'Listing MOU signed'];
  return (
    <div className="mx-auto max-w-sm rounded-lg border border-border bg-surface p-4 shadow-card">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-text-primary">Riverfront Music Fest</p>
        <span className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-700">
          <BadgeCheck className="h-3 w-3" /> Verified
        </span>
      </div>
      <ul className="mt-4 space-y-2.5">
        {checks.map((check) => (
          <li key={check} className="flex items-center justify-between text-xs">
            <span className="text-text-secondary">{check}</span>
            <Check className="h-3.5 w-3.5 text-success" />
          </li>
        ))}
      </ul>
    </div>
  );
}

function MouArtifact() {
  return (
    <div className="mx-auto max-w-xs rounded-lg border border-border bg-surface p-5 shadow-card">
      <p className="text-center font-display text-lg text-text-primary">Memorandum of Understanding</p>
      <div className="mt-4 space-y-1.5">
        {[100, 92, 96, 70].map((w, i) => (
          <div key={i} className="h-1.5 rounded-full bg-border" style={{ width: `${w}%` }} />
        ))}
      </div>
      <div className="mt-6 flex items-end justify-between">
        <div>
          <p className="font-display text-xl italic text-brand-700">A. Menon</p>
          <div className="mt-1 h-px w-24 bg-border-hover" />
          <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-text-muted">Organiser</p>
        </div>
        <p className="font-mono text-[10px] uppercase tracking-wider text-text-muted">Signed</p>
      </div>
    </div>
  );
}

function RiskArtifact() {
  const rows = [
    { label: 'Audience fit', value: 'Strong', width: '85%' },
    { label: 'Organiser track record', value: '3 past editions', width: '70%' },
    { label: 'Budget risk', value: 'Low', width: '25%' },
  ];
  return (
    <div className="mx-auto max-w-sm rounded-lg border border-border bg-surface p-4 shadow-card">
      <p className="font-mono text-[10px] uppercase tracking-wider text-text-muted">Risk analysis report</p>
      <ul className="mt-4 space-y-4">
        {rows.map((row) => (
          <li key={row.label}>
            <div className="flex justify-between text-xs">
              <span className="text-text-secondary">{row.label}</span>
              <span className="font-medium text-text-primary">{row.value}</span>
            </div>
            <div className="mt-1.5 h-1.5 rounded-full bg-background-secondary">
              <motion.div
                className="h-full rounded-full bg-brand-600"
                initial={{ width: 0 }}
                whileInView={{ width: row.width }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.4 }}
              />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ReportArtifact() {
  const bars = [38, 52, 46, 71, 64, 88, 79];
  return (
    <div className="mx-auto max-w-md rounded-lg border border-border bg-surface p-4 shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-wider text-text-muted">Post-event report</p>
          <p className="mt-1 text-sm font-medium text-text-primary">Brand impressions by day</p>
        </div>
        <div className="text-right">
          <p className="font-display text-2xl text-text-primary">1.8L</p>
          <p className="text-[11px] text-text-muted">total impressions</p>
        </div>
      </div>
      <div className="mt-5 flex h-24 items-end gap-2">
        {bars.map((h, i) => (
          <motion.div
            key={i}
            className={`flex-1 rounded-t ${i === bars.length - 2 ? 'bg-brand-600' : 'bg-brand-200'}`}
            initial={{ height: 0 }}
            whileInView={{ height: `${h}%` }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 + i * 0.06 }}
          />
        ))}
      </div>
    </div>
  );
}

const TrustSection: React.FC = () => {
  return (
    <section id="trust" className="py-20 lg:py-28">
      <div className="container-page">
        <SectionHeader
          title={
            <>
              Every deal starts <span className="italic">on solid ground.</span>
            </>
          }
          description="Sponsorship money only moves when both sides trust what they're getting. So we check every listing, put terms in writing and report back once the event is over."
        />

        <div className="mt-14 grid gap-4 lg:grid-cols-12">
          <CardFrame
            className="lg:col-span-7"
            icon={ShieldCheck}
            title="Verified before it goes live"
            body="Our team reviews every organiser and listing before brands can see it, so you're never pitching into the void or paying for an event that doesn't exist."
          >
            <VerificationArtifact />
          </CardFrame>
          <CardFrame
            index={1}
            className="lg:col-span-5"
            icon={FileSignature}
            title="Terms in writing"
            body="Organisers sign an MOU with Sponsor Studio before their listing is published, covering deliverables and commission up front."
          >
            <MouArtifact />
          </CardFrame>
          <CardFrame
            index={2}
            className="lg:col-span-5"
            icon={FileText}
            title="Risk reports on request"
            body="Before you commit budget, request a risk analysis prepared by our team: audience fit, organiser history and where things could go wrong."
          >
            <RiskArtifact />
          </CardFrame>
          <CardFrame
            index={3}
            className="lg:col-span-7"
            icon={BadgeCheck}
            title="Proof after the event"
            body="Post-event reports show what your sponsorship actually delivered, so the next budget conversation starts with numbers, not impressions."
          >
            <ReportArtifact />
          </CardFrame>
        </div>
      </div>
    </section>
  );
};

export default TrustSection;
