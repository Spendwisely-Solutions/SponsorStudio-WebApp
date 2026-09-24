import { CONTACT_EMAIL } from './site';

/**
 * Company details used across the legal documents.
 * Values in [brackets] are placeholders: fill them in before these pages go live,
 * and have every document reviewed by a lawyer.
 */
export const company = {
  entity: 'Sreez Spendwisely Solutions Private Limited',
  brand: 'Sponsor Studio',
  address: 'Heavenly Plaza, Vazhakkala, Kakkanad, Ernakulam, Kerala 682021, India',
  email: CONTACT_EMAIL,
  // No dedicated security inbox or Grievance Officer yet, so both route to the main inbox.
  // Indian law expects a named Grievance Officer: appoint one before these pages go live.
  securityEmail: CONTACT_EMAIL,
  grievanceOfficer: 'the Sponsor Studio team',
  grievanceEmail: CONTACT_EMAIL,
  jurisdiction: 'Ernakulam, Kerala',
  websites: ['sponsorstudio.in', 'app.sponsorstudio.in', 'consultation.sponsorstudio.in'],
};

// Shown on every legal page until the documents have been reviewed.
export const LEGAL_LAST_UPDATED = '24 September 2026';

export const legalDocs = [
  {
    slug: 'privacy-policy',
    title: 'Privacy Policy',
    description: 'What personal data we collect, why, who we share it with, and your rights over it.',
  },
  {
    slug: 'terms-of-service',
    title: 'Terms of Service',
    description: 'The agreement between you and Sponsor Studio when you use the platform.',
  },
  {
    slug: 'fees-and-payments',
    title: 'Fees, Payments and Refunds',
    description: 'How credits, listing fees, commissions and refunds work.',
  },
  {
    slug: 'acceptable-use',
    title: 'Acceptable Use Policy',
    description: 'What you may and may not do on Sponsor Studio.',
  },
  {
    slug: 'responsible-disclosure',
    title: 'Responsible Disclosure Policy',
    description: 'How to report a security vulnerability to us, and what we commit to in return.',
  },
] as const;
