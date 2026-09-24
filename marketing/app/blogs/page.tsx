import { Metadata } from 'next';
import ContentIndex from '../../components/ContentIndex';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Guides, playbooks and lessons on event sponsorship and brand activations from Sponsor Studio.',
};

export default function BlogsPage() {
  return <ContentIndex kind="blog" />;
}
