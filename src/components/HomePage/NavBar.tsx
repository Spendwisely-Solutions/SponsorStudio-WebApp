import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { User, Profile } from '../../App';

gsap.registerPlugin(ScrollTrigger);

interface NavBarProps {
  user: User | null;
  profile: Profile | null;
  isProfileComplete: boolean;
  setShowAuthForm: (value: boolean) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (value: boolean) => void;
}

const NavBar: React.FC<NavBarProps> = ({
  user,
  profile,
  isProfileComplete,
  setShowAuthForm,
  mobileMenuOpen,
  setMobileMenuOpen,
}) => {
  const navRef = useRef<HTMLDivElement>(null);
  const signInButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Initial navbar animation
    gsap.fromTo(
      navRef.current,
      { y: -100, opacity: 0 },
      { 
        y: 0, 
        opacity: 1, 
        duration: 0.32, 
        ease: 'power3.out',
        clearProps: "all" 
      }
    );

    // Create nav item stagger animation (instant for mobile)
    gsap.fromTo(
      ".nav-item",
      { y: -20, opacity: 0 },
      { 
        y: 0, 
        opacity: 1, 
        duration: 0.09, 
        stagger: 0.001,
        ease: 'back.out(1.2)', 
        delay: 0.001,
        clearProps: "all"
      }
    );

    // Mobile menu animation
    if (mobileMenuOpen) {
      gsap.fromTo(
        ".mobile-menu", 
        { 
          opacity: 0, 
          y: -20,
          scaleY: 0.9,
          transformOrigin: "top" 
        },
        { 
          opacity: 1, 
          y: 0,
          scaleY: 1, 
          duration: 0.18, 
          ease: "power3.out" 
        }
      );
      
      gsap.fromTo(
        ".mobile-menu > div > *", 
        { opacity: 0, x: -20 },
        { opacity: 1, x: 0, duration: 0.12, stagger: 0.03, delay: 0.05, ease: "power2.out" }
      );
    }

    // Button hover animations
    if (signInButtonRef.current) {
      signInButtonRef.current.addEventListener('mouseenter', () => {
        gsap.to(signInButtonRef.current, { 
          scale: 1.05, 
          duration: 0.3, 
          ease: 'back.out(1.5)'
        });
      });
      
      signInButtonRef.current.addEventListener('mouseleave', () => {
        gsap.to(signInButtonRef.current, { 
          scale: 1, 
          duration: 0.2, 
          ease: 'power2.out'
        });
      });
    }

    if (mobileMenuButtonRef.current) {
      mobileMenuButtonRef.current.addEventListener('mouseenter', () => {
        gsap.to(mobileMenuButtonRef.current, { 
          scale: 1.05, 
          duration: 0.3, 
          ease: 'back.out(1.5)' 
        });
      });
      
      mobileMenuButtonRef.current.addEventListener('mouseleave', () => {
        gsap.to(mobileMenuButtonRef.current, { 
          scale: 1, 
          duration: 0.2, 
          ease: 'power2.out' 
        });
      });
    }

    // Create scroll animation for navbar
    ScrollTrigger.create({
      start: "top top",
      end: "max",
      onUpdate: (self) => {
        if (self.direction === -1) {
          // Scrolling up - show navbar
          gsap.to(navRef.current, {
            y: 0,
            duration: 0.3,
            ease: 'power2.out',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
          });
        } else if (self.direction === 1 && self.progress > 0.1) {
          // Scrolling down and not at top - hide navbar
          gsap.to(navRef.current, {
            y: -100,
            duration: 0.3,
            ease: 'power2.in'
          });
        }
      }
    });

    return () => {
      if (signInButtonRef.current) {
        signInButtonRef.current.removeEventListener('mouseenter', () => {});
        signInButtonRef.current.removeEventListener('mouseleave', () => {});
      }
      if (mobileMenuButtonRef.current) {
        mobileMenuButtonRef.current.removeEventListener('mouseenter', () => {});
        mobileMenuButtonRef.current.removeEventListener('mouseleave', () => {});
      }
      // Kill scroll trigger on unmount
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [mobileMenuOpen]);

  return (
    <nav ref={navRef} className="fixed w-full backdrop-blur-md bg-white/90 shadow-lg z-40">
      <div className="container mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex-shrink-0 transition-transform duration-300 hover:scale-105">
            <img
              src="https://i.ibb.co/ZzPfwrxP/logo-final-png.png"
              alt="Sponsor Studio"
              className="h-12 md:h-14"
            />
          </Link>
          <div className="hidden md:flex items-center space-x-2 lg:space-x-8">
            <a href="#about" className="nav-item px-3 py-2 rounded-full text-[#2B4B9B] hover:bg-blue-50 hover:text-[#1F3A7A] font-medium transition-all duration-300 text-sm lg:text-base">
              About
            </a>
            <a href="#clients" className="nav-item px-3 py-2 rounded-full text-[#2B4B9B] hover:bg-blue-50 hover:text-[#1F3A7A] font-medium transition-all duration-300 text-sm lg:text-base">
              Clients
            </a>
            {/* <a href="#pricing" className="nav-item px-3 py-2 rounded-full text-[#2B4B9B] hover:bg-blue-50 hover:text-[#1F3A7A] font-medium transition-all duration-300 text-sm lg:text-base">
              Pricing
            </a> */}
           
            <a href="#success" className="nav-item px-3 py-2 rounded-full text-[#2B4B9B] hover:bg-blue-50 hover:text-[#1F3A7A] font-medium transition-all duration-300 text-sm lg:text-base">
              Success Stories
            </a>
            <a href="#contact" className="nav-item px-3 py-2 rounded-full text-[#2B4B9B] hover:bg-blue-50 hover:text-[#1F3A7A] font-medium transition-all duration-300 text-sm lg:text-base">
              Contact
            </a>
            {user ? (
              <Link to="/dashboard" className="nav-item flex items-center space-x-3 group bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm border border-blue-100/50 hover:shadow-md hover:border-blue-300 transition-all duration-300">
                <div className="relative">
                  {profile?.profile_picture_url ? (
                    <img
                      src={profile.profile_picture_url}
                      alt={profile.company_name || 'Profile'}
                      className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md group-hover:shadow-blue-200 transition-all duration-300"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md group-hover:shadow-blue-200 transition-all duration-300 text-lg font-medium">
                      {profile?.company_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  {/* Removed yellow blinking indicator for incomplete profile */}
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-800 font-semibold group-hover:text-[#2B4B9B] transition-colors text-sm lg:text-base">
                    {profile?.company_name || 'Complete Profile'}
                  </span>
                  <span className="text-xs text-gray-500 capitalize">
                    {profile?.user_type === 'event_organizer'
                      ? 'Opportunity Provider'
                      : profile?.user_type?.replace('_', ' ')}
                  </span>
                </div>
              </Link>
            ) : (
              <button
                ref={signInButtonRef}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Sign In button clicked, showing auth form');
                  setShowAuthForm(true);
                }}
                className="nav-item bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium text-sm lg:text-base px-6 py-2.5 rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform will-change-transform flex items-center"
              >
                <span>Sign In</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
          <button
            ref={mobileMenuButtonRef}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-full bg-white/80 backdrop-blur-sm shadow-md border border-blue-100 hover:border-blue-300 text-[#2B4B9B] hover:bg-blue-50 transition-all duration-300 will-change-transform"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-gray-100 bg-white/95 backdrop-blur-md rounded-b-2xl shadow-lg mobile-menu">
            <div className="flex flex-col space-y-3 px-2">
              <a
                href="#about"
                className="px-4 py-3 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-[#2B4B9B] font-medium transition-all duration-200 flex items-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                About
              </a>
              <a
                href="#clients"
                className="px-4 py-3 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-[#2B4B9B] font-medium transition-all duration-200 flex items-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                Clients
              </a>
              <a
                href="#success"
                className="px-4 py-3 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-[#2B4B9B] font-medium transition-all duration-200 flex items-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                Success Stories
              </a>
              <a
                href="#contact"
                className="px-4 py-3 rounded-xl text-gray-700 hover:bg-blue-50 hover:text-[#2B4B9B] font-medium transition-all duration-200 flex items-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Contact
              </a>
              {user ? (
                <Link
                  to="/dashboard"
                  className="flex items-center mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 shadow-md hover:shadow-lg transition-all duration-300"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <div className="relative">
                    {profile?.profile_picture_url ? (
                      <img
                        src={profile.profile_picture_url}
                        alt={profile.company_name || 'Profile'}
                        className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-md text-lg font-bold">
                        {profile?.company_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    {/* Removed yellow blinking indicator for incomplete profile */}
                  </div>
                  <div className="ml-4">
                    <div className="text-gray-800 font-semibold">{profile?.company_name || 'Complete Profile'}</div>
                    <div className="text-sm text-gray-500 capitalize flex items-center mt-1">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {profile?.user_type === 'event_organizer'
                        ? 'Opportunity Provider'
                        : profile?.user_type?.replace('_', ' ')}
                    </div>
                    <div className="flex items-center mt-2 text-sm text-blue-600 font-medium">
                      Go to Dashboard
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                  </div>
                </Link>
              ) : (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Mobile sign-in button clicked');
                    setShowAuthForm(true);
                    setMobileMenuOpen(false);
                  }}
                  className="mt-4 w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  Sign In
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;