'use client';

import React, { useId, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Plus } from 'lucide-react';

export type AccordionItem = { question: string; answer: React.ReactNode };

/** A list of questions where one answer is open at a time. */
export default function Accordion({ items }: { items: AccordionItem[] }) {
  const [open, setOpen] = useState<number | null>(null);
  const id = useId();

  return (
    <ul className="border-t border-border">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <li key={item.question} className="border-b border-border">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : i)}
              aria-expanded={isOpen}
              aria-controls={`${id}-${i}`}
              className="flex w-full items-start justify-between gap-6 py-6 text-left"
            >
              <span className="text-lg font-medium text-text-primary">{item.question}</span>
              <Plus
                className={`mt-1 h-5 w-5 shrink-0 text-text-muted transition-transform duration-300 ease-out-expo ${isOpen ? 'rotate-45' : ''}`}
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`${id}-${i}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="max-w-2xl pb-6 leading-relaxed text-text-secondary">{item.answer}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}
