'use client';

import { usePathname } from 'next/navigation';
import ContactWidget from './HomePage/ContactWidget';

// Pages that are already contact forms don't need the floating enquiry button.
const HIDDEN_ON = ['/contact-us', '/book-demo'];

export default function FloatingContact() {
  const pathname = usePathname();
  if (HIDDEN_ON.some((path) => pathname.startsWith(path))) return null;
  return <ContactWidget />;
}
