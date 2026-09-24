import type { Metadata } from 'next';
import Link from 'next/link';
import PageHeader from '../../components/ui/PageHeader';
import SectionHeader from '../../components/ui/SectionHeader';
import Accordion from '../../components/ui/Accordion';
import PricingSection from '../../components/HomePage/PricingSection';
import FinalCTA from '../../components/HomePage/FinalCTA';
import { CREDIT_VALIDITY_DAYS } from '../../lib/pricing';

export const metadata: Metadata = {
  title: 'Pricing',
  description:
    'Sponsor Studio pricing for brands and event organisers: credit packs from ₹10,000, free event listings, and commission only on sponsorship deals that close.',
  alternates: { canonical: '/pricing' },
};

// Answers come from the pricing section of the product documentation (see lib/pricing.ts).
const questions = [
  {
    question: 'What are credits used for?',
    answer:
      'Brands spend credits when they act on a listing: 50 to express interest, 100 to unlock a brochure or get a post-event report, 300 to revive listings you passed on, and 500 for a risk analysis. Browsing is free.',
  },
  {
    question: 'Is there an offer on my first purchase?',
    answer: 'Yes. First-time buyers can get the Professional pack of 5,000 credits for ₹5,000 instead of ₹20,000.',
  },
  {
    question: 'How long do credits last?',
    answer: `Credits are valid for ${CREDIT_VALIDITY_DAYS} days from the date you buy them.`,
  },
  {
    question: 'Do organisers pay to list an event?',
    answer:
      'No. Listing is free once our team has verified your event. You pay ₹5,000 per event to unlock the brands that are interested in it.',
  },
  {
    question: 'What is the difference between Basic and VIP?',
    answer:
      'Basic listings pay a 10% commission on sponsorship that closes. VIP listings pay ₹20,000 upfront and a 25% commission, and are managed end to end by our team. The upfront fee is refunded if less than ₹2L in sponsorship is secured.',
  },
  {
    question: 'When is commission charged?',
    answer: 'Only on sponsorship deals that close through Sponsor Studio. If no deal closes, there is no commission.',
  },
  {
    question: 'What is the strategy consultation?',
    answer:
      'A one-hour session with our team to plan your sponsorship strategy, booked separately from credits. It costs ₹5,000 plus 18% GST (₹5,900 in total).',
  },
  {
    question: 'Can I see the platform before paying?',
    answer: (
      <>
        Yes. <Link href="/book-demo" className="font-medium text-text-primary underline underline-offset-4">Book a demo</Link> and
        we&apos;ll walk you through it.
      </>
    ),
  },
];

export default function PricingPage() {
  return (
    <>
      <PageHeader
        title={
          <>
            Pay for what you use, <span className="italic">nothing hidden.</span>
          </>
        }
        description="Brands buy credits and spend them only on the listings they act on. Organisers list for free, then pay to unlock interested brands and a commission on deals that close."
      />
      <PricingSection showHeader={false} />
      <section className="py-20 lg:py-28">
        <div className="container-page grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeader
              title={
                <>
                  Pricing <span className="italic">questions</span>
                </>
              }
            />
          </div>
          <div className="lg:col-span-8">
            <Accordion items={questions} />
          </div>
        </div>
      </section>
      <FinalCTA />
    </>
  );
}
