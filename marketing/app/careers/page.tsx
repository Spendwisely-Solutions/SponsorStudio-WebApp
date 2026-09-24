import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import Button from '../../components/ui/Button';
import PageHeader from '../../components/ui/PageHeader';
import SectionHeader from '../../components/ui/SectionHeader';
import Reveal from '../../components/motion/Reveal';
import CareersApplication from '../../components/CareersApplication';
import { roles } from '../../lib/careers';
import { CONTACT_EMAIL } from '../../lib/site';

export const metadata: Metadata = {
  title: 'Careers',
  description: 'Join Sponsor Studio and help build India’s sponsorship marketplace for brands and event organisers.',
  alternates: { canonical: '/careers' },
};

export default function CareersPage() {
  return (
    <>
      <PageHeader
        title={
          <>
            Build the way India <span className="italic">sponsors events.</span>
          </>
        }
        description="We're a small team connecting brands with the events their audiences love. If you like fast work, real ownership and the events industry, we'd like to hear from you."
        actions={
          roles.length > 0 && (
            <Button href="#open-roles" size="lg">
              See open roles <ArrowRight className="h-4 w-4" />
            </Button>
          )
        }
      />

      <section id="open-roles" className="scroll-mt-[var(--nav-height)] border-t border-border bg-background-secondary py-20 lg:py-28">
        <div className="container-page">
          <SectionHeader
            title={
              <>
                Open <span className="italic">roles</span>
              </>
            }
          />
          {roles.length === 0 ? (
            <p className="mt-10 text-text-secondary">
              No open roles right now. You can still send your CV to {CONTACT_EMAIL}.
            </p>
          ) : (
            <ul className="mt-12 space-y-4">
              {roles.map((role) => (
                <Reveal as="li" key={role.id}>
                  <article id={role.id} className="rounded-card border border-border bg-surface p-6 sm:p-8">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <h3 className="font-display text-3xl text-text-primary">{role.title}</h3>
                        <p className="mt-2 text-sm text-text-muted">
                          {role.team} · {role.location} · {role.type}
                        </p>
                      </div>
                      <Button href="#apply" variant="secondary">
                        Apply
                      </Button>
                    </div>
                    <p className="mt-5 max-w-3xl text-lg leading-relaxed text-text-secondary">{role.summary}</p>
                    <div className="mt-6 grid gap-8 md:grid-cols-2">
                      <div>
                        <h4 className="text-sm font-semibold text-text-primary">What you&apos;ll do</h4>
                        <ul className="mt-3 space-y-2 text-text-secondary">
                          {role.responsibilities.map((item) => (
                            <li key={item} className="flex gap-3">
                              <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-brand-600" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-text-primary">What we&apos;re looking for</h4>
                        <ul className="mt-3 space-y-2 text-text-secondary">
                          {role.lookingFor.map((item) => (
                            <li key={item} className="flex gap-3">
                              <span className="mt-2.5 h-1 w-1 shrink-0 rounded-full bg-brand-600" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </article>
                </Reveal>
              ))}
            </ul>
          )}
        </div>
      </section>

      {roles.length > 0 && (
        <section id="apply" className="scroll-mt-[var(--nav-height)] py-20 lg:py-28">
          <div className="container-page grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <SectionHeader
                title={
                  <>
                    Apply <span className="italic">in a minute</span>
                  </>
                }
                description="Tell us which role you're interested in and share a link to your CV or portfolio. Applications go straight to the team."
              />
            </div>
            <div className="lg:col-span-7">
              <CareersApplication roles={roles.map(({ id, title }) => ({ id, title }))} />
            </div>
          </div>
        </section>
      )}
    </>
  );
}
