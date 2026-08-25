import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQLanding: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs: FAQItem[] = [
    {
      question: "How does Sponsor Studio connect brands with events?",
      answer: "We use an intelligent matching engine that evaluates budgets, target audiences, industry categories, and event locations. Brands can search verified listings, filter opportunities, and match with event organizers who align with their strategic marketing goals."
    },
    {
      question: "Is the risk analysis really AI-powered?",
      answer: "Yes, Sponsor Studio features custom-trained AI risk analysis. It reviews historical event data, organizer track records, pricing structures, and expected deliverable metrics. This gives brands an objective evaluation to verify if a sponsorship is worth the investment before committing."
    },
    {
      question: "How does organizer and brand verification work?",
      answer: "To ensure a trusted ecosystem, every brand and event organizer undergoes a vetting process. We verify business registrations, previous event reports, social handles, and identity details. This helps eliminate spam or unverified requests, fostering reliable partnerships."
    },
    {
      question: "How are sponsorship agreements managed?",
      answer: "Once a mutual fit is established, partners can collaborate directly in our secure workspace to negotiate packages. When aligned, our platform generates digital MOUs (Memorandum of Understanding) which can be digitally finalized and signed directly from the dashboard."
    },
    {
      question: "What are the charges for event organizers and brands?",
      answer: "Organizers can create a profile and list their events for free. We offer premium visibility packages to boost reach. Brands can browse and explore verified events at no initial cost, with subscription options available for advanced AI search, risk analysis, and analytics dashboard access."
    }
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section 
      className="relative py-20 px-4 sm:px-8 overflow-hidden transition-colors duration-500"
      style={{ background: 'var(--gradient-contact)' }}
      id="faq"
    >
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(color-mix(in srgb, var(--color-primary) 80%, transparent) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <div className="absolute top-10 left-10 w-72 h-72 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full blur-3xl opacity-40"></div>
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl opacity-40"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full text-sm font-medium bg-info/10 border border-info/30 text-info">
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            FAQ
          </div>
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black text-text-primary mb-6 leading-tight">
            Frequently Asked{' '}
            <span style={{ background: 'linear-gradient(90deg, #00D4FF, #6366F1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              Questions
            </span>
          </h2>
          <p className="text-text-secondary text-lg max-w-2xl mx-auto">
            Everything you need to know about Sponsor Studio, verification, matching, and getting started.
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div 
                key={index}
                className="bg-surface/30 border border-border backdrop-blur-md rounded-2xl overflow-hidden transition-all duration-300 hover:border-primary/20"
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full flex items-center justify-between text-left p-6 font-bold text-base sm:text-lg text-text-primary hover:bg-surface-hover/20 transition-colors duration-200"
                >
                  <span>{faq.question}</span>
                  <ChevronDown 
                    className={`w-5 h-5 text-primary transition-transform duration-300 flex-shrink-0 ml-4 ${isOpen ? 'rotate-180' : ''}`} 
                  />
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-6 pt-1 text-sm sm:text-base text-text-secondary border-t border-border/30 leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQLanding;
