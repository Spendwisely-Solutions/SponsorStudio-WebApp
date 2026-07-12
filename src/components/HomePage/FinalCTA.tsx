import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';

interface FinalCTAProps {
  setShowAuthForm: (value: boolean) => void;
}

const FinalCTA: React.FC<FinalCTAProps> = ({ setShowAuthForm }) => {
  return (
    <section className="py-20 px-4 sm:px-8 relative overflow-hidden transition-colors duration-500 bg-background">
      {/* Background gradients */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(color-mix(in srgb, var(--color-primary) 80%, transparent) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full opacity-[0.08]"
        style={{ background: 'radial-gradient(circle, color-mix(in srgb, var(--color-primary) 30%, transparent) 0%, transparent 70%)', filter: 'blur(50px)' }} />

      <div className="max-w-5xl mx-auto relative z-10">
        <div 
          className="relative rounded-3xl p-8 sm:p-12 md:p-16 overflow-hidden border border-border bg-surface/30 backdrop-blur-md shadow-2xl text-center"
        >
          {/* Accent border glow */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-60" />

          {/* Icon Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full text-xs font-semibold bg-primary/10 border border-primary/30 text-primary">
            <Sparkles className="w-3.5 h-3.5" />
            Get Started Today
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-text-primary mb-6 leading-[1.15]">
            Ready to Build Better{' '}
            <span style={{ background: 'linear-gradient(90deg, #00D4FF, #6366F1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Partnerships?
            </span>
          </h2>
          <p className="text-text-secondary text-base sm:text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Join Sponsor Studio to discover target-aligned opportunities, negotiate deals digitally, and track verified campaign success metrics.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setShowAuthForm(true)}
              className="w-full sm:w-auto group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-semibold text-[#0A1628] text-base transition-all duration-300 hover:scale-105"
              style={{
                background: 'linear-gradient(135deg, #00D4FF, #3B82F6)',
                boxShadow: '0 0 30px rgba(0,212,255,0.4)',
              }}
            >
              Sign Up as a Brand
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button
              onClick={() => setShowAuthForm(true)}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-semibold text-text-primary text-base border border-border bg-surface/20 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-surface-hover/30"
            >
              List Your Event Now
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
