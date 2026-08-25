import { Suspense } from 'react';
import { Metadata } from 'next';
import EventDetailsClient from '../../components/EventDetailsClient';

export const metadata: Metadata = {
  title: 'Event Details - Sponsor Studio',
  description: 'View full event demographic details, budget targets, footfall numbers, and sponsorship benefits.',
};

export default function EventsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    }>
      <EventDetailsClient />
    </Suspense>
  );
}
