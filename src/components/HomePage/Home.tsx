import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import AuthForm from '../../components/AuthComponents/AuthForm';
import ProfileCompletionDialog from '../../components/ProfileCompletionDialog';
import { useAuth } from '../../contexts/AuthContext';
import NavBar from '../../components/HomePage/NavBar';
import HeroSection from '../../components/HomePage/HeroSection';
import HeroSectionNew from '../../components/HomePage/HeroSectionNew';

import HowWeWorkSection from '../../components/HomePage/HowWeWorkSection';
import ClientsSection from '../../components/HomePage/ClientsSection';
import PricingSectionStatic from '../../components/HomePage/PricingStatic';
import SuccessStoriesSection from '../../components/HomePage/SuccessStoriesSection';
import Footer from '../../components/HomePage/Footer';
import AOS from 'aos';
import 'aos/dist/aos.css'; // Import AOS styles
import TrendingEvents from './TrendingEvents';
import HowItWorks from './HowItWorks';
import TrustedBySection from './TrustedBySection';
import WhatIsSponsorStudio from './WhatIsSponsorStudio';
import InteractiveDashboard from './InteractiveDashboard';
import FinalCTA from './FinalCTA';
import ContactWidget from './ContactWidget';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Sparkles, ArrowRight } from 'lucide-react';

// Shared types
interface Database {
  public: {
    Tables: {
      client_logos: {
        Row: ClientLogo;
      };
      success_stories: {
        Row: SuccessStory;
      };
    };
  };
}

interface ClientLogo {
  id: string;
  name: string;
  logo_url: string;
  row: string;
  trusted_by_order?: number;
}

interface SuccessStory {
  id: string;
  title: string;
  preview_image: string;
  preview_text: string;
  is_blog?: boolean;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
  message: string;
  organization_type: string;
}

interface User {
  email?: string;
  [key: string]: any;
}

interface Profile {
  company_name?: string;
  profile_picture_url?: string;
  user_type?: string;
  [key: string]: any;
}

const Home: React.FC = () => {
  const { user, profile, isProfileComplete, setShowProfileDialog } = useAuth();
  const navigate = useNavigate();
  const [clientLogos, setClientLogos] = useState<ClientLogo[]>([]);
  const [successStories, setSuccessStories] = useState<SuccessStory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllStories, setShowAllStories] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);
  
  const setShowAuthForm = (value: boolean) => {
    if (value) {
      navigate('/signin');
    }
  };
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [shouldShowProfileDialog, setShouldShowProfileDialog] = useState<boolean>(false);

  useEffect(() => {
    AOS.init({
      once: true, // Ensures animations only run once
    offset: 50, // Triggers animations 100px before element enters viewport
    });
  }, []);

  // Initialize and update dialog visibility
  useEffect(() => {
    const hasShownDialog = sessionStorage.getItem('profileDialogShown');

    if (!isProfileComplete && user && !hasShownDialog && !shouldShowProfileDialog) {
      setShouldShowProfileDialog(true);
      setShowProfileDialog(true);
    } else if (shouldShowProfileDialog && (isProfileComplete || hasShownDialog)) {
      setShouldShowProfileDialog(false);
      setShowProfileDialog(false);
    }
  }, [user, isProfileComplete, shouldShowProfileDialog, setShowProfileDialog]);

  // Fetch data (client logos and success stories)
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        await Promise.all([fetchClientLogos(), fetchSuccessStories()]);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []); // Run only once on mount

  const fetchClientLogos = async () => {
    const { data, error } = await supabase.from('client_logos').select('*');
    if (error) {
      console.error('Error fetching client logos:', error);
      throw error;
    }
    setClientLogos(data || []);
  };

  const fetchSuccessStories = async () => {
    const { data, error } = await supabase
      .from('success_stories')
      .select('*')
      .order('created_at', { ascending: false }); // Latest blogs first
    if (error) {
      console.error('Error fetching success stories:', error);
      throw error;
    }
    setSuccessStories(data || []);
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600">Error</h2>
          <p className="mt-2 text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-[#2B4B9B] text-white rounded-lg hover:bg-[#1F3A7A]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-text-primary transition-colors duration-500 overflow-x-hidden">

      <NavBar
        user={user}
        profile={profile}
        isProfileComplete={isProfileComplete}
        setShowAuthForm={setShowAuthForm}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      
      {/* 1. Hero Section */}
      <HeroSectionNew user={user} setShowAuthForm={setShowAuthForm} />
      
      {/* 2. Trusted By brands / Metrics */}
      <TrustedBySection loading={loading} clientLogos={clientLogos} />
      
      {/* Interactive Dashboard Preview (Brands vs. Organizers) */}
      <InteractiveDashboard user={user} setShowAuthForm={setShowAuthForm} />
      
      {/* 3. Trending Events Slider */}
      <TrendingEvents showAuthForm={() => setShowAuthForm(true)} onSelectEvent={setSelectedEvent} />
      
      {/* 4 & 5 & 6. The Problem/Solution, The Journey, Why Choose Sponsor Studio */}
      <WhatIsSponsorStudio />
      
      {/* 7. For Brands / For Organizers (Toggle separate journeys) */}
      <HowItWorks />
      
      {/* Client Logos Marquee scrolling row */}
      <ClientsSection loading={loading} clientLogos={clientLogos} />
      
      {/* 8. Success Stories / Testimonials */}
      <SuccessStoriesSection
        loading={loading}
        successStories={successStories}
        showAllStories={showAllStories}
        setShowAllStories={setShowAllStories}
      />
      

      
      {/* 10. Final bottom Call to Action */}
      <FinalCTA setShowAuthForm={setShowAuthForm} />
      
      {/* Floating contact/reach-out widget */}
      <ContactWidget />
      
      <Footer />

      {/* EVENT DETAILS SLIDE DRAWER PANEL */}
      <AnimatePresence>
        {selectedEvent && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedEvent(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity"
            />

            {/* Slide-over panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:max-w-md md:max-w-lg bg-surface border-l border-border shadow-2xl z-50 overflow-y-auto flex flex-col transition-colors duration-500"
            >
              {/* Image / video header */}
              <div className="relative h-64 sm:h-72 w-full bg-slate-900 flex-shrink-0">
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-black/50 hover:bg-black/70 flex items-center justify-center text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                {selectedEvent.media_urls && selectedEvent.media_urls.length > 0 ? (
                  selectedEvent.media_urls[0].match(/\.(mp4|webm|ogg)$/i) ? (
                    <video
                      src={selectedEvent.media_urls[0]}
                      className="w-full h-full object-cover"
                      autoPlay
                      loop
                      muted
                      playsInline
                    />
                  ) : (
                    <img
                      src={selectedEvent.media_urls[0]}
                      alt={selectedEvent.title}
                      className="w-full h-full object-cover"
                    />
                  )
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text-muted bg-surface-hover/30">
                    No Media Available
                  </div>
                )}
                
                {/* Premium Listing tag */}
                <div className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary text-text-inverse shadow-lg">
                  <Sparkles className="w-3.5 h-3.5" />
                  Premium Listing
                </div>
              </div>

              {/* Body Content */}
              <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black text-text-primary mb-4 leading-tight">
                    {selectedEvent.title}
                  </h3>

                  {/* Badges / Meta info */}
                  <div className="space-y-3 mb-6">
                    <div className="flex items-center gap-3 text-text-secondary text-sm">
                      <div className="w-8 h-8 rounded-lg bg-info/10 border border-info/20 flex items-center justify-center text-info flex-shrink-0">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <span>
                        {selectedEvent.start_date ? new Date(selectedEvent.start_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Date TBD'}
                        {selectedEvent.end_date && ` - ${new Date(selectedEvent.end_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 text-text-secondary text-sm">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <span>{selectedEvent.location || 'Location TBD'}</span>
                    </div>
                  </div>

                  <div className="border-t border-border/50 pt-6">
                    <h4 className="text-sm font-bold text-text-primary uppercase tracking-wider mb-2">
                      About the Event
                    </h4>
                    <p className="text-text-secondary text-sm sm:text-base leading-relaxed whitespace-pre-line">
                      {selectedEvent.description}
                    </p>
                  </div>
                </div>

                <div className="mt-8 border-t border-border/50 pt-6 space-y-3">
                  {profile?.user_type === 'brand' ? (
                    <a
                      href={`/dashboard?search=${encodeURIComponent(selectedEvent.title)}`}
                      className="group w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-[#0A1628] text-base transition-all duration-300 hover:scale-[1.02]"
                      style={{
                        background: 'linear-gradient(135deg, #00D4FF, #3B82F6)',
                        boxShadow: '0 0 20px rgba(0,212,255,0.3)',
                      }}
                    >
                      Inquire Sponsorship
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </a>
                  ) : (
                    <div className="p-4 rounded-xl bg-surface-hover/30 border border-border/50 text-center">
                      <p className="text-text-secondary text-sm">
                        Logged in as <strong className="capitalize">{profile?.user_type || 'user'}</strong>. 
                        Sign in as a Brand to connect and negotiate with organizers.
                      </p>
                    </div>
                  )}
                  
                  <button
                    onClick={() => setSelectedEvent(null)}
                    className="w-full inline-flex items-center justify-center px-6 py-3.5 rounded-xl font-semibold text-text-primary text-sm border border-border bg-surface-hover/10 transition-all duration-300 hover:bg-surface-hover/30"
                  >
                    Close Preview
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Home;
export type { Database, ClientLogo, SuccessStory, FormData, User, Profile };