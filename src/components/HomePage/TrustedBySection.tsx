import React from 'react';
import { ClientLogo as ClientLogoType } from './Home';

interface TrustedBySectionProps {
  clientLogos: ClientLogoType[];
  loading: boolean;
}

const TrustedBySection: React.FC<TrustedBySectionProps> = ({ clientLogos, loading }) => {
  // Filter logos with trusted_by_order > 0 and sort by trusted_by_order
  let trustedLogos = clientLogos
    .filter(logo => logo.trusted_by_order && logo.trusted_by_order > 0)
    .sort((a, b) => (a.trusted_by_order || 0) - (b.trusted_by_order || 0))
    .slice(0, 6); // Ensure we only show up to 6 logos

  // If no logos have trusted_by_order set, fallback to first 6 logos
  if (trustedLogos.length === 0) {
    trustedLogos = clientLogos.slice(0, 6);
  }

  if (loading) {
    return (
      <section className="relative py-12 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-blue-200/20 to-indigo-300/15 rounded-full blur-3xl animate-pulse opacity-50" style={{ animationDuration: '4s' }}></div>
          <div className="absolute bottom-0 right-0 w-60 h-60 bg-gradient-to-br from-purple-200/20 to-pink-300/15 rounded-full blur-3xl animate-pulse opacity-50" style={{ animationDuration: '6s', animationDelay: '2s' }}></div>
          <div className="absolute inset-0 opacity-[0.02]" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, rgba(59, 130, 246, 0.8) 1px, transparent 0)`,
            backgroundSize: '50px 50px'
          }}></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500 mb-2">Trusted by leading brands</p>
            <p className="text-sm text-gray-500 mb-8">Selected partners</p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-12 w-24 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  // If no logos available, don't render the section
  if (!loading && trustedLogos.length === 0) {
    return null;
  }

  return (
    <section className="relative py-12 bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-blue-200/20 to-indigo-300/15 rounded-full blur-3xl animate-pulse opacity-50" style={{ animationDuration: '4s' }}></div>
        <div className="absolute bottom-0 right-0 w-60 h-60 bg-gradient-to-br from-purple-200/20 to-pink-300/15 rounded-full blur-3xl animate-pulse opacity-50" style={{ animationDuration: '6s', animationDelay: '2s' }}></div>
        <div className="absolute inset-0 opacity-[0.02]" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(59, 130, 246, 0.8) 1px, transparent 0)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center">
          <p className="text-sm font-medium text-gray-500 mb-2">Trusted by leading brands</p>
          <p className="text-sm text-gray-500 mb-8">Selected partners</p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {trustedLogos.map((logo) => (
              <div 
                key={logo.id} 
                className="transition-all duration-300 opacity-85 hover:opacity-100 hover:scale-105"
              >
                <img 
                  src={logo.logo_url} 
                  alt={logo.name} 
                  className="h-8 md:h-10 object-contain max-w-24 md:max-w-28" 
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TrustedBySection;
