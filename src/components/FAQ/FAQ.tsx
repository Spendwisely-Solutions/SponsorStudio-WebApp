import React, { useState, useEffect } from 'react';
import { ChevronDown, LogIn } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import NavBar from '../HomePage/NavBar';
import Footer from '../HomePage/Footer';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import AuthForm from '../AuthComponents/AuthForm';


interface FAQItem {
  id: number;
  question: string;
  answer: string;
  is_brand: boolean;
  list_order: number;
}

interface FAQSectionProps {
  isStandalonePage?: boolean;
}


const FAQSection: React.FC<FAQSectionProps> = ({ isStandalonePage = false }) => {
  const { user, profile, loading: authLoading } = useAuth();
  const [openItems, setOpenItems] = useState<number[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  // Initialize showAuthModal based on user state to prevent flash
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  // Determine user type: brand or creator
  // You may need to adjust this logic based on your profile schema
  const isBrand = profile?.user_type === 'brand';

  useEffect(() => {
    // Don't show auth modal until we know the auth state
    if (authLoading) return;
    
    const fetchFaqs = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('faq')
          .select('*')
          .order('list_order', { ascending: true });
        if (error) throw error;
        // Filter based on is_brand column and user type
        const filteredFaqs = data?.filter((faq: FAQItem) => faq.is_brand === isBrand) || [];
        setFaqs(filteredFaqs);
      } catch (err: any) {
        setError(err.message || 'Failed to fetch FAQs');
      } finally {
        setLoading(false);
      }
    };
    
    // Only fetch FAQs if user is logged in
    if (user) {
      fetchFaqs();
      // Close auth modal if user is logged in
      if (showAuthModal) {
        setShowAuthModal(false);
      }
    } else {
      setLoading(false);
      // Only show auth modal when no user is logged in and auth is not loading
      if (!showAuthModal) {
        setShowAuthModal(true);
      }
    }
  }, [isBrand, user, authLoading, showAuthModal]);

  const toggleItem = (id: number) => {
    setOpenItems(prev => {
      // If the clicked item is already open, close it
      if (prev.includes(id)) {
        return [];
      }
      // Otherwise, close all others and open only the clicked item
      return [id];
    });
  };

  const faqContent = (
    <div className={`${isStandalonePage ? 'min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50' : 'bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50'} ${!user ? 'relative' : ''}`}>
      {/* Background decorations */}
      <div className="absolute inset-0 -z-10 animate-gradient bg-gradient-to-br from-blue-200/40 via-indigo-100/40 to-purple-100/40 opacity-80"></div>
      <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-blue-200/40 to-indigo-300/30 rounded-full blur-3xl animate-pulse opacity-50" style={{ animationDuration: '4s' }}></div>
      <div className="absolute bottom-0 right-0 w-60 h-60 bg-gradient-to-br from-purple-200/40 to-pink-300/30 rounded-full blur-3xl animate-pulse opacity-50" style={{ animationDuration: '6s', animationDelay: '2s' }}></div>

      {/* Dark overlay when not logged in */}
      {!user && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-10"></div>
      )}

      <div className={`relative ${isStandalonePage ? 'py-24' : 'py-16'} px-4 sm:px-6 lg:px-8 ${!user ? 'blur-sm pointer-events-none' : ''}`}>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-1.5 mb-8 rounded-full bg-blue-100 text-blue-800 border border-blue-200 opacity-0">
              {/* <HelpCircle className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Help Center</span> */}
            </div>
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 pb-3">
              Frequently Asked Questions
            </h2>
            <p className="mt-6 max-w-2xl mx-auto text-xl sm:text-2xl text-gray-600 leading-relaxed font-light">
              Everything you need to know about SponsorStudio
            </p>
          </div>

          {/* FAQ Items */}
          <motion.div 
            className="space-y-6"
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.1
                }
              }
            }}
          >
            {!user ? (
              // Show login prompt when user is not logged in
              <motion.div 
                className="text-center py-16"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              >
                <motion.div 
                  className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-blue-100/40 p-12"
                  whileHover={{ 
                    scale: 1.02,
                    transition: { duration: 0.2 }
                  }}
                >
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                  >
                    <LogIn className="w-16 h-16 text-blue-600 mx-auto mb-6" />
                  </motion.div>
                  <motion.h3 
                    className="text-2xl font-bold text-gray-900 mb-4"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                  >
                    Sign in to View FAQs
                  </motion.h3>
                  <motion.p 
                    className="text-gray-600 mb-8 leading-relaxed"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                  >
                    Access personalized frequently asked questions based on your account type.
                    Sign in to get answers tailored specifically for you.
                  </motion.p>
                  <motion.button
                    onClick={() => setShowAuthModal(true)}
                    className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 shadow-lg"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    whileHover={{ 
                      scale: 1.05,
                      boxShadow: "0 10px 20px rgba(0, 0, 0, 0.2)",
                      transition: { duration: 0.2 }
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <LogIn className="w-5 h-5 mr-2" />
                    Sign In
                  </motion.button>
                </motion.div>
              </motion.div>
            ) : loading ? (
              <div className="text-center py-8 text-blue-600 animate-pulse">Loading FAQs...</div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">{error}</div>
            ) : faqs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No FAQs found for your user type.</div>
            ) : (
              faqs.map((item) => (
                <motion.div 
                  key={item.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-blue-100/40 overflow-hidden"
                  whileHover={{ 
                    y: -4,
                    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                    transition: { duration: 0.2, ease: "easeOut" }
                  }}
                >
                  <motion.button
                    onClick={() => toggleItem(item.id)}
                    className="w-full px-6 py-6 text-left flex items-center justify-between hover:bg-blue-50/50"
                    whileTap={{ scale: 0.995 }}
                    transition={{ duration: 0.1 }}
                    aria-expanded={openItems.includes(item.id)}
                  >
                    <span className="text-lg font-semibold text-gray-900 pr-4">
                      {item.question}
                    </span>
                    <motion.div 
                      className="flex-shrink-0"
                      animate={{ 
                        rotate: openItems.includes(item.id) ? 180 : 0 
                      }}
                      transition={{ 
                        duration: 0.3, 
                        ease: "easeInOut" 
                      }}
                    >
                      <ChevronDown className="w-5 h-5 text-blue-600" />
                    </motion.div>
                  </motion.button>
                  
                  <AnimatePresence>
                    {openItems.includes(item.id) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ 
                          height: "auto", 
                          opacity: 1,
                        }}
                        exit={{ 
                          height: 0, 
                          opacity: 0,
                        }}
                        transition={{ 
                          duration: 0.4,
                          ease: [0.04, 0.62, 0.23, 0.98]
                        }}
                        className="overflow-hidden"
                      >
                        <motion.div 
                          className="px-6 pb-6"
                          initial={{ y: -10, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: -10, opacity: 0 }}
                          transition={{ 
                            duration: 0.3,
                            delay: 0.1,
                            ease: "easeOut"
                          }}
                        >
                          <div className="pt-2 border-t border-gray-100">
                            <p className="text-gray-600 leading-relaxed">
                              {item.answer}
                            </p>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))
            )}
          </motion.div>

          {/* Contact CTA */}
          <div className="mt-16 text-center bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-blue-100/40 p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Still have questions?
            </h3>
            <p className="text-gray-600 mb-6">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <a
              href="mailto:connect@sponsorstudio.in"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      <AnimatePresence>
        {!authLoading && !user && showAuthModal && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="w-full max-w-md"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ 
                duration: 0.3,
                ease: [0.04, 0.62, 0.23, 0.98]
              }}
            >
              <AuthForm
                onSuccess={() => {
                  setShowAuthModal(false);
                  // Don't redirect to dashboard, just close modal and refresh FAQs
                }}
                onSignUpSuccess={() => {
                  setShowAuthModal(false);
                  // Don't redirect to dashboard, just close modal and refresh FAQs
                }}
                preventRedirect={true}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Custom Animations */}
      <style>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 8s ease-in-out infinite;
        }
      `}</style>
    </div>
  );

  return faqContent;
};

// Standalone FAQ Page Component
const FAQ: React.FC = () => {
  const { user, profile, isProfileComplete } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  return (
    <div>
      <Helmet>
        <title>FAQ - Sponsor Studio | Frequently Asked Questions</title>
        <meta name="description" content="Get answers to frequently asked questions about Sponsor Studio. Learn about our sponsorship platform, how it works, pricing, and support for brands and event organizers." />
        <meta name="keywords" content="FAQ, frequently asked questions, sponsorship help, sponsor studio support, event sponsorship guide, brand partnership questions, platform help" />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.sponsorstudio.in/faq" />
        <meta property="og:title" content="FAQ - Sponsor Studio | Frequently Asked Questions" />
        <meta property="og:description" content="Get answers to frequently asked questions about Sponsor Studio. Learn about our sponsorship platform, how it works, pricing, and support for brands and event organizers." />
        <meta property="og:image" content="https://www.sponsorstudio.in/sponsor_studio_logo.png" />
        <meta property="og:site_name" content="Sponsor Studio" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://www.sponsorstudio.in/faq" />
        <meta property="twitter:title" content="FAQ - Sponsor Studio | Frequently Asked Questions" />
        <meta property="twitter:description" content="Get answers to frequently asked questions about Sponsor Studio. Learn about our sponsorship platform, how it works, pricing, and support for brands and event organizers." />
        <meta property="twitter:image" content="https://www.sponsorstudio.in/sponsor_studio_logo.png" />

        {/* Additional SEO tags */}
        <meta name="robots" content="index, follow" />
        <meta name="author" content="Sponsor Studio" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="canonical" href="https://www.sponsorstudio.in/faq" />
        
        {/* Help/Support specific tags */}
        <meta name="category" content="Support" />
        <meta name="classification" content="Help, Support, FAQ, Customer Service" />
        <meta name="audience" content="Brands, Event Organizers, Business Partners" />
      </Helmet>

      {user && (
        <NavBar
          user={user}
          profile={profile as any}
          isProfileComplete={isProfileComplete}
          setShowAuthForm={() => {}} // Empty function since auth form isn't needed on FAQ page
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />
      )}
      <FAQSection isStandalonePage={true} />
      {user && <Footer />}
    </div>
  );
};

export default FAQ;
export { FAQSection };
