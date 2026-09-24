// Pricing shown on the landing and pricing pages.
// Source: Sponsor Studio documentation: sections 3 (For Brands), 4 (For Event Organizers),
// 19.2 (credit packs and first-purchase offer) and 23.6 (consultation payment).
// Confirm with the business before launch; the docs are the only source for these figures.

export const CREDIT_VALIDITY_DAYS = 180;

export type CreditPack = {
  name: string;
  price: string;
  credits: string;
  /** Price per credit, derived from price ÷ credits. */
  perCredit: string;
  /** A one-off offer shown on the card, if any. */
  offer?: string;
  highlighted?: boolean;
};

export const creditPacks: CreditPack[] = [
  { name: 'Starter', price: '₹10,000', credits: '2,000', perCredit: '₹5 per credit' },
  {
    name: 'Professional',
    price: '₹20,000',
    credits: '5,000',
    perCredit: '₹4 per credit',
    offer: 'First purchase: ₹5,000 (75% off)',
    highlighted: true,
  },
  { name: 'Enterprise', price: '₹30,000', credits: '10,000', perCredit: '₹3 per credit, the lowest rate' },
];

export const creditCosts: { action: string; credits: number }[] = [
  { action: 'Express interest in a listing', credits: 50 },
  { action: 'Unlock a sponsorship brochure', credits: 100 },
  { action: 'Post-event performance report', credits: 100 },
  { action: 'Revive listings you passed on', credits: 300 },
  { action: 'Risk analysis report', credits: 500 },
];

/** One-hour strategy session for brands, booked and paid separately from credits. */
export const consultation = {
  price: '₹5,000 + GST',
  total: '₹5,900 including 18% GST',
  duration: '1-hour session',
};

export type OrganizerPlan = {
  name: string;
  price: string;
  priceNote: string;
  features: string[];
  highlighted?: boolean;
};

export const organizerPlans: OrganizerPlan[] = [
  {
    name: 'Basic',
    price: 'Free to list',
    priceNote: '10% commission on sponsorship you close',
    features: [
      'Listing verified by our team before it goes live',
      'Sign a simple listing MOU with the commission terms',
      '₹5,000 per event to unlock the brands that are interested',
      'Sponsorship matchmaking, with meetings arranged by us',
      'Analytics dashboard for your sponsorships',
    ],
  },
  {
    name: 'VIP',
    price: '₹20,000 upfront',
    priceNote: '25% commission on sponsorship you close',
    features: [
      'Fully managed support from the Sponsor Studio team',
      'Sponsorship matchmaking and analytics dashboard',
      'Upfront fee refunded if less than ₹2L in sponsorship is secured',
    ],
    highlighted: true,
  },
];

/** Event Sponsor Starter Kit, sold separately from the platform. */
export const starterKit = {
  price: '₹15,000 + GST',
  priceNote: 'One-time fee for event organisers',
  includes: [
    {
      title: '50 verified sponsor leads',
      description: 'Contact details for brands that are relevant to your event, checked by our team.',
    },
    {
      title: 'Professional sponsorship brochure',
      description: 'A brochure that clearly presents your event, your audience and your sponsorship opportunities.',
    },
    {
      title: 'Event introduction video',
      description: 'A short video that helps you pitch your event to sponsors the way the big festivals do.',
    },
  ],
};

/** Agency (managed) sponsorship for larger events that don't list on the platform. */
export const agency = {
  advance: '10% advance',
  commission: '25% commission',
  note: 'The advance is adjusted against the commission on your final sponsorship turnover.',
};
