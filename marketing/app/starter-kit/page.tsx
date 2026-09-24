import type { Metadata } from 'next';
import { ArrowRight, BookOpen, Check, Clapperboard, Contact } from 'lucide-react';
import Button from '../../components/ui/Button';
import PageHeader from '../../components/ui/PageHeader';
import SectionHeader from '../../components/ui/SectionHeader';
import Reveal from '../../components/motion/Reveal';
import FinalCTA from '../../components/HomePage/FinalCTA';
import { starterKit } from '../../lib/pricing';

export const metadata: Metadata = {
  title: 'Event Sponsor Starter Kit',
  description:
    'Get your event sponsor-ready with the Sponsor Studio Starter Kit, including an event introduction video that helps you pitch like the big festivals do.',
  alternates: { canonical: '/starter-kit' },
};

const icons = [Contact, BookOpen, Clapperboard];

export default function StarterKitPage() {
  return (
    <>
      <PageHeader
        title={
          <>
            Get your event <span className="italic">sponsor-ready.</span>
          </>
        }
        description="Brands invest in events that look professional, structured and worth their marketing budget. The Event Sponsor Starter Kit gives you the leads, brochure and video to pitch your event like the big festivals do."
        actions={
          <>
            <Button href="/contact-us" size="lg">
              Get the starter kit <ArrowRight className="h-4 w-4" />
            </Button>
            <Button href="/book-demo" size="lg" variant="secondary">
              Talk to the team first
            </Button>
          </>
        }
      />

      <section className="border-t border-border bg-background-secondary py-20 lg:py-28">
        <div className="container-page grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <SectionHeader
              title={
                <>
                  What&apos;s <span className="italic">in the kit</span>
                </>
              }
            />
            <ul className="mt-10 space-y-4">
              {starterKit.includes.map((item, i) => {
                const Icon = icons[i] ?? Check;
                return (
                  <Reveal as="li" key={item.title} delay={i * 0.08}>
                    <div className="flex gap-4 rounded-card border border-border bg-surface p-6">
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                        <Icon className="h-5 w-5" />
                      </span>
                      <div>
                        <h3 className="text-lg font-semibold text-text-primary">{item.title}</h3>
                        {item.description && <p className="mt-1 leading-relaxed text-text-secondary">{item.description}</p>}
                      </div>
                    </div>
                  </Reveal>
                );
              })}
            </ul>
          </div>

          <div className="lg:col-span-5">
            <Reveal className="rounded-card bg-navy p-8 text-white lg:sticky lg:top-[calc(var(--nav-height)+2rem)]">
              <p className="text-sm text-white/60">One-time package</p>
              <p className="mt-2 font-display text-5xl">{starterKit.price}</p>
              <p className="mt-2 text-sm text-white/70">{starterKit.priceNote}</p>
              <ul className="mt-8 space-y-3 border-t border-white/15 pt-6 text-sm text-white/80">
                {starterKit.includes.map((item) => (
                  <li key={item.title} className="flex gap-3">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-white" />
                    {item.title}
                  </li>
                ))}
              </ul>
              <Button href="/contact-us" variant="inverse" size="lg" className="mt-8 w-full">
                Get the starter kit
              </Button>
            </Reveal>
          </div>
        </div>
      </section>

      <FinalCTA />
    </>
  );
}
