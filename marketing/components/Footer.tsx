import Image from 'next/image';
import Link from 'next/link';
import { FaFacebook, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { ArrowUpRight } from 'lucide-react';
import { CONTACT_EMAIL, footerNav, socialLinks } from '../lib/site';
import NewsletterSignup from './NewsletterSignup';

const socialIcons = {
  Instagram: FaInstagram,
  LinkedIn: FaLinkedin,
  Facebook: FaFacebook,
} as const;

const Footer = () => {
  return (
    <footer className="border-t border-border bg-background-secondary">
      {/* The Backdrop newsletter */}
      <div className="container-page pb-16 pt-16 lg:pt-20">
        <NewsletterSignup />
      </div>

      {/* Divider line between newsletter and footer navigation */}
      <div className="container-page">
        <div className="border-t border-border" />
      </div>

      <div className="container-page grid gap-12 py-16 md:grid-cols-12">
        <div className="md:col-span-12 lg:col-span-3">
          <Link href="/" aria-label="Sponsor Studio home" className="inline-flex">
            <Image src="/logo.png" alt="Sponsor Studio" width={330} height={218} className="h-10 w-auto" />
          </Link>
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-text-secondary">
            The sponsorship marketplace connecting brands with verified events, creators and outdoor media.
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="mt-5 inline-block text-sm font-medium text-text-primary underline-offset-4 hover:underline"
          >
            {CONTACT_EMAIL}
          </a>
        </div>

        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-12 lg:col-span-9 lg:grid-cols-5">
          {footerNav.map((group) => (
            <div key={group.title}>
              <h2 className="font-sans text-sm font-semibold tracking-normal text-text-primary">{group.title}</h2>
              <ul className="mt-4 space-y-3">
                {group.links.map((link) => (
                  <li key={link.href}>
                    {link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm text-text-secondary transition-colors hover:text-text-primary"
                      >
                        {link.label} <ArrowUpRight className="h-3.5 w-3.5" />
                      </a>
                    ) : (
                      <Link href={link.href} className="text-sm text-text-secondary transition-colors hover:text-text-primary">
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container-page flex flex-col-reverse items-start justify-between gap-4 py-6 sm:flex-row sm:items-center">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-6">
            <p className="text-sm text-text-muted">© {new Date().getFullYear()} Sponsor Studio. All rights reserved.</p>
            <div className="flex gap-4 text-sm text-text-muted">
              <Link href="/legal/privacy-policy" className="hover:text-text-primary">Privacy</Link>
              <Link href="/legal/terms-of-service" className="hover:text-text-primary">Terms</Link>
            </div>
          </div>
          <ul className="flex items-center gap-1">
            {socialLinks.map(({ label, href }) => {
              const Icon = socialIcons[label];
              return (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-text-muted transition-colors hover:bg-surface-hover hover:text-text-primary"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
