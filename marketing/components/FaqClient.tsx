'use client';

import React, { useState } from 'react';
import { Mail, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import type { Faq } from '../lib/data';

export default function FaqClient({ faqs }: { faqs: Faq[] }) {
  const [activeTab, setActiveTab] = useState<'brand' | 'organizer'>('brand');
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (id: number) => {
    setOpenItems(prev => prev.includes(id) ? [] : [id]);
  };

  const filteredFaqs = faqs.filter(faq => faq.is_brand === (activeTab === 'brand'));

  const tabs = [
    { id: 'brand' as const, label: 'For brands' },
    { id: 'organizer' as const, label: 'For organisers' },
  ];

  return (
    <div className="container-page py-14 lg:py-20">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="lg:col-span-4">
          <div className="lg:sticky lg:top-[calc(var(--nav-height)+2rem)]">
            <h1 className="text-5xl text-text-primary sm:text-6xl">
              Questions, <span className="italic">answered.</span>
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-text-secondary">
              How credits, listings, matches and payouts work on Sponsor Studio.
            </p>

            <div role="tablist" aria-label="Questions for" className="mt-8 inline-flex rounded-xl border border-border bg-surface p-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  onClick={() => {
                    setActiveTab(tab.id);
                    setOpenItems([]);
                  }}
                  className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                    activeTab === tab.id ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="mt-10 hidden rounded-card bg-navy p-6 text-white lg:block">
              <p className="font-display text-2xl">Still have a question?</p>
              <p className="mt-1 text-sm text-white/70">Email the team and we&apos;ll help you out.</p>
              <a
                href="mailto:connect@sponsorstudio.in"
                className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-white underline underline-offset-4"
              >
                <Mail className="h-4 w-4" />
                connect@sponsorstudio.in
              </a>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8" role="tabpanel">
          {filteredFaqs.length === 0 ? (
            <p className="py-12 text-text-secondary">No questions in this category yet.</p>
          ) : (
            <ul className="border-t border-border">
              {filteredFaqs.map((item) => {
                const open = openItems.includes(item.id);
                return (
                  <li key={item.id} className="border-b border-border">
                    <button
                      type="button"
                      onClick={() => toggleItem(item.id)}
                      aria-expanded={open}
                      aria-controls={`faq-${item.id}`}
                      className="flex w-full items-start justify-between gap-6 py-6 text-left"
                    >
                      <span className="text-lg font-medium text-text-primary">{item.question}</span>
                      <Plus
                        className={`mt-1 h-5 w-5 shrink-0 text-text-muted transition-transform duration-300 ease-out-expo ${open ? 'rotate-45' : ''}`}
                      />
                    </button>
                    <AnimatePresence initial={false}>
                      {open && (
                        <motion.div
                          id={`faq-${item.id}`}
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                          className="overflow-hidden"
                        >
                          <p className="max-w-2xl pb-6 leading-relaxed text-text-secondary">{item.answer}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="mt-10 rounded-card bg-navy p-6 text-white lg:hidden">
            <p className="font-display text-2xl">Still have a question?</p>
            <a
              href="mailto:connect@sponsorstudio.in"
              className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-white underline underline-offset-4"
            >
              <Mail className="h-4 w-4" />
              connect@sponsorstudio.in
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
