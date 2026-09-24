import { Metadata } from 'next';
import ContentIndex from '../../components/ContentIndex';

export const metadata: Metadata = {
  title: 'Success stories',
  description: 'Case studies of brand partnerships and event sponsorships put together on Sponsor Studio.',
};

export default function StoriesPage() {
  return <ContentIndex kind="story" />;
}
