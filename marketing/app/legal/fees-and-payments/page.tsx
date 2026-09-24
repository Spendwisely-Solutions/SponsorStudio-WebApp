import type { Metadata } from 'next';
import Link from 'next/link';
import LegalDocument, { type LegalSection } from '../../../components/LegalDocument';
import { company } from '../../../lib/legal';
import { CREDIT_VALIDITY_DAYS, consultation, creditCosts, creditPacks, organizerPlans, starterKit } from '../../../lib/pricing';

export const metadata: Metadata = {
  title: 'Fees, Payments and Refunds',
  description: 'How credits, listing fees, commissions, payments and refunds work on Sponsor Studio.',
  alternates: { canonical: '/legal/fees-and-payments' },
};

const basic = organizerPlans.find((p) => p.name === 'Basic');
const vip = organizerPlans.find((p) => p.name === 'VIP');

// Figures come from lib/pricing.ts so this policy always matches the pricing page. To be reviewed by counsel.
const sections: LegalSection[] = [
  {
    id: 'overview',
    title: 'Overview',
    content: (
      <p>
        All prices are in Indian Rupees. Current prices are shown on our <Link href="/pricing">pricing page</Link>; this
        policy explains how they are charged, used and refunded. [To confirm: whether credit pack prices include GST.]
      </p>
    ),
  },
  {
    id: 'credits',
    title: 'Credits for brands',
    content: (
      <>
        <p>Credits are bought in packs:</p>
        <ul>
          {creditPacks.map((pack) => (
            <li key={pack.name}>
              {pack.name}: {pack.credits} credits for {pack.price}
              {pack.offer ? ` (${pack.offer.toLowerCase()})` : ''}
            </li>
          ))}
        </ul>
        <p>Credits are spent when you take these actions:</p>
        <ul>
          {creditCosts.map((c) => (
            <li key={c.action}>
              {c.action}: {c.credits} credits
            </li>
          ))}
        </ul>
        <ul>
          <li>
            Credits are valid for {CREDIT_VALIDITY_DAYS} days from purchase. If you buy a new pack while you still have
            unexpired credits, their expiry is extended to match the new pack.
          </li>
          <li>Expired credits are removed from your balance automatically.</li>
          <li>Credits are deducted when an action is taken. If the action fails, the credits are returned to your balance.</li>
          <li>The first-purchase offer applies once per brand account.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'organiser-fees',
    title: 'Fees for organisers',
    content: (
      <ul>
        <li>Creating a listing is free. Listings go live after our team verifies them.</li>
        <li>To see and contact the brands interested in an event, you pay an unlock fee of ₹5,000 per event.</li>
        {basic && <li>Basic listings: {basic.priceNote.toLowerCase()}.</li>}
        {vip && (
          <li>
            VIP listings: {vip.price} and {vip.priceNote.toLowerCase()}. The upfront fee is refunded if less than ₹2 lakh in
            sponsorship is secured for the event.
          </li>
        )}
        <li>
          Commission is calculated on the sponsorship value of deals that close through Sponsor Studio and is invoiced once
          the deal is confirmed. [To confirm: invoicing and payment timelines.]
        </li>
      </ul>
    ),
  },
  {
    id: 'other-services',
    title: 'Other services',
    content: (
      <ul>
        <li>
          Strategy consultation: {consultation.price} ({consultation.total}) for a {consultation.duration}, paid when you
          book.
        </li>
        <li>Event Sponsor Starter Kit: {starterKit.price}, paid before work begins.</li>
      </ul>
    ),
  },
  {
    id: 'payments',
    title: 'How payments work',
    content: (
      <>
        <p>
          Online payments are processed by Razorpay, which accepts cards, UPI, net banking and wallets. We never see or store
          your full card or bank details. A purchase is complete once Razorpay confirms it and we have verified the payment;
          credits are then added to your balance straight away.
        </p>
        <p>If a payment fails, you are not charged and nothing is added to your account.</p>
      </>
    ),
  },
  {
    id: 'refunds',
    title: 'Refunds',
    content: (
      <ul>
        <li>[To confirm] Unused credits are non-refundable, including after they expire.</li>
        <li>Credits deducted for an action that failed are returned automatically.</li>
        <li>The VIP upfront fee is refunded under the condition in section 3.</li>
        <li>
          If you were charged twice or charged in error, contact us within [30] days and we will refund the duplicate or
          incorrect amount to the original payment method.
        </li>
        <li>[To confirm: refund terms for unlock fees, consultations and the Starter Kit.]</li>
      </ul>
    ),
  },
  {
    id: 'taxes',
    title: 'Taxes and invoices',
    content: (
      <p>
        GST is charged where applicable and shown on your invoice. Invoices are sent to the email address on your account.
        [To confirm: GSTIN details and invoicing process.]
      </p>
    ),
  },
  {
    id: 'changes',
    title: 'Price changes',
    content: (
      <p>
        We may change prices for future purchases. Changes do not affect credits you have already bought or fees already
        agreed for a listing.
      </p>
    ),
  },
  {
    id: 'contact',
    title: 'Billing questions',
    content: (
      <p>
        Email <a href={`mailto:${company.email}`}>{company.email}</a> with your account email and payment reference, and we
        will help.
      </p>
    ),
  },
];

export default function FeesPage() {
  return (
    <LegalDocument
      title="Fees, Payments and Refunds"
      summary={<p>How credits, listing fees, commissions and other services are priced, charged and refunded.</p>}
      sections={sections}
    />
  );
}
