import React from 'react';
import SectionHeader from '../ui/SectionHeader';
import Reveal from '../motion/Reveal';
import { testimonials } from '../../lib/testimonials';

const initials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

const TestimonialsSection: React.FC = () => {
  if (testimonials.length === 0) return null;

  return (
    <section id="testimonials" className="py-20 lg:py-28">
      <div className="container-page">
        <SectionHeader
          title={
            <>
              In their <span className="italic">own words</span>
            </>
          }
          description="What brands and organisers say about working with Sponsor Studio."
        />
        <ul className="mt-14 grid gap-4 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <Reveal as="li" key={`${t.name}-${i}`} delay={i * 0.08} className="flex">
              <figure className="flex w-full flex-col justify-between rounded-card border border-border bg-surface p-7">
                <blockquote className="font-display text-xl leading-snug text-text-primary">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <figcaption className="mt-8 flex items-center gap-3 border-t border-border pt-6">
                  {t.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={t.image} alt="" className="h-10 w-10 rounded-full object-cover" />
                  ) : (
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-700">
                      {initials(t.name)}
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-text-primary">{t.name}</p>
                    <p className="truncate text-xs text-text-secondary">
                      {t.role}, {t.company}
                    </p>
                  </div>
                  <span className="ml-auto shrink-0 rounded-full border border-border px-2.5 py-0.5 text-xs text-text-secondary">
                    {t.audience}
                  </span>
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default TestimonialsSection;
