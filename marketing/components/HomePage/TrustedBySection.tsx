import React from 'react';
import { ClientLogo as ClientLogoType } from './Home';

interface TrustedBySectionProps {
  clientLogos: ClientLogoType[];
  loading: boolean;
}

const TrustedBySection: React.FC<TrustedBySectionProps> = ({ clientLogos, loading }) => {
  let trustedLogos = clientLogos
    .filter(logo => logo.trusted_by_order && logo.trusted_by_order > 0)
    .sort((a, b) => (a.trusted_by_order || 0) - (b.trusted_by_order || 0))
    .slice(0, 8);

  if (trustedLogos.length === 0) {
    trustedLogos = clientLogos.slice(0, 8);
  }

  if (!loading && trustedLogos.length === 0) return null;

  return (
    <section className="border-b border-border py-10 lg:py-12" aria-label="Trusted by">
      <div className="container-page flex flex-col gap-6 lg:flex-row lg:items-center lg:gap-12">
        <p className="shrink-0 text-sm text-text-secondary lg:max-w-[11rem]">
          Trusted by brands and organisers across India
        </p>

        {loading ? (
          <div className="flex flex-1 flex-wrap gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-7 w-20 animate-pulse rounded bg-background-secondary" />
            ))}
          </div>
        ) : (
          <ul className="flex flex-1 flex-wrap items-center gap-x-10 gap-y-6 lg:justify-between">
            {trustedLogos.map((logo) => (
              <li key={logo.id}>
                {/* Logos come from the CMS, so dimensions are unknown up front. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={logo.logo_url}
                  alt={logo.name}
                  loading="lazy"
                  className="h-8 max-w-[120px] object-contain opacity-90 transition-opacity duration-300 hover:opacity-100 md:h-9"
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default TrustedBySection;
