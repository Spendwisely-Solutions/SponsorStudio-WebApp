'use client';

import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, ArrowRight } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import HeroSectionNew from './HeroSectionNew';
import SuccessStoriesSection from './SuccessStoriesSection';
import TrendingEvents from './TrendingEvents';
import HowItWorks from './HowItWorks';
import TrustedBySection from './TrustedBySection';
import InteractiveDashboard from './InteractiveDashboard';
import TrustSection from './TrustSection';
import TestimonialsSection from './TestimonialsSection';
import PricingSection from './PricingSection';
import FinalCTA from './FinalCTA';
import { SIGN_IN_URL } from '../../lib/site';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [clientLogos, setClientLogos] = useState<ClientLogo[]>([]);
  const [successStories, setSuccessStories] = useState<SuccessStory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedEvent, setSelectedEvent] = useState<any | null>(null);

  const setShowAuthForm = (value: boolean) => {
    if (value) {
      window.location.href = SIGN_IN_URL;
    }
  };

  // Logos and stories load independently. If either request fails, that section
  // simply hides itself; the rest of the landing page is unaffected.
  useEffect(() => {
    const load = async () => {
      const [logos, stories] = await Promise.all([
        supabase.from('client_logos').select('*'),
        supabase.from('success_stories').select('*').order('created_at', { ascending: false }),
      ]);
      if (logos.error) console.error('Error fetching client logos:', logos.error);
      else setClientLogos(logos.data || []);
      if (stories.error) console.error('Error fetching success stories:', stories.error);
      else setSuccessStories(stories.data || []);
      setLoading(false);
    };
    load();
  }, []);

  return (
    <div className="min-h-screen bg-background text-text-primary overflow-x-clip">

      
      <HeroSectionNew />
      <TrustedBySection loading={loading} clientLogos={clientLogos} />
      <HowItWorks linkToPage />
      <InteractiveDashboard />
      <TrendingEvents showAuthForm={() => setShowAuthForm(true)} onSelectEvent={setSelectedEvent} />
      <TrustSection />
      <SuccessStoriesSection loading={loading} successStories={successStories} />
      <TestimonialsSection />
      <PricingSection linkToPage />
      <FinalCTA />

      

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
Premium Listing
                </div>
              </div>

              {/* Body Content */}
              <div className="flex-1 p-6 sm:p-8 flex flex-col justify-between">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-semibold text-text-primary mb-4 leading-tight">
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
                  <a
                    href={SIGN_IN_URL} className="group w-full inline-flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-bold text-white text-base transition-all duration-300 bg-primary hover:bg-primary-hover"
                  >
                    Inquire Sponsorship
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </a>
                  
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