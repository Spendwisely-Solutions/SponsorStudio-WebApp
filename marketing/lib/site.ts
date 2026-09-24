// The product app (Vite, repo root). Set NEXT_PUBLIC_APP_URL to override; otherwise
// local development points at the app's dev server and production at the live app.
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.NODE_ENV === 'development' ? 'http://localhost:5173' : 'https://app.sponsorstudio.in');

export const SIGN_IN_URL = `${APP_URL}/signin`;
// The app's /signin page opens straight into sign-up with the right role preselected.
export const SIGN_UP_URL = `${APP_URL}/signin?mode=signup`;
export const SIGN_UP_BRAND_URL = `${APP_URL}/signin?mode=signup&type=brand`;
export const SIGN_UP_ORGANIZER_URL = `${APP_URL}/signin?mode=signup&type=organizer`;

// Public address of this marketing site, used for canonical URLs and link previews.
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.sponsorstudio.in';

export const CONTACT_EMAIL = 'connect@sponsorstudio.in';

// Separate site for booking the paid 1-hour strategy consultation.
export const CONSULTATION_URL = 'https://consultation.sponsorstudio.in/';

export type NavLink = { label: string; href: string; description?: string; external?: boolean };

/**
 * Pages that are still "Coming soon". Flip a flag to true when the page is
 * ready and it appears in the navbar and footer automatically.
 */
export const livePages = {
  platform: false,
  agency: true,
  about: false,
};

// Homepage anchors are written as "/#id" so they work from every page.
export const primaryNav: NavLink[] = [
  livePages.platform
    ? { label: 'Platform', href: '/platform-overview' }
    : { label: 'How it works', href: '/how-it-works' },
  { label: 'Pricing', href: '/pricing' },
];

export const servicesNav: NavLink[] = [
  { label: 'Event Sponsor Starter Kit', href: '/starter-kit', description: 'Get your event sponsor-ready' },
  ...(livePages.agency ? [{ label: 'Agency services', href: '/agency-services', description: 'We run sponsorship for you' }] : []),
  { label: 'Strategy consultation', href: CONSULTATION_URL, description: '1-hour session with our team', external: true },
];

export const resourcesNav: NavLink[] = [
  { label: 'Success stories', href: '/stories', description: 'Partnerships that came together' },
  { label: 'Blog', href: '/blogs', description: 'Guides for brands and organisers' },
  { label: 'FAQ', href: '/faq', description: 'Credits, listings and payouts' },
  { label: 'Careers', href: '/careers', description: 'Join the team' },
  { label: 'Contact', href: '/contact-us', description: 'Talk to the team' },
];

export const secondaryNav: NavLink[] = livePages.about ? [{ label: 'About', href: '/about-us' }] : [];

export const footerNav: { title: string; links: NavLink[] }[] = [
  {
    title: 'Product',
    links: [
      ...(livePages.platform ? [{ label: 'Platform', href: '/platform-overview' }] : []),
      { label: 'How it works', href: '/how-it-works' },
      { label: 'Opportunities', href: '/#opportunities' },
      { label: 'Pricing', href: '/pricing' },
    ],
  },
  {
    title: 'Services',
    links: servicesNav.map(({ label, href, external }) => ({ label, href, external })),
  },
  {
    title: 'Resources',
    links: [
      { label: 'Success stories', href: '/stories' },
      { label: 'Blog', href: '/blogs' },
      { label: 'FAQ', href: '/faq' },
    ],
  },
  {
    title: 'Company',
    links: [
      ...(livePages.about ? [{ label: 'About', href: '/about-us' }] : []),
      { label: 'Careers', href: '/careers' },
      { label: 'Book a demo', href: '/book-demo' },
      { label: 'Contact', href: '/contact-us' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Trust Centre', href: '/legal' },
      { label: 'Privacy Policy', href: '/legal/privacy-policy' },
      { label: 'Terms of Service', href: '/legal/terms-of-service' },
      { label: 'Fees and Refunds', href: '/legal/fees-and-payments' },
    ],
  },
];

export const socialLinks = [
  { label: 'Instagram', href: 'https://www.instagram.com/sponsorstudio.official' },
  { label: 'LinkedIn', href: 'https://in.linkedin.com/company/sponsor-studio' },
  { label: 'Facebook', href: 'https://www.facebook.com/people/Sponsor-Studio/61559157077711/' },
] as const;
