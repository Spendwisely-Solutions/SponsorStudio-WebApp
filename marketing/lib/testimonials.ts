export type Testimonial = {
  quote: string;
  name: string;
  role: string;
  company: string;
  /** Optional headshot or company logo URL. Initials are shown when absent. */
  image?: string;
  audience: 'Brand' | 'Organiser';
};

// PLACEHOLDERS: replace with real quotes (and permission to use them) before launch.
export const testimonials: Testimonial[] = [
  {
    quote:
      'Placeholder quote from a brand partner. Two or three sentences on what finding events through Sponsor Studio changed for their team.',
    name: 'Name Surname',
    role: 'Marketing lead',
    company: 'Brand name',
    audience: 'Brand',
  },
  {
    quote:
      'Placeholder quote from an event organiser. A line about how quickly they heard from the right sponsors once their listing went live.',
    name: 'Name Surname',
    role: 'Founder',
    company: 'Event name',
    audience: 'Organiser',
  },
  {
    quote:
      'Placeholder quote about the process: the verification, the meeting that was set up, or the report after the event.',
    name: 'Name Surname',
    role: 'Head of partnerships',
    company: 'Company name',
    audience: 'Brand',
  },
];
