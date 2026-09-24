'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, Coins } from 'lucide-react';
import { FaLinkedin } from 'react-icons/fa';
import { sendNewsletterSignup } from '../lib/email';
import { socialLinks } from '../lib/site';

type Audience = 'brand' | 'organizer';

const audiences: { id: Audience; label: string }[] = [
  { id: 'brand', label: "I'm a brand" },
  { id: 'organizer', label: "I'm an event organiser" },
];

const topics = ['Industry news', 'Sponsorship playbooks for brands', 'Event marketing ideas', 'Tools worth using'];

const linkedIn = socialLinks.find((link) => link.label === 'LinkedIn');

/** Signup for The Backdrop, the weekly newsletter. Shown at the top of the footer on every page. */
export default function NewsletterSignup() {
  const [audience, setAudience] = useState<Audience>('brand');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus('error');
      return;
    }
    setStatus('sending');
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, audience }),
      });
      // Until Beehiiv is configured, email the signup to the team so nobody is lost.
      if (res.status === 503) await sendNewsletterSignup({ email, audience });
      else if (!res.ok) throw new Error(`Newsletter signup failed with ${res.status}`);
      setStatus('done');
    } catch (err) {
      console.error('Newsletter signup failed:', err);
      setStatus('error');
    }
  };

  return (
    <div className="grid overflow-hidden rounded-2xl border border-border bg-surface shadow-card lg:grid-cols-12">
      {/* Masthead */}
      <div className="relative flex flex-col bg-navy p-8 text-white lg:col-span-6 lg:p-10">
        <div className="flex items-center justify-between border-b border-white/15 pb-3 font-mono text-[11px] uppercase tracking-[0.14em] text-white/60">
          <span>Weekly</span>
          <span>From the founder</span>
        </div>
        <h2 className="mt-6 text-5xl text-white sm:text-6xl">
          The <span className="italic">Backdrop</span>
        </h2>
        <p className="mt-4 max-w-md leading-relaxed text-white/70">
          A weekly letter from our founder on India&apos;s events and startup scene, in one short read.
        </p>
        <p className="mt-8 flex items-center gap-3 border-t border-white/15 pt-5 text-sm text-white/80 lg:mt-auto">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10">
            <Coins className="h-4 w-4 text-white" />
          </span>
          <span>
            Subscribe and get <strong className="font-semibold text-white">500 free credits</strong> on Sponsor Studio
          </span>
        </p>
      </div>

      <div className="flex flex-col justify-center p-8 lg:col-span-6 lg:p-10">
        <p className="text-sm font-medium text-text-primary">In every issue</p>
        <ol className="mt-3 grid gap-x-6 gap-y-2 sm:grid-cols-2">
          {topics.map((topic, i) => (
            <li key={topic} className="flex items-baseline gap-3 text-[15px] text-text-secondary">
              <span className="font-mono text-xs text-brand-600">{String(i + 1).padStart(2, '0')}</span>
              {topic}
            </li>
          ))}
        </ol>

        <div className="mt-7 border-t border-border pt-7">
        <AnimatePresence mode="wait">
          {status === 'done' ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-card border border-border bg-surface p-6"
            >
              <p className="flex items-center gap-2 font-display text-2xl text-text-primary">
                <Check className="h-5 w-5 text-success" /> You&apos;re in.
              </p>
              <p className="mt-2 text-sm leading-relaxed text-text-secondary">
                The next issue lands in your inbox this week, and we&apos;ll be in touch about your 500 free credits. In
                the meantime, follow along for the day-to-day.
              </p>
              {linkedIn && (
                <a
                  href={linkedIn.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-5 inline-flex h-10 items-center gap-2 rounded-[10px] bg-primary px-4 text-sm font-medium text-white hover:bg-primary-hover"
                >
                  <FaLinkedin className="h-4 w-4" /> Follow on LinkedIn
                </a>
              )}
            </motion.div>
          ) : (
            <motion.form key="form" onSubmit={submit} initial={{ opacity: 0 }} animate={{ opacity: 1 }} noValidate>
              <fieldset>
                <legend className="text-sm font-medium text-text-primary">Which describes you?</legend>
                <div className="mt-3 inline-flex rounded-xl border border-border bg-surface p-1">
                  {audiences.map((option) => (
                    <label
                      key={option.id}
                      className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200 has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brand-500 ${
                        audience === option.id ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'
                      }`}
                    >
                      <input
                        type="radio"
                        name="audience"
                        value={option.id}
                        checked={audience === option.id}
                        onChange={() => setAudience(option.id)}
                        className="sr-only"
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
              </fieldset>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <label className="flex-1">
                  <span className="sr-only">Email address</span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (status === 'error') setStatus('idle');
                    }}
                    placeholder="you@company.com"
                    aria-invalid={status === 'error'}
                    className="h-12 w-full rounded-[10px] border border-border bg-surface px-4 text-text-primary placeholder:text-text-muted focus:border-brand-500 focus:outline-none"
                  />
                </label>
                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-[10px] bg-primary px-6 font-medium text-white transition-colors hover:bg-primary-hover disabled:opacity-60"
                >
                  {status === 'sending' ? 'Subscribing…' : 'Subscribe'}
                  {status !== 'sending' && <ArrowRight className="h-4 w-4" />}
                </button>
              </div>
              <p className={`mt-3 text-xs ${status === 'error' ? 'text-danger' : 'text-text-muted'}`} role={status === 'error' ? 'alert' : undefined}>
                {status === 'error'
                  ? 'Please check the email address and try again.'
                  : 'Weekly, free, and you can unsubscribe any time.'}
              </p>
            </motion.form>
          )}
        </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
