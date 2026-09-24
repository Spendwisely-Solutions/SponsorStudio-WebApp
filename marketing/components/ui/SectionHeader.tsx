import React from 'react';
import Reveal from '../motion/Reveal';

type SectionHeaderProps = {
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: 'left' | 'center';
  /** Use "dark" inside navy sections. */
  tone?: 'light' | 'dark';
  className?: string;
};

/** Serif heading + supporting line, shared by every landing section. */
export default function SectionHeader({ title, description, align = 'left', tone = 'light', className = '' }: SectionHeaderProps) {
  const centered = align === 'center';
  const dark = tone === 'dark';
  return (
    <Reveal className={`${centered ? 'mx-auto text-center' : ''} max-w-3xl ${className}`}>
      <h2 className={`text-4xl sm:text-5xl ${dark ? 'text-white' : 'text-text-primary'}`}>{title}</h2>
      {description && (
        <p
          className={`mt-5 text-lg leading-relaxed ${dark ? 'text-white/70' : 'text-text-secondary'} ${
            centered ? 'mx-auto max-w-2xl' : 'max-w-2xl'
          }`}
        >
          {description}
        </p>
      )}
    </Reveal>
  );
}
