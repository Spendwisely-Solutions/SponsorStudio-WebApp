'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, ChevronDown, Menu, X } from 'lucide-react';
import Button from './ui/Button';
import { primaryNav, resourcesNav, secondaryNav, servicesNav, SIGN_IN_URL, type NavLink } from '../lib/site';

const linkClass = (active: boolean) =>
  `rounded-lg px-3 py-2 text-[15px] font-medium transition-colors duration-200 ${
    active ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'
  }`;

function NavDropdown({ label, links, pathname }: { label: string; links: NavLink[]; pathname: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const active = links.some((link) => !link.external && pathname.startsWith(link.href));

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative" onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((o) => !o)}
        onMouseEnter={() => setOpen(true)}
        className={`inline-flex items-center gap-1 ${linkClass(active)}`}
      >
        {label}
        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.18 }}
            // pt-2 bridges the gap so the menu stays open while the pointer moves down.
            className="absolute left-1/2 top-full w-72 -translate-x-1/2 pt-2"
          >
            <ul className="rounded-card border border-border bg-surface p-2 shadow-pop">
              {links.map((link) => {
                const content = (
                  <>
                    <span className="flex items-center gap-1 text-sm font-medium text-text-primary">
                      {link.label}
                      {link.external && <ArrowUpRight className="h-3.5 w-3.5 text-text-muted" />}
                    </span>
                    {link.description && <span className="mt-0.5 block text-xs text-text-muted">{link.description}</span>}
                  </>
                );
                const cls = 'block rounded-lg px-3 py-2.5 transition-colors hover:bg-surface-hover';
                return (
                  <li key={link.href}>
                    {link.external ? (
                      <a href={link.href} target="_blank" rel="noopener noreferrer" onClick={() => setOpen(false)} className={cls}>
                        {content}
                      </a>
                    ) : (
                      <Link href={link.href} onClick={() => setOpen(false)} className={cls}>
                        {content}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const NavBar: React.FC = () => {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 8);
      // Tuck the bar away while reading downwards; bring it back on any upward scroll.
      if (Math.abs(y - lastY) > 6) {
        setHidden(y > lastY && y > 480);
        lastY = y;
      }
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close the mobile menu whenever the route changes.
  const [menuPathname, setMenuPathname] = useState(pathname);
  if (menuPathname !== pathname) {
    setMenuPathname(pathname);
    setMenuOpen(false);
  }

  // Lock page scroll and allow Escape to close while the mobile menu is open.
  useEffect(() => {
    if (!menuOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const isActive = (href: string) => !href.startsWith('/#') && pathname.startsWith(href);
  const mobileLinks: NavLink[] = [...primaryNav, ...servicesNav, ...resourcesNav, ...secondaryNav];

  return (
    <header
      className={`sticky top-0 z-50 h-[var(--nav-height)] border-b transition-[background-color,border-color,transform] duration-300 ease-out-expo ${
        hidden && !menuOpen ? '-translate-y-full' : 'translate-y-0'
      } ${
        // No backdrop blur while the menu is open: backdrop-filter would make the
        // header the containing block for the fixed full-screen menu.
        menuOpen
          ? 'border-border bg-background'
          : scrolled
            ? 'border-border bg-background/90 backdrop-blur-md'
            : 'border-transparent bg-white/0'
      }`}
    >
      <nav className="container-page flex h-full items-center justify-between gap-6" aria-label="Main">
        <Link href="/" className="flex shrink-0 items-center" aria-label="Sponsor Studio home">
          <Image src="/logo.png" alt="Sponsor Studio" width={330} height={218} priority className="h-12 w-auto" />
        </Link>

        {/* Desktop links */}
        <div className="hidden items-center gap-1 lg:flex">
          {primaryNav.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? 'page' : undefined}
              className={linkClass(isActive(link.href))}
            >
              {link.label}
            </Link>
          ))}
          <NavDropdown label="Services" links={servicesNav} pathname={pathname} />
          <NavDropdown label="Resources" links={resourcesNav} pathname={pathname} />
          {secondaryNav.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? 'page' : undefined}
              className={linkClass(isActive(link.href))}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Desktop actions */}
        <div className="hidden items-center gap-2 lg:flex">
          <a href={SIGN_IN_URL} className={linkClass(false)}>
            Log in
          </a>
          <Button href="/book-demo">Book a demo</Button>
        </div>

        {/* Mobile toggle */}
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className="-mr-2 inline-flex h-11 w-11 items-center justify-center rounded-lg text-text-primary hover:bg-surface-hover lg:hidden"
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          id="mobile-menu"
          className="fixed inset-x-0 bottom-0 top-[var(--nav-height)] flex flex-col overflow-y-auto bg-background lg:hidden"
        >
          <ul className="container-page flex flex-col py-4">
            {mobileLinks.map((link) => (
              <li key={link.href} className="border-b border-border">
                {link.external ? (
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 py-4 text-lg font-medium text-text-primary"
                  >
                    {link.label} <ArrowUpRight className="h-4 w-4 text-text-muted" />
                  </a>
                ) : (
                  <Link href={link.href} onClick={() => setMenuOpen(false)} className="block py-4 text-lg font-medium text-text-primary">
                    {link.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
          <div className="container-page mt-auto flex flex-col gap-3 pb-8">
            <Button href={SIGN_IN_URL} variant="secondary" size="lg">
              Log in
            </Button>
            <Button href="/book-demo" size="lg" onClick={() => setMenuOpen(false)}>
              Book a demo
            </Button>
          </div>
        </div>
      )}
    </header>
  );
};

export default NavBar;
