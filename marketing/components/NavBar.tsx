'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Menu, X, ChevronDown } from 'lucide-react';

interface NavBarProps {
  hideNavItems?: boolean;
  hideAuthButton?: boolean;
  hideMobileMenu?: boolean;
  navLinks?: {
    label: string;
    href?: string;
    onClick?: () => void;
  }[];
}

const NavBar: React.FC<NavBarProps> = ({
  hideNavItems = false,
  hideAuthButton = false,
  hideMobileMenu = false,
  navLinks,
}) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.sponsorstudio.in';

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

  const defaultNavLinks: { label: string; href?: string; onClick?: () => void; }[] = [
    { label: 'How It Works', href: '#how-we-work' },
    { label: 'For Brands', href: '#what-is-sponsor-studio' },
    { label: 'For Organizers', href: '#how-we-work' },
    { label: 'Pricing', href: '#pricing' },
  ];

  const resourceLinks = [
    { label: 'Blogs', href: '/blogs' },
    { label: 'Success Stories', href: '/stories' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Contact Us', href: '/contact-us' },
  ];

  const currentNavLinks = navLinks || defaultNavLinks;

  return (
    <nav className="fixed top-0 left-0 right-0 w-full z-50 p-3 sm:p-4 transition-all duration-300 pointer-events-none">
      <div className="absolute top-0 left-0 right-0 w-full z-0" />
      <div
        className={`max-w-7xl mx-auto px-4 sm:px-6 transition-all duration-300 pointer-events-auto rounded-2xl ${
          scrolled || mobileMenuOpen
            ? 'bg-white/70 dark:bg-white/[0.03] backdrop-blur-lg'
            : 'bg-white/30 dark:bg-white/[0.01] backdrop-blur-md'
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
          <Link href="/" className="flex-shrink-0 transition-transform duration-300 hover:scale-105">
            <img
              src="https://i.ibb.co/ZzPfwrxP/logo-final-png.png"
              alt="Sponsor Studio"
              className="h-14 md:h-16 w-auto"
            />
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {!hideNavItems && currentNavLinks.map((link, index) =>
              link.href && link.href.startsWith('#') ? (
                <a
                  key={index}
                  href={link.href}
                  className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-all duration-200"
                  onClick={link.onClick}
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={index}
                  href={link.href || '/'}
                  className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-all duration-200"
                  onClick={link.onClick}
                >
                  {link.label}
                </Link>
              )
            )}

            {/* Resources Dropdown */}
            {!hideNavItems && (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setResourcesOpen(!resourcesOpen)}
                  className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-all duration-200"
                >
                  Resources
                  <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${resourcesOpen ? 'rotate-180' : ''}`} />
                </button>
                {resourcesOpen && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-[#121212] border border-gray-200 dark:border-white/10 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.15)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden backdrop-blur-xl">
                    {resourceLinks.map((link, i) => (
                      <Link
                        key={i}
                        href={link.href}
                        className="block px-4 py-3 text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-200"
                        onClick={() => setResourcesOpen(false)}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {!hideAuthButton && (
              <div className="flex items-center gap-3">
                <Link
                  href="/book-demo"
                  className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-white/20 rounded-xl hover:bg-black/5 dark:hover:bg-white/10 transition-all duration-300"
                >
                  Book a Demo
                </Link>
                <a
                  href={`${APP_URL}/signin`}
                  className="px-5 py-2 text-sm font-semibold text-[#0A1628] bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl hover:from-cyan-300 hover:to-blue-400 shadow-[0_0_20px_rgba(0,212,255,0.3)] hover:shadow-[0_0_30px_rgba(0,212,255,0.5)] transition-all duration-300 transform hover:scale-105"
                >
                  Get Started
                </a>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          {!hideMobileMenu && (
            <div className="flex items-center gap-2 md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg bg-black/5 dark:bg-white/10 border border-black/10 dark:border-white/20 text-gray-700 dark:text-white hover:bg-black/10 dark:hover:bg-white/20 transition-all duration-200"
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && !hideMobileMenu && (
          <div className="md:hidden pb-4 border-t border-black/10 dark:border-white/10 mt-2 pt-4 bg-transparent">
            <div className="flex flex-col space-y-1">
              {!hideNavItems && currentNavLinks.map((link, index) =>
                link.href && link.href.startsWith('#') ? (
                  <a
                    key={index}
                    href={link.href}
                    className="px-4 py-3 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-lg font-medium transition-all duration-200"
                    onClick={() => { setMobileMenuOpen(false); if (link.onClick) link.onClick(); }}
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={index}
                    href={link.href || '/'}
                    className="px-4 py-3 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-lg font-medium transition-all duration-200"
                    onClick={() => { setMobileMenuOpen(false); if (link.onClick) link.onClick(); }}
                  >
                    {link.label}
                  </Link>
                )
              )}

              {!hideNavItems && resourceLinks.map((link, i) => (
                <Link
                  key={i}
                  href={link.href}
                  className="px-4 py-3 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition-all duration-200"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              {!hideAuthButton && (
                <div className="pt-3 mt-2 border-t border-black/10 dark:border-white/10 space-y-2 px-2">
                  <div className="space-y-2">
                    <Link
                      href="/book-demo"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full py-3 text-center font-semibold text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-white/20 rounded-xl bg-surface hover:bg-surface-hover/80 transition-colors"
                    >
                      Book a Demo
                    </Link>
                    <a
                      href={`${APP_URL}/signin`}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block w-full py-3 text-center font-semibold text-[#0A1628] bg-gradient-to-r from-cyan-400 to-blue-500 rounded-xl shadow-[0_0_20px_rgba(0,212,255,0.3)] transition-all"
                    >
                      Get Started
                    </a>
                  </div>
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
