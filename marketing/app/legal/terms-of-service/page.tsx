import type { Metadata } from 'next';
import Link from 'next/link';
import LegalDocument, { type LegalSection } from '../../../components/LegalDocument';
import { company } from '../../../lib/legal';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The terms that apply when you use Sponsor Studio.',
  alternates: { canonical: '/legal/terms-of-service' },
};

// Draft based on the platform flow in the product documentation. To be reviewed by counsel.
const sections: LegalSection[] = [
  {
    id: 'agreement',
    title: 'Agreement',
    content: (
      <p>
        These terms are an agreement between you and {company.entity} (&ldquo;{company.brand}&rdquo;, &ldquo;we&rdquo;).
        By creating an account or using the Services you agree to them, together with our{' '}
        <Link href="/legal/privacy-policy">Privacy Policy</Link>,{' '}
        <Link href="/legal/fees-and-payments">Fees, Payments and Refunds policy</Link> and{' '}
        <Link href="/legal/acceptable-use">Acceptable Use Policy</Link>. If you use the Services for a company, you confirm
        you are authorised to accept these terms on its behalf.
      </p>
    ),
  },
  {
    id: 'the-service',
    title: 'What Sponsor Studio does',
    content: (
      <>
        <p>
          Sponsor Studio is a marketplace. Event organisers, creators and outdoor media owners list sponsorship
          opportunities; brands discover them, express interest and, when both sides agree, meet to negotiate a deal.
        </p>
        <p>
          Any sponsorship agreement is between the brand and the organiser. We are not a party to it and do not guarantee
          that an event, creator or placement will deliver a particular result, beyond the commission and fee terms in these
          terms and our fees policy.
        </p>
      </>
    ),
  },
  {
    id: 'accounts',
    title: 'Accounts',
    content: (
      <ul>
        <li>You must be at least 18 and able to enter a binding contract.</li>
        <li>Information you give us, including phone and email verification, must be accurate and kept up to date.</li>
        <li>Keep your login details safe. You are responsible for activity on your account.</li>
        <li>We may suspend or close accounts that breach these terms or put other users at risk.</li>
      </ul>
    ),
  },
  {
    id: 'brands',
    title: 'Brands and credits',
    content: (
      <>
        <p>
          Brands buy credits and spend them on actions such as expressing interest in a listing, unlocking a brochure,
          reviving listings they passed on, and requesting risk analysis or post-event reports. The current packs and costs
          are listed on our <Link href="/pricing">pricing page</Link>.
        </p>
        <ul>
          <li>Credits are valid for 180 days from purchase and expire automatically after that.</li>
          <li>Credits have no cash value and cannot be transferred between accounts.</li>
          <li>Credits are deducted when you take an action. If the action fails, the credits are returned.</li>
          <li>
            Risk analysis and post-event reports are prepared by our team from the information available to us. They are for
            guidance only and are not a guarantee of any outcome.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'organisers',
    title: 'Organisers and listings',
    content: (
      <>
        <ul>
          <li>Listings are free to create, and are reviewed and verified by our team before brands can see them.</li>
          <li>
            Basic listings require you to sign a listing MOU with us before the listing goes live. The MOU sets out the
            commission and deliverables.
          </li>
          <li>You must have the right to offer every sponsorship opportunity you list, and your listing must be accurate.</li>
          <li>To see the brands interested in an event, you pay an unlock fee per event.</li>
          <li>
            When a sponsorship deal that started on Sponsor Studio closes, commission is payable: 10% for Basic listings and
            25% for VIP listings.
          </li>
          <li>
            VIP listings carry an upfront fee, which is refunded if less than ₹2 lakh in sponsorship is secured for the event.
          </li>
        </ul>
        <p>
          Fee amounts, invoicing and refunds are set out in our{' '}
          <Link href="/legal/fees-and-payments">Fees, Payments and Refunds policy</Link>.
        </p>
      </>
    ),
  },
  {
    id: 'deals',
    title: 'Matches, meetings and deals',
    content: (
      <>
        <p>
          When a brand expresses interest, the organiser can accept or decline. Once both sides accept, we arrange a meeting
          and share contact details. Brands and organisers negotiate the deal directly.
        </p>
        <p>
          [To confirm: non-circumvention.] If a brand and an organiser are introduced through Sponsor Studio, deals between
          them for that opportunity within [12] months of the introduction are treated as closed through Sponsor Studio for
          commission purposes, even if they are signed outside the platform.
        </p>
      </>
    ),
  },
  {
    id: 'content',
    title: 'Your content and our platform',
    content: (
      <>
        <p>
          You keep ownership of the content you upload, such as event media and brochures. You give us a licence to host,
          display and share it with other users as needed to run the Services and to promote your listing on Sponsor Studio.
        </p>
        <p>
          The Sponsor Studio name, logo, software and site content belong to us. You may not copy, scrape or reuse them
          without our permission.
        </p>
      </>
    ),
  },
  {
    id: 'acceptable-use',
    title: 'Acceptable use',
    content: (
      <p>
        You must follow our <Link href="/legal/acceptable-use">Acceptable Use Policy</Link>. In short: be honest, respect
        other users, and do not misuse or attack the Services.
      </p>
    ),
  },
  {
    id: 'disclaimers',
    title: 'Disclaimers',
    content: (
      <p>
        We work to keep the Services accurate and available, but they are provided &ldquo;as is&rdquo;. Audience, footfall
        and reach figures are provided by organisers; we verify listings but cannot guarantee every figure. We do not
        guarantee that you will find a sponsor or a sponsorship opportunity.
      </p>
    ),
  },
  {
    id: 'liability',
    title: 'Limitation of liability',
    content: (
      <p>
        To the extent the law allows, we are not liable for indirect or consequential losses, lost profits or lost
        opportunities, and our total liability to you for any claim is limited to the fees you paid us in the 12 months
        before the claim arose. Nothing in these terms limits liability that cannot be limited by law.
      </p>
    ),
  },
  {
    id: 'indemnity',
    title: 'Indemnity',
    content: (
      <p>
        You agree to compensate us for claims and losses arising from your breach of these terms, your content, or any
        sponsorship agreement you enter into with another user.
      </p>
    ),
  },
  {
    id: 'termination',
    title: 'Suspension and closure',
    content: (
      <p>
        You can close your account at any time. We may suspend or close an account that breaches these terms or the
        Acceptable Use Policy. Commission and fees already owed remain payable after closure.
      </p>
    ),
  },
  {
    id: 'law',
    title: 'Governing law and disputes',
    content: (
      <p>
        These terms are governed by the laws of India. Courts in {company.jurisdiction} have exclusive jurisdiction.
        [To confirm: whether disputes should first go to arbitration.]
      </p>
    ),
  },
  {
    id: 'changes',
    title: 'Changes',
    content: (
      <p>
        We may update these terms. We will post changes here and notify account holders of significant changes. Continuing
        to use the Services after a change means you accept the updated terms.
      </p>
    ),
  },
  {
    id: 'contact',
    title: 'Contact',
    content: (
      <p>
        {company.entity}, {company.address}. Email <a href={`mailto:${company.email}`}>{company.email}</a>.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalDocument
      title="Terms of Service"
      summary={
        <p>
          Sponsor Studio introduces brands and organisers; the sponsorship deal itself is between them. Brands pay with
          credits, organisers list for free and pay an unlock fee and commission when deals close.
        </p>
      }
      sections={sections}
    />
  );
}
