import type { Metadata } from 'next';
import { ArrowRight } from 'lucide-react';
import Button from '../../components/ui/Button';
import PageHeader from '../../components/ui/PageHeader';
import SectionHeader from '../../components/ui/SectionHeader';
import Accordion from '../../components/ui/Accordion';
import HowItWorks from '../../components/HomePage/HowItWorks';
import InteractiveDashboard from '../../components/HomePage/InteractiveDashboard';
import TrustSection from '../../components/HomePage/TrustSection';
import FinalCTA from '../../components/HomePage/FinalCTA';
import { SIGN_UP_BRAND_URL, SIGN_UP_ORGANIZER_URL } from '../../lib/site';

export const metadata: Metadata = {
  title: 'How it works',
  description:
    'How brands and event organisers find each other on Sponsor Studio: verified listings, credit-based matching, arranged meetings and post-event reports.',
  alternates: { canonical: '/how-it-works' },
};

// Answers follow the platform flow in the product documentation.
const questions = [
  {
    question: 'How are listings verified?',
    answer:
      'Organisers submit their event with dates, audience details and packages, and sign a listing MOU with Sponsor Studio. Our team reviews every listing before brands can see it.',
  },
  {
    question: 'What happens when a brand likes a listing?',
    answer:
      'Expressing interest costs 50 credits and the organiser is notified straight away. The match stays pending until the organiser accepts it.',
  },
  {
    question: 'Who sets up the meeting?',
    answer: 'Once the organiser accepts, Sponsor Studio arranges the meeting between both sides so you can agree deliverables and terms.',
  },
  {
    question: 'What reports can brands request?',
    answer:
      'A risk analysis before you commit budget (500 credits) and a post-event report once the event is over (100 credits). Both are prepared by our team.',
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <PageHeader
        title={
          <>
            How Sponsor Studio <span className="italic">works</span>
          </>
        }
        description="Brands discover verified events, creators and outdoor media. Organisers list once and hear from brands that fit. We handle the checks, the introductions and the reporting in between."
        actions={
          <>
            <Button href={SIGN_UP_BRAND_URL} size="lg">
              I&apos;m a brand <ArrowRight className="h-4 w-4" />
            </Button>
            <Button href={SIGN_UP_ORGANIZER_URL} size="lg" variant="secondary">
              I&apos;m listing an event
            </Button>
          </>
        }
      />
      <HowItWorks />
      <InteractiveDashboard />
      <TrustSection />
      <section className="border-t border-border py-20 lg:py-28">
        <div className="container-page grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <SectionHeader
              title={
                <>
                  Common <span className="italic">questions</span>
                </>
              }
              description="More in the full FAQ."
            />
            <Button href="/faq" variant="secondary" className="mt-6">
              Read the FAQ
            </Button>
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
