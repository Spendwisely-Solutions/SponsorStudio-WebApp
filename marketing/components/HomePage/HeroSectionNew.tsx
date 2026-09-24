'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Users } from 'lucide-react';
import Button from '../ui/Button';
import { SIGN_UP_BRAND_URL, SIGN_UP_ORGANIZER_URL } from '../../lib/site';
import CountUp from '../motion/CountUp';
import HeroFeatureReel from './HeroFeatureReel';
import { useIntroReady } from '../motion/Intro';

const stats = [
  { value: '1,000+', label: 'Events listed' },
  { value: '50+', label: 'Brands on board' },
  { value: '₹2 Cr+', label: 'Sponsorship raised' },
  { value: '100+', label: 'Deals closed' },
];

const HeroSection: React.FC = () => {
  // Entrance timing, in seconds from the moment the launch screen lifts.
  const ready = useIntroReady();
  const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 },
    transition: { duration: 0.7, delay },
  });

  return (
    <section className="relative">
      <div className="container-page grid items-center gap-14 pb-16 pt-8 sm:pt-12 lg:grid-cols-12 lg:gap-10 lg:pb-20 lg:pt-12">
        <div className="lg:col-span-6">
          {/* Each line rises from behind its own mask. The padding keeps descenders unclipped. */}
          <h1 className="text-5xl text-text-primary sm:text-6xl xl:text-7xl">
            {[
              <>Sponsorships,</>,
              <span key="italic" className="italic">minus the cold emails.</span>,
            ].map((line, i) => (
              <span key={i} className="-mb-[0.15em] block overflow-hidden pb-[0.15em]">
                <motion.span
                  className="block"
                  initial={{ y: '110%' }}
                  animate={{ y: ready ? 0 : '110%' }}
                  transition={{ duration: 0.9, delay: 0.08 + i * 0.12 }}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>
          <motion.p className="mt-6 max-w-xl text-lg leading-relaxed text-text-secondary" {...fadeUp(0.35)}>
            India&apos;s first sponsorship marketplace. Sponsor Studio connects brands with verified events, creators
            and outdoor media, and takes care of everything from the first match to the signed MOU.
          </motion.p>
          <motion.div className="mt-9 flex flex-col gap-3 sm:flex-row" {...fadeUp(0.45)}>
            <Button href={SIGN_UP_BRAND_URL} size="lg">
              I&apos;m a brand
              <ArrowRight className="h-4 w-4" />
            </Button>
            <Button href={SIGN_UP_ORGANIZER_URL} size="lg" variant="secondary">
              <Users className="h-4 w-4" />
              I&apos;m listing an event
            </Button>
          </motion.div>
          <motion.p className="mt-5 text-sm text-text-muted" {...fadeUp(0.55)}>
            Want a walkthrough first?{' '}
            <Link href="/book-demo" className="font-medium text-text-primary underline underline-offset-4 hover:text-brand-600">
              Book a demo
            </Link>
          </motion.p>

          {/* Proof figures sit in the first screen, under the calls to action. */}
          <motion.dl className="mt-10 grid grid-cols-2 gap-x-6 gap-y-5 border-t border-border pt-6 sm:grid-cols-4" {...fadeUp(0.65)}>
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col-reverse">
                <dt className="mt-1 text-xs leading-snug text-text-secondary">{stat.label}</dt>
                <dd className="font-display text-3xl text-text-primary">
                  <CountUp value={stat.value} />
                </dd>
              </div>
            ))}
          </motion.dl>
        </div>

        <div className="lg:col-span-6">
          <motion.div {...fadeUp(0.4)}>
            <HeroFeatureReel />
          </motion.div>
          <p className="mt-3 text-right font-mono text-[10px] uppercase tracking-wider text-text-muted">
            Sample data
          </p>
        </div>
      </div>

    </section>
  );
};

export default HeroSection;
