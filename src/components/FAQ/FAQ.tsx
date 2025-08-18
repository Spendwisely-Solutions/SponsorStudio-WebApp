import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import NavBar from '../HomePage/NavBar';
import Footer from '../HomePage/Footer';
import { useAuth } from '../../contexts/AuthContext';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "How does SponsorStudio match brands with event organizers?",
    answer: "SponsorStudio uses an intelligent matching algorithm that considers factors like industry alignment, event type, budget requirements, audience demographics, and location preferences. When you create your profile and events, our system automatically identifies potential matches and notifies both parties when there's a good fit."
  },
  {
    question: "What payment methods are accepted and how does the payment system work?",
    answer: "We accept all major payment methods through our secure Razorpay integration, including credit cards, debit cards, UPI, and net banking. For creators, there's a one-time fee of ₹5,000 to unlock and view brand contact details for each event. All payments are processed securely and you'll receive instant confirmation upon successful payment."
  },
  {
    question: "How do I create and manage my events on the platform?",
    answer: "Event organizers can easily create events through their dashboard by providing details like event title, description, dates, location, media files, sponsorship requirements, and brochures. Once published, your events become visible to potential sponsors. You can edit, update, or manage all your events from the Creator Dashboard, and track engagement through built-in analytics."
  },
  {
    question: "What analytics and reporting features are available?",
    answer: "SponsorStudio provides comprehensive analytics including event performance metrics, match success rates, audience engagement data, and sponsorship ROI tracking. You can generate detailed reports on your events, view trending metrics, monitor application statuses, and analyze which events attract the most sponsor interest to optimize your future events."
  },
  {
    question: "How do I schedule meetings with potential sponsors or event organizers?",
    answer: "Once a match is accepted by both parties, you can schedule meetings directly through the platform. The system provides integrated calendar functionality where you can set meeting times, add video call links, and send calendar invites. All scheduled meetings are visible in your dashboard with easy access to join links and meeting details."
  },
  {
    question: "What should I include in my profile to attract better matches?",
    answer: "A complete profile significantly improves match quality. Include your company details, industry information, high-quality profile pictures, detailed descriptions of your services/events, contact information, website links, and past success stories. For event organizers, upload compelling event media and detailed sponsorship brochures. For brands, clearly outline your sponsorship preferences and budget ranges."
  }
];

interface FAQSectionProps {
  isStandalonePage?: boolean;
}

const FAQSection: React.FC<FAQSectionProps> = ({ isStandalonePage = false }) => {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    );
  };

  const faqContent = (
    <div className={`${isStandalonePage ? 'min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50' : 'bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50'}`}>
      {/* Background decorations */}
      <div className="absolute inset-0 -z-10 animate-gradient bg-gradient-to-br from-blue-200/40 via-indigo-100/40 to-purple-100/40 opacity-80"></div>
      <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-blue-200/40 to-indigo-300/30 rounded-full blur-3xl animate-pulse opacity-50" style={{ animationDuration: '4s' }}></div>
      <div className="absolute bottom-0 right-0 w-60 h-60 bg-gradient-to-br from-purple-200/40 to-pink-300/30 rounded-full blur-3xl animate-pulse opacity-50" style={{ animationDuration: '6s', animationDelay: '2s' }}></div>

      <div className={`relative ${isStandalonePage ? 'py-24' : 'py-16'} px-4 sm:px-6 lg:px-8`}>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-4 py-1.5 mb-8 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
              <HelpCircle className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">Help Center</span>
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
            {faqData.map((item, index) => (
              <div 
                key={index}
                className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-blue-100/40 overflow-hidden transition-all duration-300 hover:shadow-xl"
              >
                <button
                  onClick={() => toggleItem(index)}
                  className="w-full px-6 py-6 text-left flex items-center justify-between hover:bg-blue-50/50 transition-colors duration-200"
                  aria-expanded={openItems.includes(index)}
                >
                  <span className="text-lg font-semibold text-gray-900 pr-4">
                    {item.question}
                  </span>
                  <div className="flex-shrink-0">
                    {openItems.includes(index) ? (
                      <ChevronUp className="w-5 h-5 text-blue-600" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-blue-600" />
                    )}
                  </div>
                </button>
                
                {openItems.includes(index) && (
                  <div className="px-6 pb-6">
                    <div className="pt-2 border-t border-gray-100">
                      <p className="text-gray-600 leading-relaxed">
                        {item.answer}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
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
              href="#contact"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>

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
      <NavBar
        user={user}
        profile={profile as any}
        isProfileComplete={isProfileComplete}
        setShowAuthForm={() => {}} // Empty function since auth form isn't needed on FAQ page
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
      />
      <FAQSection isStandalonePage={true} />
      <Footer />
    </div>
  );
};

export default FAQ;
export { FAQSection };
