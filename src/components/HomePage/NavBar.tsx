import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, ChevronDown, Sun, Moon } from 'lucide-react';
import { User, Profile } from '../HomePage/Home';
import { useTheme } from '../../contexts/ThemeContext';

interface NavBarProps {
  user: User | null;
  profile: Profile | null;
  isProfileComplete: boolean;
  setShowAuthForm: (value: boolean) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (value: boolean) => void;
  hideNavItems?: boolean;
  hideAuthButton?: boolean;
  hideMobileMenu?: boolean;
  navLinks?: {
    label: string;
    href?: string;
    to?: string;
    icon?: React.ReactNode;
    onClick?: () => void;
  }[];
}

const NavBar: React.FC<NavBarProps> = ({
  user,
  profile,
  isProfileComplete,
  setShowAuthForm,
  mobileMenuOpen,
  setMobileMenuOpen,
  hideNavItems = false,
  hideAuthButton = false,
  hideMobileMenu = false,
  navLinks,
}) => {
  const { theme, toggleTheme } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setResourcesOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const defaultNavLinks = [
    { label: 'How It Works', href: '#how-we-work' },
    { label: 'For Brands', href: '#what-is-sponsor-studio' },
    { label: 'For Organizers', href: '#how-we-work' },
    { label: 'Pricing', to: '/pricing' },
  ];

  const resourceLinks = [
    { label: 'Blogs', href: '/blogs' },
    { label: 'Success Stories', href: '/stories' },
    { label: 'FAQ', to: '/faq' },
    { label: 'Contact Us', href: '/Contact-us' },
  ];

  const currentNavLinks = navLinks || defaultNavLinks;

  return (
    <nav className="fixed top-0 left-0 right-0 w-full z-50 p-3 sm:p-4 transition-all duration-300 pointer-events-none">
      <div className="absolute top-0 left-0 right-0 w-full z-0" />
      <div
        className={`max-w-7xl mx-auto px-4 sm:px-6 transition-all duration-300 pointer-events-auto rounded-2xl ${
          scrolled || mobileMenuOpen
            ? 'bg-white/[0.03] backdrop-blur-lg'
            : 'bg-white/[0.01] backdrop-blur-md'
        }`}
        style={{
          boxShadow: scrolled || mobileMenuOpen
            ? '0 12px 40px 0 rgba(0, 0, 0, 0.25), inset 0 1px 0 0 rgba(255, 255, 255, 0.22)'
            : '0 4px 20px 0 rgba(0, 0, 0, 0.05), inset 0 1px 0 0 rgba(255, 255, 255, 0.12)',
          border: scrolled || mobileMenuOpen
            ? '1px solid rgba(255, 255, 255, 0.16)'
            : '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div className="flex items-center justify-between h-18 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0 transition-transform duration-300 hover:scale-105">
            <img
              src="https://i.ibb.co/ZzPfwrxP/logo-final-png.png"
              alt="Sponsor Studio"
              className="h-14 md:h-16 w-auto"
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {!hideNavItems && currentNavLinks.map((link, index) =>
              link.to ? (
                <Link
                  key={index}
                  to={link.to}
                  className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                  onClick={link.onClick}
                >
                  {link.label}
                </Link>
              ) : (
                <a
                  key={index}
                  href={link.href}
                  className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                  onClick={link.onClick}
                >
                  {link.label}
                </a>
              )
            )}

            {/* Resources Dropdown */}
            {!hideNavItems && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setResourcesOpen(!resourcesOpen)}
                  className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
                >
                  Resources
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${resourcesOpen ? 'rotate-180' : ''}`} />
                </button>
                {resourcesOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-[#0D1F3C] border border-white/10 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden backdrop-blur-xl">
                    {resourceLinks.map((link, i) =>
                      link.to ? (
                        <Link
                          key={i}
                          to={link.to}
                          className="block px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200"
                          onClick={() => setResourcesOpen(false)}
                        >
                          {link.label}
                        </Link>
                      ) : (
                        <a
                          key={i}
                          href={link.href}
                          className="block px-4 py-3 text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200"
                          onClick={() => setResourcesOpen(false)}
                        >
                          {link.label}
                        </a>
                      )
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 md:p-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 md:w-5 md:h-5" /> : <Moon className="w-4 h-4 md:w-5 md:h-5" />}
            </button>
            {!hideAuthButton && (user ? (
              <Link
                to="/dashboard"
                className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-xl hover:bg-white/20 transition-all duration-300"
              >
                {profile?.profile_picture_url ? (
                  <img
                    src={profile.profile_picture_url}
                    alt={profile.company_name || 'Profile'}
                    className="w-8 h-8 rounded-full object-cover border border-cyan-400/50"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-white text-sm font-bold">
                    {profile?.company_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex flex-col">
                  <span className="text-white font-semibold text-sm leading-tight">
                    {profile?.company_name || 'Dashboard'}
                  </span>
                  <span className="text-xs text-gray-400 capitalize leading-tight">
                    {profile?.user_type === 'event_organizer' ? 'Organizer' : profile?.user_type?.replace('_', ' ') || 'Brand'}
                  </span>
                </div>
              </Link>
            ) : (
              <>
                <button
                  onClick={() => setShowAuthForm(true)}
                  className="px-5 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors duration-200"
                >
                  Log In
                </button>
                <button
                  onClick={() => setShowAuthForm(true)}
                  className="px-5 py-2 text-sm font-semibold text-[#0A1628] bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl hover:from-cyan-300 hover:to-blue-400 shadow-[0_0_20px_rgba(0,212,255,0.3)] hover:shadow-[0_0_30px_rgba(0,212,255,0.5)] transition-all duration-300 transform hover:scale-105"
                >
                  Get Started
                </button>
              </>
            ))}
          </div>

          {/* Mobile menu button */}
          {!hideMobileMenu && (
            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all duration-200"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all duration-200"
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && !hideMobileMenu && (
          <div className="md:hidden pb-4 border-t border-white/10 mt-2 pt-4 bg-transparent">
            <div className="flex flex-col space-y-1">
              {!hideNavItems && currentNavLinks.map((link, index) =>
                link.to ? (
                  <Link
                    key={index}
                    to={link.to}
                    className="px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg font-medium transition-all duration-200"
                    onClick={() => { setMobileMenuOpen(false); if (link.onClick) link.onClick(); }}
                  >
                    {link.label}
                  </Link>
                ) : (
                  <a
                    key={index}
                    href={link.href}
                    className="px-4 py-3 text-gray-300 hover:text-white hover:bg-white/10 rounded-lg font-medium transition-all duration-200"
                    onClick={() => { setMobileMenuOpen(false); if (link.onClick) link.onClick(); }}
                  >
                    {link.label}
                  </a>
                )
              )}

              {!hideNavItems && resourceLinks.map((link, i) =>
                link.to ? (
                  <Link key={i} to={link.to} className="px-4 py-3 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200" onClick={() => setMobileMenuOpen(false)}>
                    {link.label}
                  </Link>
                ) : (
                  <a key={i} href={link.href} className="px-4 py-3 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200" onClick={() => setMobileMenuOpen(false)}>
                    {link.label}
                  </a>
                )
              )}

              {!hideAuthButton && (
                <div className="pt-3 mt-2 border-t border-white/10 space-y-2 px-2">
                  {user ? (
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-3 p-3 bg-white/10 rounded-xl border border-white/20"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {profile?.profile_picture_url ? (
                        <img src={profile.profile_picture_url} alt="" className="w-10 h-10 rounded-full" />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">
                          {profile?.company_name?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <div className="text-white font-semibold">{profile?.company_name || 'Dashboard'}</div>
                        <div className="text-xs text-gray-400">Go to Dashboard →</div>
                      </div>
                    </Link>
                  ) : (
                    <>
                      <button
                        onClick={() => { setShowAuthForm(true); setMobileMenuOpen(false); }}
                        className="w-full py-3 text-gray-300 border border-white/20 rounded-xl hover:bg-white/10 transition-all"
                      >
                        Log In
                      </button>
                      <button
                        onClick={() => { setShowAuthForm(true); setMobileMenuOpen(false); }}
                        className="w-full py-3 font-semibold text-[#0A1628] bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl shadow-[0_0_20px_rgba(0,212,255,0.3)] transition-all"
                      >
                        Get Started
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default NavBar;