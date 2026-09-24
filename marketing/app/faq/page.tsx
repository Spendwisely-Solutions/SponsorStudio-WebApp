import FaqClient from '../../components/FaqClient';
import { getFaqs } from '../../lib/data';

// Questions are fetched on the server and cached, so they are in the page when it loads.
export const revalidate = 3600;

export default async function FAQPage() {
  const faqs = await getFaqs();
  return <FaqClient faqs={faqs} />;
}
