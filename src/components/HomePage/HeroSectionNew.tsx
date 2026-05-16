import React, { useEffect, useRef } from 'react';
import { ArrowRight, Play, Zap, Shield, Target, Star } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { User } from '../../App';

gsap.registerPlugin(ScrollTrigger);

interface HeroSectionProps {
  user: User | null;
  setShowAuthForm: (value: boolean) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ user, setShowAuthForm }) => {
  const heroRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const buttonRef = useRef<HTMLButtonElement | HTMLAnchorElement>(null);
  const titleRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    // Animate hero container
    gsap.fromTo(
      heroRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: heroRef.current, fastScrollEnd: true } }
    );

    // Animate heading text
    gsap.fromTo(
      textRef.current,
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 1.4, ease: 'power4.out', delay: 0.2, clearProps: "all" }
    );

    // Animate CTA button with smoother easing
    gsap.fromTo(
      buttonRef.current,
      { opacity: 0, y: 20 },
      { 
        opacity: 1, 
        y: 0, 
        duration: 0.8, 
        ease: 'power3.out', // Changed to power3.out for smoother motion
        delay: 0.4,
        clearProps: "all",
        overwrite: 'auto' // Prevent animation conflicts
      }
    );

    // Animate feature cards
    gsap.fromTo(
      '.feature-card',
      { opacity: 0, y: 30, scale: 0.9 },
      { opacity: 1, y: 0, scale: 1, duration: 0.8, ease: 'power2.out', delay: 0.8, stagger: 0.1 }
    );

    // Animate feature badges
    gsap.fromTo(
      '.feature-badge',
      { opacity: 0, x: -20, scale: 0.9 },
      { opacity: 1, x: 0, scale: 1, duration: 0.6, ease: 'back.out(1.7)', delay: 0.6, stagger: 0.1 }
    );

    // Animate floating elements
    gsap.fromTo(
      '.floating-element',
      { opacity: 0, scale: 0 },
      { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.7)', delay: 1, stagger: 0.1 }
    );

    // Animate stats
    gsap.fromTo(
      '.stat-item',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', delay: 1.2, stagger: 0.1 }
    );

    // Animate title
    const tl = gsap.timeline();
    tl.fromTo(
      titleRef.current,
      { y: 40, opacity: 0, scale: 0.95 },
      { y: 0, opacity: 1, scale: 1, duration: 1.5, ease: 'back.out(1.2)', clearProps: "all" }
    );

    // Add hover animation for button
    const button = buttonRef.current;
    if (button) {
      button.addEventListener('mouseenter', () => {
        gsap.to(button, {
          scale: 1.05,
          boxShadow: '0 10px 20px rgba(0, 0, 0, 0.2)',
          duration: 0.3,
          ease: 'power3.out',
          overwrite: 'auto'
        });
      });
      button.addEventListener('mouseleave', () => {
        gsap.to(button, {
          scale: 1,
          boxShadow: '0 10px 15px rgba(0, 0, 0, 0.15)',
          duration: 0.3,
          ease: 'power3.out',
          overwrite: 'auto'
        });
      });
    }

    return () => {
      if (button) {
        button.removeEventListener('mouseenter', () => {});
        button.removeEventListener('mouseleave', () => {});
      }
    };
  }, []);

  return (
    <div ref={heroRef} className="min-h-screen flex items-center relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Enhanced background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-200/40 to-indigo-300/30 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '4s' }}></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-br from-purple-200/40 to-pink-300/30 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }}></div>
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgba(59, 130, 246, 0.8) 1px, transparent 0)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left side - Enhanced main content */}
          <div className="text-center lg:text-left space-y-8">
            {/* Enhanced trust badge */}
            <div className="inline-flex items-center px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-blue-100/50 mb-2 opacity-0">
              <div className="flex -space-x-2 mr-4">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full border-2 border-white shadow-sm"></div>
                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full border-2 border-white shadow-sm"></div>
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full border-2 border-white shadow-sm"></div>
                <div className="w-8 h-8 bg-gradient-to-r from-gray-400 to-gray-500 rounded-full border-2 border-white shadow-sm flex items-center justify-center">
                  <span className="text-xs text-white font-bold">+</span>
                </div>
              </div>
              <div>
                <span className="text-sm font-semibold text-gray-800">10,000+ Active Users</span>
                <div className="flex items-center mt-1">
                  <div className="flex text-yellow-400 mr-2">
                    {Array(5).fill(0).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-current" />
                    ))}
                  </div>
                  <span className="text-xs text-gray-600">4.9/5 rating</span>
                </div>
              </div>
            </div>

            {/* Key Features Strip */}
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start mb-6">
              <div className="feature-badge flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-2 rounded-full border border-blue-200/50 shadow-sm">
                <Zap className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">Smart Matching</span>
              </div>
              <div className="feature-badge flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 rounded-full border border-green-200/50 shadow-sm">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Secure Transactions</span>
              </div>
              <div className="feature-badge flex items-center gap-2 bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-2 rounded-full border border-purple-200/50 shadow-sm">
                <Target className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Event Analytics</span>
              </div>
            </div>

            {/* Main heading */}
            <div className="space-y-4">
              <h1 ref={textRef} className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 leading-[1.2] md:leading-[1.3] tracking-tight">
                <span
                  ref={titleRef}
                  className="flex flex-col justify-center bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent min-h-[120px] sm:min-h-[160px] md:min-h-[180px] lg:min-h-[220px]"
                >
                  The Marketplace for<br className="md:block" />
                  <span className="block mt-2 md:mt-0 pb-3">Event Sponsorships</span>
                </span>
              </h1>

              {/* Subtitle */}
              <p className="text-xl sm:text-2xl text-gray-600 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-light mt-2">
                Discover, pitch, and secure sponsorships-all in one place.
              </p>
            </div>

            {/* Enhanced CTA section */}
            <div className="space-y-6">
              <div className="flex flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                {user ? (
                  <a
                    ref={buttonRef as React.RefObject<HTMLAnchorElement>}
                    href="/dashboard"
                    className="group inline-flex items-center px-4 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-base sm:text-lg font-semibold rounded-2xl hover:from-blue-700 hover:to-indigo-700 shadow-xl transition-all duration-300 transform flex-1 sm:flex-none justify-center"
                    style={{ transition: 'all 0.3s ease' }} // Smooth CSS transition
                  >
                    <span className="hidden sm:inline">Dashboard</span>
                    <span className="sm:hidden">Dashboard</span>
                    <ArrowRight className="ml-2 sm:ml-3 h-4 sm:h-5 w-4 sm:w-5 group-hover:translate-x-1 transition-transform duration-200" />
                  </a>
                ) : (
                  <button
                    ref={buttonRef as React.RefObject<HTMLButtonElement>}
                    onClick={() => setShowAuthForm(true)}
                    className="group inline-flex items-center px-4 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-base sm:text-lg font-semibold rounded-2xl hover:from-blue-700 hover:to-indigo-700 shadow-xl transition-all duration-300 transform flex-1 sm:flex-none justify-center"
                    style={{ transition: 'all 0.3s ease' }} // Smooth CSS transition
                  >
                    <span className="hidden sm:inline">Get Started</span>
                    <span className="sm:hidden">Get Started</span>
                    <ArrowRight className="ml-2 sm:ml-3 h-4 sm:h-5 w-4 sm:w-5 group-hover:translate-x-1 transition-transform duration-200" />
                  </button>
                )}
                <a href="#about-video" className="flex-1 sm:flex-none hidden">
                  <button className="group inline-flex items-center px-4 sm:px-8 py-3 sm:py-4 bg-white/80 backdrop-blur-sm text-gray-700 text-base sm:text-lg font-semibold rounded-2xl border-2 border-gray-200/50 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-300 shadow-lg hover:shadow-xl w-full justify-center">
                    <div className="w-8 sm:w-10 h-8 sm:h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mr-2 sm:mr-3 group-hover:scale-110 transition-transform duration-200">
                      <Play className="w-3 sm:w-4 h-3 sm:h-4 text-white ml-0.5" fill="currentColor" />
                    </div>
                    <span className="hidden sm:inline">Watch Demo</span>
                    <span className="sm:hidden">Demo</span>
                  </button>
                </a>
              </div>
            </div>
          </div>

          {/* Right side - Hero image */}
          <div className="relative lg:pl-8 flex items-center justify-center">
            <div className="relative w-full lg:w-120 xl:w-140">
              <div className="relative rounded-3xl bg-transparent overflow-hidden transform scale-110 lg:scale-125">
                <img
                  src="/hero-img.png"
                  alt="Event sponsorship platform dashboard"
                  className="w-full h-auto object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default HeroSection;