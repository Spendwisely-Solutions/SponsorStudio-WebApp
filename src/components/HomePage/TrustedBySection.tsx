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
    <section
      className="relative py-12 overflow-hidden transition-colors duration-500"
      style={{ background: 'var(--gradient-trusted-by)' }}
    >
      {/* Divider glow line */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, color-mix(in srgb, var(--color-primary) 40%, transparent), transparent)' }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-text-muted mb-8">
          Trusted by leading brands & event organizers
        </p>

        {loading ? (
          <div className="flex justify-center gap-8">
            {Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-8 w-20 bg-surface-hover/30 border border-border/50 rounded animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {trustedLogos.map((logo) => (
              <div
                key={logo.id}
                className="transition-all duration-300 hover:scale-110 opacity-70 hover:opacity-100"
              >
                <img
                  src={logo.logo_url}
                  alt={logo.name}
                  className="h-7 md:h-9 object-contain max-w-[100px] dark:brightness-100"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom divider */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1/2 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, color-mix(in srgb, var(--color-primary) 20%, transparent), transparent)' }}
      />
    </section>
  );
};

export default TrustedBySection;
