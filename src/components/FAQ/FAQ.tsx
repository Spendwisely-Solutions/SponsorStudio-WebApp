import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, LogIn } from 'lucide-react';
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
  const { user, profile } = useAuth();
  const [openItems, setOpenItems] = useState<number[]>([]);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);

  // Determine user type: brand or creator
  // You may need to adjust this logic based on your profile schema
  const isBrand = profile?.user_type === 'brand';

  useEffect(() => {
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
    } else {
      setLoading(false);
      // Automatically show auth modal when no user is logged in
      setShowAuthModal(true);
    }
  }, [isBrand, user]);

  const toggleItem = (id: number) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    );
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
          <div className="space-y-6">
            {!user ? (
              // Show login prompt when user is not logged in
              <div className="text-center py-16">
                <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-blue-100/40 p-12">
                  <LogIn className="w-16 h-16 text-blue-600 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Sign in to View FAQs
                  </h3>
                  <p className="text-gray-600 mb-8 leading-relaxed">
                    Access personalized frequently asked questions based on your account type.
                    Sign in to get answers tailored specifically for you.
                  </p>
                  <button
                    onClick={() => setShowAuthModal(true)}
                    className="inline-flex items-center px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                  >
                    <LogIn className="w-5 h-5 mr-2" />
                    Sign In
                  </button>
                </div>
              </div>
            ) : loading ? (
              <div className="text-center py-8 text-blue-600 animate-pulse">Loading FAQs...</div>
            ) : error ? (
              <div className="text-center py-8 text-red-500">{error}</div>
            ) : faqs.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No FAQs found for your user type.</div>
            ) : (
              faqs.map((item) => (
                <div 
                  key={item.id}
                  className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-blue-100/40 overflow-hidden transition-all duration-300 hover:shadow-xl"
                >
                  <button
                    onClick={() => toggleItem(item.id)}
                    className="w-full px-6 py-6 text-left flex items-center justify-between hover:bg-blue-50/50 transition-colors duration-200"
                    aria-expanded={openItems.includes(item.id)}
                  >
                    <span className="text-lg font-semibold text-gray-900 pr-4">
                      {item.question}
                    </span>
                    <div className="flex-shrink-0">
                      {openItems.includes(item.id) ? (
                        <ChevronUp className="w-5 h-5 text-blue-600" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-blue-600" />
                      )}
                    </div>
                  </button>
                  {openItems.includes(item.id) && (
                    <div className="px-6 pb-6">
                      <div className="pt-2 border-t border-gray-100">
                        <p className="text-gray-600 leading-relaxed">
                          {item.answer}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

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
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-auto">
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
        </div>
      )}

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
