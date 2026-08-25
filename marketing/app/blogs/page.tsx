import { Metadata } from 'next';
import BlogsClient from '../../components/BlogsClient';

export const metadata: Metadata = {
  title: 'Blogs - Sponsor Studio',
  description: 'Read the latest updates, tips, guides, and stories on event sponsorships and brand activations from Sponsor Studio.',
};

export default function BlogsPage() {
  return <BlogsClient />;
}
