'use client';

import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import TrendingEvents from "../../components/HomePage/TrendingEvents";

export default function TrendingEventsPage() {
  const customNavLinks = [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/how-we-work' },
    { label: 'Faq', href: '/faq' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background text-text-primary">
      <NavBar hideAuthButton={true} navLinks={customNavLinks} />
      <div className="h-10"></div>
      <main className="flex-grow">
        <TrendingEvents showAuthForm={() => {}} />
      </main>
      <Footer />
    </div>
  );
}
