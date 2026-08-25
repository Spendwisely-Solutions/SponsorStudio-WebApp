'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, HelpCircle, Mail } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import NavBar from '../../components/NavBar';
import Footer from '../../components/Footer';
import { supabase } from '../../lib/supabaseClient';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
  is_brand: boolean;
  list_order: number;
}

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [activeTab, setActiveTab] = useState<'brand' | 'organizer'>('brand');
  const [openItems, setOpenItems] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

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
        setFaqs(data || []);
      } catch (err: any) {
        console.error('Error fetching FAQs:', err);
        setError(err.message || 'Failed to fetch FAQs');
      } finally {
        setLoading(false);
      }
    };
    fetchFaqs();
  }, []);

  const toggleItem = (id: number) => {
    setOpenItems(prev => prev.includes(id) ? [] : [id]);
  };

  const filteredFaqs = faqs.filter(faq => faq.is_brand === (activeTab === 'brand'));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 flex flex-col text-text-primary transition-colors duration-500">
      <NavBar hideAuthButton={false} />
      
      <main className="flex-grow py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-blue-200/20 via-indigo-100/20 to-purple-100/20 opacity-80" />
        <div className="absolute top-20 left-0 w-72 h-72 bg-gradient-to-br from-blue-200/40 to-indigo-300/30 rounded-full blur-3xl opacity-45" />
        <div className="absolute bottom-20 right-0 w-60 h-60 bg-gradient-to-br from-purple-200/40 to-pink-300/30 rounded-full blur-3xl opacity-45" />

        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-1.5 mb-6 rounded-full bg-blue-100/80 border border-blue-200 text-blue-800">
              <HelpCircle className="w-4 h-4 mr-2" />
              <span className="text-sm font-medium">FAQ Center</span>
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 pb-3">
              Frequently Asked Questions
            </h1>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-600 font-light">
              Everything you need to know about SponsorStudio
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-10">
            <div className="bg-slate-200/60 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-1.5 rounded-2xl flex gap-1 backdrop-blur-md">
              <button
                onClick={() => { setActiveTab('brand'); setOpenItems([]); }}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                  activeTab === 'brand'
                    ? 'bg-white text-blue-600 shadow-md border border-gray-200/30'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                For Brands
              </button>
              <button
                onClick={() => { setActiveTab('organizer'); setOpenItems([]); }}
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                  activeTab === 'organizer'
                    ? 'bg-white text-blue-600 shadow-md border border-gray-200/30'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                For Organizers
              </button>
            </div>
          </div>

          {/* FAQ Items */}
          <div className="space-y-4">
            {loading ? (
              <div className="text-center py-12 text-blue-600 animate-pulse">Loading FAQs...</div>
            ) : error ? (
              <div className="text-center py-12 text-red-500">{error}</div>
            ) : filteredFaqs.length === 0 ? (
              <div className="text-center py-12 text-gray-500">No FAQs found for this category.</div>
            ) : (
              filteredFaqs.map((item) => (
                <div 
                  key={item.id}
                  className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-blue-100/40 overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5"
                >
                  <button
                    onClick={() => toggleItem(item.id)}
                    className="w-full px-6 py-5 text-left flex items-center justify-between hover:bg-blue-50/50"
                  >
                    <span className="text-lg font-semibold text-gray-900 pr-4">
                      {item.question}
                    </span>
                    <div 
                      className={`flex-shrink-0 transition-transform duration-300 ${openItems.includes(item.id) ? 'rotate-180' : ''}`}
                    >
                      <ChevronDown className="w-5 h-5 text-blue-600" />
                    </div>
                  </button>
                  
                  <AnimatePresence initial={false}>
                    {openItems.includes(item.id) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="px-6 pb-6 pt-2 border-t border-gray-100">
                          <p className="text-gray-600 leading-relaxed">
                            {item.answer}
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))
            )}
          </div>

          {/* Support CTA */}
          <div className="mt-16 text-center bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-blue-100/40 p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Still have questions?
            </h3>
            <p className="text-gray-600 mb-6">
              Can't find the answers you're looking for? Contact our support team.
            </p>
            <a
              href="mailto:connect@sponsorstudio.in"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 transform hover:scale-105"
            >
              <Mail className="w-4 h-4 mr-2" />
              Contact Support
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
