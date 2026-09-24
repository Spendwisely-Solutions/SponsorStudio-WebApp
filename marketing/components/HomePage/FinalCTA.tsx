import React from 'react';
import { ArrowRight } from 'lucide-react';
import Button from '../ui/Button';
import Reveal from '../motion/Reveal';
import { SIGN_UP_URL } from '../../lib/site';

const FinalCTA: React.FC = () => {
  return (
    <section className="section-dark mb-3 lg:mb-4">
      <div className="container-page grid gap-10 py-20 lg:grid-cols-12 lg:items-end lg:py-28">
        <Reveal className="lg:col-span-8">
          <h2 className="text-5xl text-white sm:text-6xl">
            Your next sponsor is <span className="italic">already looking.</span>
          </h2>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/70">
            Create a free account to browse verified opportunities, or list your event and let brands come to you.
          </p>
        </Reveal>
        <Reveal delay={0.15} className="flex flex-col gap-3 sm:flex-row lg:col-span-4 lg:justify-end">
          <Button href={SIGN_UP_URL} variant="inverse" size="lg">
            Get started
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button href="/book-demo" variant="outline-inverse" size="lg">
            Book a demo
          </Button>
        </Reveal>
      </div>
    </section>
  );
};

export default FinalCTA;
