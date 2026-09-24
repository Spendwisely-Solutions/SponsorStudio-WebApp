import React from 'react';
import Reveal from '../motion/Reveal';

type PageHeaderProps = {
  title: React.ReactNode;
  description: React.ReactNode;
  actions?: React.ReactNode;
};

/** The h1 block at the top of a dedicated page. */
export default function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <header className="container-page pb-16 pt-14 lg:pb-20 lg:pt-20">
      <Reveal className="max-w-3xl">
        <h1 className="text-5xl text-text-primary sm:text-6xl lg:text-7xl">{title}</h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-text-secondary sm:text-xl">{description}</p>
        {actions && <div className="mt-9 flex flex-col gap-3 sm:flex-row">{actions}</div>}
      </Reveal>
    </header>
  );
}
