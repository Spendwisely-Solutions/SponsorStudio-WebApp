import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Answers to common questions about credits, listings, matches and payouts on Sponsor Studio.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
