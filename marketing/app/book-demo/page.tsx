import { Metadata } from 'next';
import BookDemoClient from '../../components/BookDemoClient';

export const metadata: Metadata = {
  title: 'Book a Strategy Demo - Sponsor Studio',
  description: 'Book a free sponsorship strategy demo call. See how Sponsor Studio connects brands and events through AI matching and expert advisory.',
};

export default function BookDemoPage() {
  return <BookDemoClient />;
}
