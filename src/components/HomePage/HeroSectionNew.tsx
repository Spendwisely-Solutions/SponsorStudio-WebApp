import React, { useEffect, useRef } from 'react';
import { ArrowRight, ChevronRight } from 'lucide-react';
import { User } from '../../App';

interface HeroSectionProps {
  user: User | null;
  setShowAuthForm: (value: boolean) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ user, setShowAuthForm }) => {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Stagger in the hero elements
    const elements = heroRef.current?.querySelectorAll('.hero-animate');
    elements?.forEach((el, i) => {
      (el as HTMLElement).style.animationDelay = `${i * 0.15}s`;
    });
  }, []);

  const stats = [
    { value: '1000+', label: 'Events Listed' },
    { value: '50+', label: 'Brands and counting' },
    { value: '2 Cr+', label: 'Funds Raised' },
    { value: '100+', label: 'Deals Facilitated' },
  ];

  return (
    <div
      ref={heroRef}
      className="relative min-h-screen flex flex-col overflow-hidden bg-gradient-to-br from-background via-background-secondary to-background transition-colors duration-500"
    >
      {/* Animated grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `
            linear-gradient(color-mix(in srgb, var(--color-primary) 15%, transparent) 1px, transparent 1px),
            linear-gradient(90deg, color-mix(in srgb, var(--color-primary) 15%, transparent) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--color-info) 10%, transparent) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--color-primary) 10%, transparent) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-5"
        style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--color-primary) 5%, transparent) 0%, transparent 70%)', filter: 'blur(60px)' }} />

      {/* India's #1 badge */}
      <div className="relative z-10 flex justify-center pt-28 md:pt-32 pb-2">
        <div className="hero-animate opacity-0 animate-fade-in inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-info/30 bg-info/10 text-info text-xs font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          India's #1 Sponsorship Deal Platform
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 sm:px-6 text-center pt-6 pb-16">
        {/* Hero headline */}
        <h1 className="hero-animate opacity-0 animate-fade-in max-w-5xl mx-auto mb-6">
          <span className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight text-text-primary">
            Where Brands and Events
          </span>
          <span
            className="block text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black leading-[1.05] tracking-tight"
            style={{
              background: 'linear-gradient(90deg, #00D4FF 0%, #6366F1 50%, #00D4FF 100%)',
              backgroundSize: '200% auto',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              animation: 'shimmer 4s linear infinite',
            }}
          >
            Build Better Partnerships.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="hero-animate opacity-0 animate-fade-in max-w-3xl text-base sm:text-lg md:text-xl text-text-secondary leading-relaxed mb-10">
          Sponsor Studio brings organizers and brands together on a trusted platform designed to discover opportunities, simplify negotiations, and deliver measurable sponsorship success.
        </p>

        {/* CTA Buttons */}
        <div className="hero-animate opacity-0 animate-fade-in flex flex-col sm:flex-row gap-4 mb-16">
          {user ? (
            <>
              <a
                href="/dashboard"
                className="group inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-[#0A1628] text-base transition-all duration-300 hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #00D4FF, #3B82F6)',
                  boxShadow: '0 0 30px rgba(0,212,255,0.4)',
                }}
              >
                Explore Opportunities
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="/dashboard"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-text-primary text-base border border-border bg-surface/20 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-surface-hover/30"
              >
                List Your Event
                <ChevronRight className="w-5 h-5" />
              </a>
            </>
          ) : (
            <>
              <button
                onClick={() => setShowAuthForm(true)}
                className="group inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-[#0A1628] text-base transition-all duration-300 hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, #00D4FF, #3B82F6)',
                  boxShadow: '0 0 30px rgba(0,212,255,0.4)',
                }}
              >
                Explore Opportunities
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => setShowAuthForm(true)}
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-semibold text-text-primary text-base border border-border bg-surface/20 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-surface-hover/30"
              >
                List Your Event
                <ChevronRight className="w-5 h-5" />
              </button>
            </>
          )}
        </div>

        {/* Stats Row */}
        <div className="hero-animate opacity-0 animate-fade-in w-full max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="relative group rounded-2xl p-4 text-center transition-all duration-300 hover:scale-105 bg-surface border border-border backdrop-blur-md"
              >
                <div
                  className="text-2xl sm:text-3xl font-black mb-1"
                  style={{
                    background: 'linear-gradient(135deg, #00D4FF, #6366F1)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-text-secondary font-medium">{stat.label}</div>
                {/* Hover glow */}
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: 'linear-gradient(135deg, rgba(0,212,255,0.05), rgba(99,102,241,0.05))' }} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hero Dashboard Image - Hidden for now
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-8 pb-16">
        <div className="hero-animate opacity-0 animate-fade-in relative rounded-2xl overflow-hidden border border-border shadow-xl">
          <div className="flex items-center gap-2 px-4 py-3 bg-surface border-b border-border">
            <div className="w-3 h-3 rounded-full bg-red-500/70" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <div className="w-3 h-3 rounded-full bg-green-500/70" />
            <span className="ml-3 text-xs text-text-secondary">sponsorstudio.in/dashboard</span>
          </div>
          <img
            src="/hero-dashboard.png"
            alt="SponsorStudio Dashboard Preview"
            className="w-full h-auto object-cover"
            style={{ maxHeight: '520px', objectPosition: 'top' }}
          />
          <div className="absolute bottom-0 left-0 right-0 h-24"
            style={{ background: 'linear-gradient(to top, var(--color-background), transparent)' }} />
        </div>
      </div>
      */}

      {/* CSS Animations */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        @keyframes shimmer {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
      `}</style>
    </div>
  );
};

export default HeroSection;