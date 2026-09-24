'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { EASE_OUT_EXPO } from './MotionProvider';

const STORAGE_KEY = 'ss-intro-seen';

/**
 * Runs before first paint (inlined in <head>): marks the intro as done for
 * repeat visits in this session and for reduced-motion visitors, so the CSS
 * rule in globals.css hides the splash without a flash.
 */
export const introScript = `try{if(sessionStorage.getItem('${STORAGE_KEY}')||matchMedia('(prefers-reduced-motion: reduce)').matches){document.documentElement.dataset.intro='done'}}catch(e){}`;

const IntroContext = createContext(true);

/** True once the launch screen has finished (or was skipped). Hero animations wait for it. */
export const useIntroReady = () => useContext(IntroContext);

export function IntroProvider({ children }: { children: React.ReactNode }) {
  // "playing" on the server and first client render, so hydration matches.
  const [phase, setPhase] = useState<'playing' | 'done'>('playing');

  useEffect(() => {
    const root = document.documentElement;
    if (root.dataset.intro === 'done') {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing with the pre-paint script's decision
      setPhase('done');
      return;
    }
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const t = setTimeout(() => {
      try {
        sessionStorage.setItem(STORAGE_KEY, '1');
      } catch {}
      root.dataset.intro = 'done';
      document.body.style.overflow = previousOverflow;
      setPhase('done');
    }, 1250);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <IntroContext.Provider value={phase === 'done'}>
      {children}
      <AnimatePresence>
        {phase === 'playing' && (
          <motion.div
            key="intro"
            aria-hidden="true"
            className="intro-splash fixed inset-0 z-[100] flex items-center justify-center bg-background"
            exit={{ y: '-100%' }}
            transition={{ duration: 0.8, ease: EASE_OUT_EXPO }}
          >
            <div className="flex flex-col items-center">
              <motion.div
                initial={{ opacity: 0, y: 18, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
              >
                <Image src="/logo.png" alt="" width={330} height={218} priority className="h-20 w-auto sm:h-24" />
              </motion.div>
              <div className="mt-8 h-px w-40 overflow-hidden bg-border">
                <motion.div
                  className="h-full origin-left bg-brand-600"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.95, delay: 0.2, ease: EASE_OUT_EXPO }}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </IntroContext.Provider>
  );
}
