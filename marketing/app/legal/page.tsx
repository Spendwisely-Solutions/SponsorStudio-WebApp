import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Lock, ShieldCheck } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import Reveal from '../../components/motion/Reveal';
import { company, legalDocs } from '../../lib/legal';

export const metadata: Metadata = {
  title: 'Trust Centre',
  description: 'Sponsor Studio policies on privacy, terms, fees, acceptable use and security disclosure.',
  alternates: { canonical: '/legal' },
};

export default function TrustCentrePage() {
  return (
    <>
      <PageHeader
        title={
          <>
            Trust <span className="italic">Centre</span>
          </>
        }
        description="The policies that govern how Sponsor Studio works, how we handle your data and money, and how to reach us about security."
      />
      <section className="container-page pb-20 lg:pb-28">
        <ul className="grid gap-4 md:grid-cols-2">
          {legalDocs.map((doc, i) => (
            <Reveal as="li" key={doc.slug} delay={(i % 2) * 0.06}>
              <Link
                href={`/legal/${doc.slug}`}
                className="group flex h-full flex-col justify-between rounded-card border border-border bg-surface p-6 transition-colors hover:border-border-hover"
              >
                <div>
                  <h2 className="text-2xl text-text-primary">{doc.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-text-secondary">{doc.description}</p>
                </div>
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-text-primary">
                  Read <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </span>
              </Link>
            </Reveal>
          ))}
        </ul>

        <div className="mt-12 grid gap-4 md:grid-cols-2">
          <div className="rounded-card bg-navy p-6 text-white">
            <ShieldCheck className="h-5 w-5 text-white/70" />
            <p className="mt-4 font-display text-2xl">Found a security issue?</p>
            <p className="mt-2 text-sm leading-relaxed text-white/70">
              Report it privately to <a href={`mailto:${company.securityEmail}`} className="underline">{company.securityEmail}</a>.
              See our Responsible Disclosure Policy for how we work with researchers.
            </p>
          </div>
          <div className="rounded-card border border-border bg-surface p-6">
            <Lock className="h-5 w-5 text-brand-600" />
            <p className="mt-4 font-display text-2xl text-text-primary">Questions about your data?</p>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">
              Write to our Grievance Officer at{' '}
              <a href={`mailto:${company.grievanceEmail}`} className="underline">{company.grievanceEmail}</a>, or email{' '}
              <a href={`mailto:${company.email}`} className="underline">{company.email}</a>.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
