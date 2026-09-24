import type { Metadata } from 'next';
import Link from 'next/link';
import LegalDocument, { type LegalSection } from '../../../components/LegalDocument';
import { company } from '../../../lib/legal';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Sponsor Studio collects, uses, shares and protects personal data.',
  alternates: { canonical: '/legal/privacy-policy' },
};

// Draft written against the Digital Personal Data Protection Act, 2023 and the platform
// as described in the product documentation. To be reviewed by counsel.
const sections: LegalSection[] = [
  {
    id: 'who-we-are',
    title: 'Who we are',
    content: (
      <>
        <p>
          {company.brand} is operated by {company.entity}, {company.address} (&ldquo;we&rdquo;, &ldquo;us&rdquo;). We run a
          sponsorship marketplace that connects brands with events, creators and outdoor advertising, together with related
          services such as strategy consultations and the Event Sponsor Starter Kit.
        </p>
        <p>
          This policy applies to {company.websites.join(', ')} and any related pages, forms and emails (together, the
          &ldquo;Services&rdquo;). For the purposes of the Digital Personal Data Protection Act, 2023, we are the Data
          Fiduciary for the personal data described here.
        </p>
      </>
    ),
  },
  {
    id: 'what-we-collect',
    title: 'Personal data we collect',
    content: (
      <>
        <p>We collect only what we need to run the Services:</p>
        <ul>
          <li>
            <strong>Account details:</strong> name, email address, phone number and the type of account you hold (brand or
            event organiser). Passwords are handled by our authentication provider and are never visible to us.
          </li>
          <li>
            <strong>Profile details:</strong> company name, website, industry, company size, location, marketing budget,
            target audience, sponsorship goals, previous sponsorships, contact person, social media links and profile picture.
          </li>
          <li>
            <strong>Listing details (organisers):</strong> event information, media, sponsorship brochures, organisation name
            and address, point of contact, and the signature you provide when signing a listing MOU.
          </li>
          <li>
            <strong>Activity on the platform:</strong> listings you like or pass on, matches, messages, meetings, report
            requests and credit usage.
          </li>
          <li>
            <strong>Payment details:</strong> order, payment and transaction references for credit purchases and fees. Card,
            UPI and bank details are collected by our payment processor, not stored by us.
          </li>
          <li>
            <strong>Enquiries and subscriptions:</strong> what you send us through contact, demo, consultation and newsletter
            forms, including whether you are a brand or an event organiser.
          </li>
          <li>
            <strong>Technical data:</strong> device, browser, pages visited and approximate location, collected through
            cookies and analytics tools.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'how-we-use',
    title: 'How we use your data',
    content: (
      <ul>
        <li>To create and secure your account, including verifying your phone number and email address.</li>
        <li>To review and verify listings before they are shown to brands.</li>
        <li>To show relevant listings to brands and relevant brand interest to organisers, and to arrange meetings.</li>
        <li>To process credit purchases, listing fees, commissions and refunds.</li>
        <li>To prepare risk analysis and post-event reports that you request.</li>
        <li>To reply to enquiries, send service messages and, where you have subscribed, our newsletter.</li>
        <li>To understand how the Services are used, fix problems and improve them.</li>
        <li>To prevent fraud and misuse, and to meet our legal obligations.</li>
      </ul>
    ),
  },
  {
    id: 'legal-basis',
    title: 'Consent and legitimate uses',
    content: (
      <p>
        We process your personal data on the basis of the consent you give when you create an account, submit a form or
        subscribe, and for the legitimate uses permitted under the Digital Personal Data Protection Act, 2023, such as
        providing a service you have requested or complying with the law. You can withdraw consent at any time (see
        section 8); this does not affect processing that took place before you withdrew it.
      </p>
    ),
  },
  {
    id: 'sharing',
    title: 'Who we share it with',
    content: (
      <>
        <p>We do not sell your personal data. We share it only as follows:</p>
        <ul>
          <li>
            <strong>Between brands and organisers:</strong> when a brand expresses interest in a listing, the organiser is told.
            Contact details are shared once a match is unlocked or accepted, so both sides can meet.
          </li>
          <li>
            <strong>Service providers</strong> who process data on our behalf: Supabase (database, authentication and file
            storage), Razorpay (payments), Twilio (phone verification), EmailJS (email delivery), Google (analytics and
            calendar scheduling) and Vercel (hosting).
          </li>
          <li>
            <strong>Authorities</strong> where the law requires it, or to protect the rights and safety of our users and the
            public.
          </li>
          <li>
            <strong>A successor business</strong> if we are involved in a merger or acquisition, under the same protections.
          </li>
        </ul>
        <p>Some of these providers store data outside India. We use providers that apply appropriate safeguards.</p>
      </>
    ),
  },
  {
    id: 'retention',
    title: 'How long we keep it',
    content: (
      <p>
        We keep account and profile data for as long as your account is open. Transaction and invoicing records are kept for
        as long as tax and accounting law requires. Enquiries and newsletter data are kept until you ask us to delete them or
        unsubscribe. When data is no longer needed, we delete or anonymise it. [Confirm specific retention periods.]
      </p>
    ),
  },
  {
    id: 'security',
    title: 'Security',
    content: (
      <p>
        We protect personal data with access controls, encryption in transit, row-level security in our database and
        verified payment processing. No system is perfectly secure; if you find a vulnerability, please tell us through our{' '}
        <Link href="/legal/responsible-disclosure">Responsible Disclosure Policy</Link>. We will notify you and the
        authorities of a personal data breach where the law requires us to.
      </p>
    ),
  },
  {
    id: 'your-rights',
    title: 'Your rights',
    content: (
      <>
        <p>You can:</p>
        <ul>
          <li>ask for a summary of the personal data we hold about you and how it is processed;</li>
          <li>ask us to correct, complete or update it;</li>
          <li>ask us to erase it, unless we must keep it by law;</li>
          <li>withdraw your consent, for example by unsubscribing from emails or closing your account;</li>
          <li>nominate someone to exercise these rights on your behalf; and</li>
          <li>raise a grievance with us, and if unresolved, with the Data Protection Board of India.</li>
        </ul>
        <p>
          To exercise any of these rights, email <a href={`mailto:${company.email}`}>{company.email}</a>. We may need to
          verify your identity first.
        </p>
      </>
    ),
  },
  {
    id: 'cookies',
    title: 'Cookies and analytics',
    content: (
      <p>
        We use essential cookies to keep you signed in and remember your preferences, and analytics cookies (Google
        Analytics) to understand how the Services are used. You can block or delete cookies in your browser settings; some
        parts of the Services may not work without essential cookies.
      </p>
    ),
  },
  {
    id: 'children',
    title: 'Children',
    content: (
      <p>
        The Services are for businesses and are not intended for anyone under 18. We do not knowingly collect personal data
        from children. If you believe a child has given us personal data, contact us and we will delete it.
      </p>
    ),
  },
  {
    id: 'changes',
    title: 'Changes to this policy',
    content: (
      <p>
        We may update this policy from time to time. We will post the new version here with a new &ldquo;last updated&rdquo;
        date and, for significant changes, let account holders know by email.
      </p>
    ),
  },
  {
    id: 'contact',
    title: 'Grievance officer and contact',
    content: (
      <p>
        Grievance Officer: {company.grievanceOfficer}, <a href={`mailto:${company.grievanceEmail}`}>{company.grievanceEmail}</a>
        , {company.address}. We aim to respond to grievances within the time required by law. For anything else, email{' '}
        <a href={`mailto:${company.email}`}>{company.email}</a>.
      </p>
    ),
  },
];

export default function PrivacyPolicyPage() {
  return (
    <LegalDocument
      title="Privacy Policy"
      summary={
        <p>
          We collect the personal data needed to run a sponsorship marketplace, use it to connect brands and organisers, share
          it only with the other side of a match and the providers who help us run the Services, and never sell it.
        </p>
      }
      sections={sections}
    />
  );
}
