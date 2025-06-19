import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
  const navRef = useRef<HTMLDivElement>(null);
  const signInButtonRef = useRef<HTMLButtonElement>(null);
  const mobileMenuButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    gsap.fromTo(
      navRef.current,
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: 'power2.out' }
    );

    if (signInButtonRef.current) {
      signInButtonRef.current.addEventListener('mouseenter', () => {
        gsap.to(signInButtonRef.current, { scale: 1.05, duration: 0.2, ease: 'power2.out' });
      });
      signInButtonRef.current.addEventListener('mouseleave', () => {
        gsap.to(signInButtonRef.current, { scale: 1, duration: 0.2, ease: 'power2.out' });
      });
    }

    if (mobileMenuButtonRef.current) {
      mobileMenuButtonRef.current.addEventListener('mouseenter', () => {
        gsap.to(mobileMenuButtonRef.current, { scale: 1.1, duration: 0.2, ease: 'power2.out' });
      });
      mobileMenuButtonRef.current.addEventListener('mouseleave', () => {
        gsap.to(mobileMenuButtonRef.current, { scale: 1, duration: 0.2, ease: 'power2.out' });
      });
    }

    return () => {
      if (signInButtonRef.current) {
        signInButtonRef.current.removeEventListener('mouseenter', () => {});
        signInButtonRef.current.removeEventListener('mouseleave', () => {});
      }
      if (mobileMenuButtonRef.current) {
        mobileMenuButtonRef.current.removeEventListener('mouseenter', () => {});
        mobileMenuButtonRef.current.removeEventListener('mouseleave', () => {});
      }
    };
  }, []);

  return (
    <nav ref={navRef} className="fixed w-full bg-white shadow-md z-40">
      <div className="container mx-auto px-4 sm:px-6 py-2">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex-shrink-0">
            <img
              src="https://i.ibb.co/ZzPfwrxP/logo-final-png.png"
              alt="Sponsor Studio"
              className="h-12 md:h-16"
            />
          </Link>
          <div className="hidden md:flex items-center space-x-8">
            <a href="#about" className="text-[#2B4B9B] hover:text-[#1F3A7A] font-medium transition-colors text-lg sm:text-base">
              About
            </a>
            <a href="#clients" className="text-[#2B4B9B] hover:text-[#1F3A7A] font-medium transition-colors text-lg sm:text-base">
              Clients
            </a>
            <a href="#pricing" className="text-[#2B4B9B] hover:text-[#1F3A7A] font-medium transition-colors text-lg sm:text-base">
              Pricing
            </a>
           
            <a href="#success" className="text-[#2B4B9B] hover:text-[#1F3A7A] font-medium transition-colors text-lg sm:text-base">
              Success Stories
            </a>
            <a href="#contact" className="text-[#2B4B9B] hover:text-[#1F3A7A] font-medium transition-colors text-lg sm:text-base">
              Contact
            </a>
            {user ? (
              <Link to="/dashboard" className="flex items-center space-x-2 group">
                {profile?.profile_picture_url ? (
                  <img
                    src={profile.profile_picture_url}
                    alt={profile.company_name || 'Profile'}
                    className="w-10 h-10 rounded-full object-cover border-2 border-transparent group-hover:border-[#2B4B9B] transition-colors duration-200"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#2B4B9B] flex items-center justify-center text-white group-hover:bg-[#1F3A7A] transition-colors duration-200 text-lg sm:text-base">
                    {profile?.company_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-[#2B4B9B] font-medium group-hover:text-[#1F3A7A] transition-colors text-lg sm:text-base">
                    {profile?.company_name || 'Complete Profile'}
                  </span>
                    <span className="text-sm sm:text-xs text-gray-500 capitalize">
                    {profile?.user_type === 'event_organizer'
                      ? 'Opportunity Provider'
                      : profile?.user_type?.replace('_', ' ')}
                    </span>
                </div>
                {!isProfileComplete && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-pulse" />
                )}
              </Link>
            ) : (
              <button
                ref={signInButtonRef}
                onClick={() => setShowAuthForm(true)}
                className="text-[#2B4B9B] hover:text-[#1F3A7A] font-medium text-lg sm:text-base will-change-transform"
              >
                Sign In
              </button>
            )}
          </div>
          <button
            ref={mobileMenuButtonRef}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-[#2B4B9B] hover:bg-[#2B4B9B] hover:text-white will-change-transform"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 py-4 border-t border-gray-200 animate-slideIn">
            <div className="flex flex-col space-y-4">
              <a
                href="#about"
                className="text-[#2B4B9B] hover:text-[#1F3A7A] font-medium text-lg transition-colors duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                About
              </a>
              <a
                href="#clients"
                className="text-[#2B4B9B] hover:text-[#1F3A7A] font-medium text-lg transition-colors duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                Clients
              </a>
              <a
                href="#success"
                className="text-[#2B4B9B] hover:text-[#1F3A7A] font-medium text-lg transition-colors duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                Success Stories
              </a>
              <a
                href="#contact"
                className="text-[#2B4B9B] hover:text-[#1F3A7A] font-medium text-lg transition-colors duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contact
              </a>
              {user ? (
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {profile?.profile_picture_url ? (
                    <img
                      src={profile.profile_picture_url}
                      alt={profile.company_name || 'Profile'}
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-[#2B4B9B] flex items-center justify-center text-white text-lg">
                      {profile?.company_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <span className="text-[#2B4B9B] font-medium text-lg">{profile?.company_name || 'Complete Profile'}</span>
                </Link>
              ) : (
                <button
                  onClick={() => {
                    setShowAuthForm(true);
                    setMobileMenuOpen(false);
                  }}
                  className="text-[#2B4B9B] hover:text-[#1F3A7A] font-medium text-lg transition-colors duration-200"
                >
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