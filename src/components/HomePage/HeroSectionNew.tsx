import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Users, TrendingUp, Award, Calendar, MapPin, DollarSign, Star, Play, Zap, Shield, Target } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { User } from '../../App';

gsap.registerPlugin(ScrollTrigger);

interface HeroSectionProps {
  user: User | null;
  setShowAuthForm: (value: boolean) => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ user, setShowAuthForm }) => {
  const titles = [
    "Spend your marketing budget wisely!",
    "Find Sponsors for your event!",
    "Secure your next collaboration with us!"
  ];
  const [currentTitleIndex, setCurrentTitleIndex] = useState<number>(0);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const buttonRef = useRef<HTMLButtonElement | HTMLAnchorElement>(null);
  const titleRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    gsap.fromTo(
      heroRef.current,
      { opacity: 0, y: 50 },
      { opacity: 1, y: 0, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: heroRef.current, fastScrollEnd: true } }
    );

    gsap.fromTo(
      textRef.current,
      { opacity: 0, scale: 0.95 },
      { opacity: 1, scale: 1, duration: 1.2, ease: 'power4.out', delay: 0.2 }
    );

    gsap.fromTo(
      buttonRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out', delay: 0.4 }
    );

    // Animate additional elements
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

    gsap.fromTo(
      '.floating-element',
      { opacity: 0, scale: 0 },
      { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(1.7)', delay: 1, stagger: 0.1 }
    );

    gsap.fromTo(
      '.stat-item',
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', delay: 1.2, stagger: 0.1 }
    );

    // Title rotation with unique slide-up animation and effects
    const interval = setInterval(() => {
      setIsAnimating(true);
      
      // Animate current title out with multiple effects
      const tl = gsap.timeline();
      
      tl.to(titleRef.current, {
        y: -30,
        opacity: 0,
        scale: 0.95,
        rotationX: -15,
        duration: 0.4,
        ease: 'power2.in',
      })
      .call(() => {
        // Change title
        setCurrentTitleIndex((prevIndex) => (prevIndex + 1) % titles.length);
      })
      .set(titleRef.current, { 
        y: 40, 
        opacity: 0, 
        scale: 1.05,
        rotationX: 15 
      })
      .to(titleRef.current, {
        y: 0,
        opacity: 1,
        scale: 1,
        rotationX: 0,
        duration: 0.6,
        ease: 'back.out(1.2)',
        onComplete: () => {
          setIsAnimating(false);
          // Add a subtle bounce effect
          gsap.to(titleRef.current, {
            scale: 1.02,
            duration: 0.1,
            yoyo: true,
            repeat: 1,
            ease: 'power2.inOut'
          });
        }
      });
    }, 4000); // Change title every 4 seconds

    return () => {
      clearInterval(interval);
      if (buttonRef.current) {
        buttonRef.current.removeEventListener('mouseenter', () => {});
        buttonRef.current.removeEventListener('mouseleave', () => {});
      }
    };
  }, []);

  return (
    <div ref={heroRef} className="min-h-screen flex items-center relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Enhanced background elements */}
      <div className="absolute inset-0">
        {/* Animated gradient orbs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-blue-200/40 to-indigo-300/30 rounded-full blur-3xl animate-pulse" style={{animationDuration: '4s'}}></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-br from-purple-200/40 to-pink-300/30 rounded-full blur-3xl animate-pulse" style={{animationDuration: '6s', animationDelay: '2s'}}></div>
        
        {/* Floating geometric shapes */}
        <div className="absolute top-32 left-16 w-6 h-6 bg-blue-400/60 rounded rotate-45 animate-bounce" style={{animationDelay: '0s', animationDuration: '3s'}}></div>
        <div className="absolute top-48 right-24 w-4 h-4 bg-indigo-400/60 rounded-full animate-bounce" style={{animationDelay: '1s', animationDuration: '4s'}}></div>
        <div className="absolute bottom-32 left-32 w-8 h-8 bg-purple-400/60 rounded-full animate-bounce" style={{animationDelay: '2s', animationDuration: '5s'}}></div>
        <div className="absolute bottom-48 right-16 w-5 h-5 bg-pink-400/60 rotate-45 animate-bounce" style={{animationDelay: '0.5s', animationDuration: '3.5s'}}></div>
        
        {/* Floating particles */}
        <div className="absolute top-20 left-1/4 w-2 h-2 bg-blue-300/70 rounded-full animate-pulse" style={{animationDelay: '0s', animationDuration: '2s'}}></div>
        <div className="absolute top-40 left-1/3 w-1 h-1 bg-indigo-300/70 rounded-full animate-pulse" style={{animationDelay: '0.7s', animationDuration: '3s'}}></div>
        <div className="absolute top-60 right-1/3 w-3 h-3 bg-purple-300/70 rounded-full animate-pulse" style={{animationDelay: '1.4s', animationDuration: '2.5s'}}></div>
        <div className="absolute bottom-40 left-1/2 w-2 h-2 bg-pink-300/70 rounded-full animate-pulse" style={{animationDelay: '2.1s', animationDuration: '3.5s'}}></div>
        <div className="absolute bottom-60 right-1/4 w-1 h-1 bg-cyan-300/70 rounded-full animate-pulse" style={{animationDelay: '2.8s', animationDuration: '2.2s'}}></div>
        
        {/* Subtle pattern overlay */}
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
            <div className="inline-flex items-center px-6 py-3 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-blue-100/50 mb-2">
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
                <span className="text-sm font-medium text-blue-800">AI-Powered Matching</span>
              </div>
              <div className="feature-badge flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 rounded-full border border-green-200/50 shadow-sm">
                <Shield className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Secure Transactions</span>
              </div>
              <div className="feature-badge flex items-center gap-2 bg-gradient-to-r from-purple-50 to-pink-50 px-4 py-2 rounded-full border border-purple-200/50 shadow-sm">
                <Target className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">Performance Tracking</span>
              </div>
            </div>

            {/* Main heading with better typography */}
            <div className="space-y-4">
              <h1 ref={textRef} className="text-5xl sm:text-6xl lg:text-7xl font-black text-gray-900 leading-[1.1] tracking-tight">
                <span 
                  ref={titleRef}
                  className="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent min-h-[80px] lg:min-h-[100px] transform"
                >
                  {titles[currentTitleIndex]}
                </span>
              </h1>
              
              {/* Subtitle with better spacing */}
              <p className="text-xl sm:text-2xl text-gray-600 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-light">
                Connect with the right partners for your next event. Our AI-powered platform delivers 
                <span className="font-semibold text-gray-800"> precise matches</span> and 
                <span className="font-semibold text-gray-800"> guaranteed results</span>.
              </p>
            </div>

            {/* Enhanced CTA section */}
            <div className="space-y-6">
              <div className="flex flex-row gap-3 justify-center lg:justify-start">
                {user ? (
                  <a
                    ref={buttonRef as React.RefObject<HTMLAnchorElement>}
                    href="/dashboard"
                    className="group inline-flex items-center px-4 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-base sm:text-lg font-semibold rounded-xl sm:rounded-2xl hover:from-blue-700 hover:to-indigo-700 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                  >
<<<<<<< Updated upstream
                    Get Started Free
                    <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
=======
                    Dashboard
                    <ArrowRight className="ml-2 sm:ml-3 h-4 sm:h-5 w-4 sm:w-5 group-hover:translate-x-1 transition-transform duration-200" />
>>>>>>> Stashed changes
                  </a>
                ) : (
                  <button
                    ref={buttonRef as React.RefObject<HTMLButtonElement>}
                    onClick={() => setShowAuthForm(true)}
                    className="group inline-flex items-center px-4 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-base sm:text-lg font-semibold rounded-xl sm:rounded-2xl hover:from-blue-700 hover:to-indigo-700 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                  >
<<<<<<< Updated upstream
                    Get Started Free
                    <ArrowRight className="ml-3 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
                  </button>
                )}
                
                <button className="group inline-flex items-center px-8 py-4 bg-white/80 backdrop-blur-sm text-gray-700 text-lg font-semibold rounded-2xl border-2 border-gray-200/50 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-300 shadow-lg hover:shadow-xl">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mr-3 group-hover:scale-110 transition-transform duration-200">
                    <Play className="w-4 h-4 text-white ml-0.5" fill="currentColor" />
=======
                    Get Started
                    <ArrowRight className="ml-2 sm:ml-3 h-4 sm:h-5 w-4 sm:w-5 group-hover:translate-x-1 transition-transform duration-200" />
                  </button>
                )}
                <a href="#about-video">
                <button className="group inline-flex items-center px-4 sm:px-8 py-3 sm:py-4 bg-white/80 backdrop-blur-sm text-gray-700 text-base sm:text-lg font-semibold rounded-xl sm:rounded-2xl border-2 border-gray-200/50 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-300 shadow-lg hover:shadow-xl">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mr-2 sm:mr-3 group-hover:scale-110 transition-transform duration-200">
                    <Play className="w-3 h-3 sm:w-4 sm:h-4 text-white ml-0.5" fill="currentColor" />
>>>>>>> Stashed changes
                  </div>
                  <span className="whitespace-nowrap">Watch Demo</span>
                </button>
<<<<<<< Updated upstream
=======
                </a>
>>>>>>> Stashed changes
              </div>
              
              <p className="text-sm text-gray-500 text-center lg:text-left">
                ✨ No credit card required • 14-day free trial • Cancel anytime
              </p>
            </div>

            {/* Enhanced stats with better design */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-gray-200/50">
              <div className="text-center stat-item">
                <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">10K+</div>
                <div className="text-sm text-gray-600 font-medium">Active Users</div>
              </div>
              <div className="text-center stat-item">
                <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">98%</div>
                <div className="text-sm text-gray-600 font-medium">Success Rate</div>
              </div>
              <div className="text-center stat-item">
                <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">$5M+</div>
                <div className="text-sm text-gray-600 font-medium">Deals Closed</div>
              </div>
            </div>
          </div>

          {/* Right side - Enhanced feature showcase */}
          <div className="relative lg:pl-8">
            {/* Main feature card with glassmorphism */}
            <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-2xl p-8 mb-8 border border-white/50 feature-card relative overflow-hidden">
              {/* Card background pattern */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-3xl"></div>
              
              <div className="relative z-10">
                <div className="flex items-center mb-6">
                  <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mr-4 shadow-lg">
                    <TrendingUp className="w-7 h-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Smart AI Matching</h3>
                    <p className="text-sm text-gray-600">Advanced algorithm finds perfect partnerships</p>
                  </div>
                </div>
                
                {/* Enhanced data visualization */}
                <div className="space-y-4">
                  <div className="bg-white/60 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Match Accuracy</span>
                      <span className="text-lg font-bold text-green-600">96%</span>
                    </div>
                    <div className="w-full bg-gray-200/50 rounded-full h-3">
                      <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full w-[96%] shadow-sm"></div>
                    </div>
                  </div>
                  
                  <div className="bg-white/60 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Response Rate</span>
                      <span className="text-lg font-bold text-blue-600">91%</span>
                    </div>
                    <div className="w-full bg-gray-200/50 rounded-full h-3">
                      <div className="bg-gradient-to-r from-blue-400 to-indigo-500 h-3 rounded-full w-[91%] shadow-sm"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced secondary cards */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-br from-purple-100/80 to-pink-100/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-200/50 floating-element shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">3.2K</div>
                <div className="text-sm text-gray-600 font-medium">Events Listed</div>
                <div className="text-xs text-green-600 font-semibold mt-1">↗ +12% this month</div>
              </div>
              
              <div className="bg-gradient-to-br from-green-100/80 to-emerald-100/80 backdrop-blur-sm rounded-2xl p-6 border border-green-200/50 floating-element shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mb-4 shadow-lg">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">$8.5M</div>
                <div className="text-sm text-gray-600 font-medium">Total Funding</div>
                <div className="text-xs text-green-600 font-semibold mt-1">↗ +24% this quarter</div>
              </div>
            </div>

            {/* Enhanced floating testimonial */}
            <div className="absolute -top-6 -right-6 bg-white/90 backdrop-blur-lg rounded-2xl shadow-2xl p-6 max-w-sm border border-white/50 floating-element">
              <div className="flex items-start space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg flex-shrink-0">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex text-yellow-400 mb-2">
                    {Array(5).fill(0).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <p className="text-sm text-gray-700 font-medium leading-relaxed">
                    "Found the perfect sponsor in just 2 days! The AI matching is incredible."
                  </p>
                  <div className="flex items-center mt-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full mr-2"></div>
                    <div>
                      <p className="text-xs font-semibold text-gray-800">Sarah Chen</p>
                      <p className="text-xs text-gray-500">Event Organizer</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced location indicators with live status */}
            <div className="flex space-x-3 mt-6">
              <div className="flex items-center bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-white/50">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                <MapPin className="w-4 h-4 text-blue-500 mr-1" />
                <span className="text-sm font-medium text-gray-700">NYC</span>
                <span className="text-xs text-gray-500 ml-1">Live</span>
              </div>
              <div className="flex items-center bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-white/50">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                <MapPin className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-sm font-medium text-gray-700">LA</span>
                <span className="text-xs text-gray-500 ml-1">Live</span>
              </div>
              <div className="flex items-center bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-white/50">
                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                <MapPin className="w-4 h-4 text-purple-500 mr-1" />
                <span className="text-sm font-medium text-gray-700">SF</span>
                <span className="text-xs text-gray-500 ml-1">Live</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center space-y-2 text-gray-400">
        <span className="text-sm font-medium">Scroll to explore</span>
        <div className="w-6 h-10 border-2 border-gray-300 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-gradient-to-b from-blue-500 to-transparent rounded-full animate-bounce mt-2"></div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;