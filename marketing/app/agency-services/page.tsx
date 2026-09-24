import type { Metadata } from 'next';
import { ArrowRight, FileSignature, Handshake, Megaphone, Truck } from 'lucide-react';
import Button from '../../components/ui/Button';
import PageHeader from '../../components/ui/PageHeader';
import SectionHeader from '../../components/ui/SectionHeader';
import Reveal from '../../components/motion/Reveal';
import FinalCTA from '../../components/HomePage/FinalCTA';
import { agency } from '../../lib/pricing';
import { CONTACT_EMAIL } from '../../lib/site';

export const metadata: Metadata = {
  title: 'Agency services',
  description:
    'Sponsor Studio runs sponsorship end to end for events working at scale: brand introductions, MOUs, promotional content, and outdoor and event-setup partners.',
  alternates: { canonical: '/agency-services' },
};

const services = [
  {
    icon: Handshake,
    title: 'Brand introductions',
    description: 'We find and approach the brands that fit your audience, and set up the conversations for you.',
  },
  {
    icon: FileSignature,
    title: 'MOUs and agreements',
    description: 'We prepare and get the sponsorship MOUs signed, so terms and deliverables are clear on both sides.',
  },
  {
    icon: Megaphone,
    title: 'Promotional content',
    description: 'We provide the promotional content that sponsors expect before, during and after your event.',
  },
  {
    icon: Truck,
    title: 'Outdoor and event-setup partners',
    description: 'We connect you with outdoor advertising and event-setup teams to deliver what sponsors paid for.',
  },
];

export default function AgencyServicesPage() {
  return (
    <>
      <PageHeader
        title={
          <>
            Sponsorship, <span className="italic">handled for you.</span>
          </>
        }
        description="For events working at a larger scale, our team runs sponsorship end to end: from the first brand conversation to the partners who deliver on the day. You don't need to list on the platform."
        actions={
          <>
            <Button href="/contact-us" size="lg">
              Enquire about agency services <ArrowRight className="h-4 w-4" />
            </Button>
            <Button href={`mailto:${CONTACT_EMAIL}?subject=Agency%20services%20enquiry`} size="lg" variant="secondary">
              Email the team
            </Button>
          </>
        }
      />

      <section className="border-t border-border bg-background-secondary py-20 lg:py-28">
        <div className="container-page">
          <SectionHeader
            title={
              <>
                What we <span className="italic">take care of</span>
              </>
            }
          />
          <ul className="mt-12 grid gap-4 md:grid-cols-2">
            {services.map((service, i) => (
              <Reveal as="li" key={service.title} delay={(i % 2) * 0.08}>
                <div className="flex h-full gap-4 rounded-card border border-border bg-surface p-6">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                    <service.icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-text-primary">{service.title}</h3>
                    <p className="mt-1 leading-relaxed text-text-secondary">{service.description}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section className="py-20 lg:py-28">
        <div className="container-page grid gap-12 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-6">
            <SectionHeader
              title={
                <>
                  How the <span className="italic">fee works</span>
                </>
              }
              description="You pay a small advance to get started. Our commission comes from the sponsorship we bring in, with the advance adjusted against it, so our incentive is the same as yours."
            />
          </div>
          <Reveal className="rounded-card bg-navy p-8 text-white lg:col-span-5 lg:col-start-8">
            <dl className="divide-y divide-white/15">
              <div className="pb-5">
                <dt className="text-sm text-white/60">To get started</dt>
                <dd className="mt-1 font-display text-4xl">{agency.advance}</dd>
              </div>
              <div className="py-5">
                <dt className="text-sm text-white/60">On the final sponsorship turnover</dt>
                <dd className="mt-1 font-display text-4xl">{agency.commission}</dd>
              </div>
              <div className="pt-5 text-sm leading-relaxed text-white/70">{agency.note}</div>
            </dl>
            <Button href="/contact-us" variant="inverse" size="lg" className="mt-8 w-full">
              Start a conversation
            </Button>
          </Reveal>
        </div>
      </section>

      <FinalCTA />
    </>
  );
}
