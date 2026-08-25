import { Metadata } from 'next';
import SuccessStoriesClient from '../../components/SuccessStoriesClient';

export const metadata: Metadata = {
  title: 'Success Stories - Sponsor Studio',
  description: 'Discover success stories and case studies of brand partnerships and event sponsorships powered by Sponsor Studio.',
};

export default function StoriesPage() {
  return <SuccessStoriesClient />;
}
