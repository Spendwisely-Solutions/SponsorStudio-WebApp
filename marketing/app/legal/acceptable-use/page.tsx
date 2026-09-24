import type { Metadata } from 'next';
import LegalDocument, { type LegalSection } from '../../../components/LegalDocument';
import { company } from '../../../lib/legal';

export const metadata: Metadata = {
  title: 'Acceptable Use Policy',
  description: 'What you may and may not do when using Sponsor Studio.',
  alternates: { canonical: '/legal/acceptable-use' },
};

// Draft. To be reviewed by counsel.
const sections: LegalSection[] = [
  {
    id: 'purpose',
    title: 'Why this policy exists',
    content: (
      <p>
        Sponsor Studio works because brands can trust listings and organisers can trust the brands contacting them. This
        policy sets out the behaviour that keeps it that way. It applies to everyone using the Services and forms part of
        our Terms of Service.
      </p>
    ),
  },
  {
    id: 'honest-listings',
    title: 'Honest listings and profiles',
    content: (
      <ul>
        <li>Only list events, creator inventory or outdoor placements that exist and that you have the right to sell.</li>
        <li>Do not inflate audience, footfall, reach or engagement figures, or misrepresent past sponsors.</li>
        <li>Do not impersonate another person, company or brand, or create accounts on someone else&apos;s behalf without permission.</li>
        <li>Keep your listing and profile up to date, and pause listings that are no longer available.</li>
      </ul>
    ),
  },
  {
    id: 'dealing',
    title: 'Dealing with other users',
    content: (
      <ul>
        <li>Use contact details shared through a match only to discuss that opportunity.</li>
        <li>Do not send spam, bulk unsolicited messages or harassing, abusive or discriminatory content.</li>
        <li>Do not arrange deals off the platform to avoid fees or commission on opportunities introduced through Sponsor Studio.</li>
      </ul>
    ),
  },
  {
    id: 'restricted',
    title: 'Restricted and prohibited content',
    content: (
      <ul>
        <li>Anything illegal in India, or that promotes illegal activity.</li>
        <li>
          Sponsorships or promotions that break Indian advertising rules, including restrictions on tobacco, alcohol,
          gambling and similar categories.
        </li>
        <li>Content that infringes someone else&apos;s intellectual property or privacy.</li>
        <li>Sexually explicit, hateful or violent content.</li>
      </ul>
    ),
  },
  {
    id: 'platform',
    title: 'Protecting the platform',
    content: (
      <ul>
        <li>Do not scrape, copy or bulk download listings, profiles or reports.</li>
        <li>Do not probe, attack or overload our systems, or try to access data that is not yours.</li>
        <li>Do not upload malware or anything designed to damage devices or data.</li>
        <li>Do not share your account or reuse credits, reports or brochures outside your organisation.</li>
      </ul>
    ),
  },
  {
    id: 'enforcement',
    title: 'What happens if the policy is broken',
    content: (
      <p>
        We may remove content, pause listings, suspend or close accounts, and report illegal activity to the authorities.
        Where an account is closed for a serious breach, unused credits may be forfeited. [To confirm.]
      </p>
    ),
  },
  {
    id: 'reporting',
    title: 'Reporting a problem',
    content: (
      <p>
        If you see a listing or user breaking this policy, email <a href={`mailto:${company.email}`}>{company.email}</a> with
        a link and a short description. Security issues should be reported under our Responsible Disclosure Policy.
      </p>
    ),
  },
];

export default function AcceptableUsePage() {
  return (
    <LegalDocument
      title="Acceptable Use Policy"
      summary={<p>Be honest about what you list, respect the people you meet through Sponsor Studio, and don&apos;t misuse the platform.</p>}
      sections={sections}
    />
  );
}
