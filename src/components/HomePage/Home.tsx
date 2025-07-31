import React, { useState, useEffect } from 'react';
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
import ContactSection from '../../components/HomePage/ContactSection';
import Footer from '../../components/HomePage/Footer';
import AOS from 'aos';
import 'aos/dist/aos.css'; // Import AOS styles
import TrendingEvents from './TrendingEvents';

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
}

interface SuccessStory {
  id: string;
  title: string;
  preview_image: string;
  preview_text: string;
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
  const [clientLogos, setClientLogos] = useState<ClientLogo[]>([]);
  const [successStories, setSuccessStories] = useState<SuccessStory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showAllStories, setShowAllStories] = useState<boolean>(false);
  const [showAuthForm, setShowAuthForm] = useState<boolean>(false);
  
  // Add a useEffect to log when showAuthForm state changes
  useEffect(() => {
  }, [showAuthForm]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    message: '',
    organization_type: '',
  });
  const [showThankYou, setShowThankYou] = useState<boolean>(false);
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
    const { data, error } = await supabase.from('success_stories').select('*');
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
    <div className="min-h-screen bg-white" style={{ overflowX: 'hidden' }}>
      {showAuthForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="relative w-full max-w-md">
            <button
              onClick={() => setShowAuthForm(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 z-10 will-change-transform md:top-3 md:right-10"
            >
              <X className="h-6 w-6" />
            </button>
            <AuthForm onSuccess={() => setShowAuthForm(false)} onSignUpSuccess={() => setShowAuthForm(false)} />
          </div>
        </div>
      )}

      {shouldShowProfileDialog && !isProfileComplete && (
        <ProfileCompletionDialog
          onClose={() => {
            setShouldShowProfileDialog(false);
            setShowProfileDialog(false);
            sessionStorage.setItem('profileDialogShown', 'true');
          }}
        />
      )}

      <NavBar
        user={user}
        profile={profile}
        isProfileComplete={isProfileComplete}
        setShowAuthForm={setShowAuthForm}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      {/* <HeroSection user={user} setShowAuthForm={setShowAuthForm} /> */}
      <HeroSectionNew user={user} setShowAuthForm={setShowAuthForm} />
      <TrendingEvents />
      {/* <HowWeWorkSection /> */}
      <ClientsSection loading={loading} clientLogos={clientLogos} />
      {/* <PricingSectionStatic /> */}
      <SuccessStoriesSection
        loading={loading}
        successStories={successStories}
        showAllStories={showAllStories}
        setShowAllStories={setShowAllStories}
      />
      <ContactSection
        formData={formData}
        setFormData={setFormData}
        showThankYou={showThankYou}
        setShowThankYou={setShowThankYou}
      />
      <Footer />
    </div>
  );
};

export default Home;
export type { Database, ClientLogo, SuccessStory, FormData, User, Profile };