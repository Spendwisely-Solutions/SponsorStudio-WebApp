'use client';

import { motion } from 'framer-motion';

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  /** Vertical distance in px the element travels as it fades in. */
  y?: number;
  as?: 'div' | 'li' | 'section' | 'article';
};

/** Fades and lifts content in once, the first time it scrolls into view. */
export default function Reveal({ children, className, delay = 0, y = 16, as = 'div' }: RevealProps) {
  const Component = motion[as];
  return (
    <Component
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </Component>
  );
}
