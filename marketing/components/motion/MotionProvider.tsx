'use client';

import { MotionConfig } from 'framer-motion';

export const EASE_OUT_EXPO = [0.22, 1, 0.36, 1] as const;

/**
 * One easing curve for the whole site, and Motion animations are skipped
 * automatically for visitors who have "reduce motion" turned on.
 */
export default function MotionProvider({ children }: { children: React.ReactNode }) {
  return (
    <MotionConfig reducedMotion="user" transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}>
      {children}
    </MotionConfig>
  );
}
