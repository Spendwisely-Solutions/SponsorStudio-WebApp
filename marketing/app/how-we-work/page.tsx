'use client';

import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import HowItWorks from "../../components/HomePage/HowItWorks";

export default function HowWeWorkPage() {
  const customNavLinks = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/how-we-work' },
    { label: 'Faq', href: '/faq' },
    { label: 'Blogs', href: '/blogs' },
    { label: 'Success Stories', href: '/stories' },
    { label: 'Contact Us', href: '/contact-us' }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-text-primary">
      <NavBar hideAuthButton={true} navLinks={customNavLinks} />
      <div className="h-10"></div>
      <main className="flex-1">
        <HowItWorks />
      </main>
      <Footer />
    </div>
  );
}
