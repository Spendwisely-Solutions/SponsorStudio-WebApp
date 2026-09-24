import type { Metadata } from 'next';
import LegalDocument, { type LegalSection } from '../../../components/LegalDocument';
import { company } from '../../../lib/legal';

export const metadata: Metadata = {
  title: 'Responsible Disclosure Policy',
  description: 'How to report a security vulnerability in Sponsor Studio, and what we commit to in return.',
  alternates: { canonical: '/legal/responsible-disclosure' },
};

// Draft. To be reviewed by counsel and the engineering team.
const sections: LegalSection[] = [
  {
    id: 'intro',
    title: 'Our approach',
    content: (
      <p>
        We take the security of our users&apos; data seriously and welcome reports from security researchers. If you
        believe you have found a vulnerability in Sponsor Studio, please tell us privately so we can fix it before it is
        misused.
      </p>
    ),
  },
  {
    id: 'scope',
    title: 'Scope',
    content: (
      <>
        <p>In scope:</p>
        <ul>
          {company.websites.map((site) => (
            <li key={site}>{site}</li>
          ))}
        </ul>
        <p>Out of scope:</p>
        <ul>
          <li>Denial of service, load testing or anything that degrades the Services for others.</li>
          <li>Social engineering, phishing or physical attacks against our team or users.</li>
          <li>Spam, missing best-practice headers or findings with no demonstrable security impact.</li>
          <li>Vulnerabilities in third-party services we use, which should be reported to those providers.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'how-to-report',
    title: 'How to report',
    content: (
      <>
        <p>
          Email <a href={`mailto:${company.securityEmail}`}>{company.securityEmail}</a> with:
        </p>
        <ul>
          <li>a description of the vulnerability and its potential impact;</li>
          <li>the steps, URLs and any proof of concept needed to reproduce it; and</li>
          <li>how we can reach you for follow-up questions.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'rules',
    title: 'Rules for testing',
    content: (
      <ul>
        <li>Only use accounts you own or have permission to use.</li>
        <li>Access no more data than you need to show the issue, and never change or delete other users&apos; data.</li>
        <li>Stop testing and report as soon as you find a vulnerability that exposes personal data.</li>
        <li>Keep the details confidential until we confirm the issue is fixed.</li>
      </ul>
    ),
  },
  {
    id: 'commitments',
    title: 'What we commit to',
    content: (
      <ul>
        <li>We will acknowledge your report within [3] working days.</li>
        <li>We will keep you updated while we investigate and fix the issue.</li>
        <li>With your permission, we will credit you once the fix is live.</li>
        <li>
          We will not take legal action against researchers who act in good faith and follow this policy.
        </li>
      </ul>
    ),
  },
  {
    id: 'rewards',
    title: 'Rewards',
    content: <p>We do not currently run a paid bug bounty programme. [To confirm.]</p>,
  },
];

export default function ResponsibleDisclosurePage() {
  return (
    <LegalDocument
      title="Responsible Disclosure Policy"
      summary={<p>Found a security issue? Tell us privately, give us time to fix it, and we will work with you in good faith.</p>}
      sections={sections}
    />
  );
}
