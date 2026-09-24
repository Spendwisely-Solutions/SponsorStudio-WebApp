'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ArrowUpRight } from 'lucide-react';
import { Check } from 'lucide-react';
import Reveal from '../motion/Reveal';
import Button from '../ui/Button';
import SectionHeader from '../ui/SectionHeader';
import { CONSULTATION_URL, SIGN_UP_BRAND_URL, SIGN_UP_ORGANIZER_URL } from '../../lib/site';
import { CREDIT_VALIDITY_DAYS, consultation, creditCosts, creditPacks, organizerPlans } from '../../lib/pricing';

type Audience = 'brands' | 'organizers';

const tabs: { id: Audience; label: string }[] = [
  { id: 'brands', label: 'For brands' },
  { id: 'organizers', label: 'For organisers' },
];

function BrandPricing() {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-3">
        {creditPacks.map((pack, i) => (
          <Reveal key={pack.name} delay={i * 0.08} className="flex">
            <div
              className={`flex w-full flex-col rounded-card border bg-surface p-6 ${
                pack.highlighted ? 'border-brand-600 ring-1 ring-brand-600' : 'border-border'
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-text-primary">{pack.name}</h3>
                {pack.offer && (
                  <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">Launch offer</span>
                )}
              </div>
              <p className="mt-5 font-display text-5xl text-text-primary">{pack.price}</p>
              <p className="mt-2 text-sm text-text-secondary">
                <span className="font-medium text-text-primary">{pack.credits} credits</span> · valid {CREDIT_VALIDITY_DAYS} days
              </p>
              <p className="mt-4 text-sm text-text-secondary">{pack.perCredit}</p>
              {pack.offer && <p className="mt-1 text-sm font-medium text-brand-700">{pack.offer}</p>}
              <Button
                href={SIGN_UP_BRAND_URL}
                variant={pack.highlighted ? 'primary' : 'secondary'}
                className="mt-8 w-full"
              >
                Buy {pack.name}
              </Button>
            </div>
          </Reveal>
        ))}
      </div>

      <div className="mt-6 rounded-card border border-border bg-surface">
        <div className="flex flex-col gap-1 border-b border-border px-6 py-4 sm:flex-row sm:items-baseline sm:justify-between">
          <h3 className="text-sm font-semibold text-text-primary">What credits are used for</h3>
          <p className="text-sm text-text-muted">You only spend credits when you act on a listing.</p>
        </div>
        <ul className="divide-y divide-border">
          {creditCosts.map((item) => (
            <li key={item.action} className="flex items-center justify-between px-6 py-3.5 text-sm">
              <span className="text-text-secondary">{item.action}</span>
              <span className="font-mono text-text-primary">{item.credits} credits</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-6 flex flex-col gap-4 rounded-card border border-border bg-surface p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-sm font-semibold text-text-primary">Strategy consultation</h3>
          <p className="mt-1 text-sm text-text-secondary">
            A {consultation.duration} with our team to plan your sponsorship strategy. {consultation.price} ({consultation.total}).
          </p>
        </div>
        <Button href={CONSULTATION_URL} target="_blank" rel="noopener noreferrer" variant="secondary" className="shrink-0">
          Book a consultation <ArrowUpRight className="h-4 w-4" />
        </Button>
      </div>
    </>
  );
}

function OrganizerPricing() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {organizerPlans.map((plan, i) => (
        <Reveal key={plan.name} delay={i * 0.08} className="flex">
          <div
            className={`flex w-full flex-col rounded-card border bg-surface p-6 sm:p-8 ${
              plan.highlighted ? 'border-brand-600 ring-1 ring-brand-600' : 'border-border'
            }`}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-text-primary">{plan.name}</h3>
              {plan.highlighted && (
                <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-700">Fully managed</span>
              )}
            </div>
            <p className="mt-5 font-display text-4xl text-text-primary sm:text-5xl">{plan.price}</p>
            <p className="mt-2 text-sm text-text-secondary">{plan.priceNote}</p>
            <ul className="mb-8 mt-6 flex-1 space-y-3 border-t border-border pt-6">
              {plan.features.map((feature) => (
                <li key={feature} className="flex gap-3 text-sm text-text-secondary">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              href={SIGN_UP_ORGANIZER_URL}
              variant={plan.highlighted ? 'primary' : 'secondary'}
              className="w-full"
            >
              List your event
            </Button>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

type PricingSectionProps = {
  /** On the dedicated /pricing page the h1 lives in the page header instead. */
  showHeader?: boolean;
  /** Adds a link to /pricing (used on the homepage). */
  linkToPage?: boolean;
};

const PricingSection: React.FC<PricingSectionProps> = ({ showHeader = true, linkToPage = false }) => {
  const [audience, setAudience] = useState<Audience>('brands');

  return (
    <section id="pricing" className="border-t border-border bg-background-secondary py-20 lg:py-28">
      <div className="container-page">
        <div className={`flex flex-col gap-8 lg:flex-row lg:items-end ${showHeader ? 'lg:justify-between' : ''}`}>
          {showHeader && (
          <SectionHeader
            title={
              <>
                Pay for what you use, <span className="italic">nothing hidden.</span>
              </>
            }
            description="Brands buy credits and spend them only on the listings they act on. Organisers list for free, then pay to unlock interested brands and a commission on deals that close."
          />
          )}
          <div role="tablist" aria-label="Pricing for" className="inline-flex shrink-0 self-start rounded-xl border border-border bg-surface p-1 lg:self-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={audience === tab.id}
                onClick={() => setAudience(tab.id)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                  audience === tab.id ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-12" role="tabpanel">
          {audience === 'brands' ? <BrandPricing /> : <OrganizerPricing />}
        </div>

        {linkToPage && (
          <Link
            href="/pricing"
            className="mt-10 inline-flex items-center gap-1.5 text-sm font-medium text-text-primary underline-offset-4 hover:underline"
          >
            Full pricing details and questions <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </section>
  );
};

export default PricingSection;
