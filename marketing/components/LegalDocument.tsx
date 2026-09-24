import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { LEGAL_LAST_UPDATED } from '../lib/legal';

export type LegalSection = { id: string; title: string; content: React.ReactNode };

type LegalDocumentProps = {
  title: string;
  summary: React.ReactNode;
  sections: LegalSection[];
};

/** Layout shared by every Trust Centre document: draft notice, contents, numbered sections. */
export default function LegalDocument({ title, summary, sections }: LegalDocumentProps) {
  return (
    <div className="container-page py-14 lg:py-20">
      <Link href="/legal" className="inline-flex items-center gap-1.5 text-sm text-text-secondary hover:text-text-primary">
        <ArrowLeft className="h-4 w-4" /> Trust Centre
      </Link>

      <header className="mt-8 max-w-3xl">
        <h1 className="text-5xl text-text-primary sm:text-6xl">{title}</h1>
        <p className="mt-4 text-sm text-text-muted">Last updated {LEGAL_LAST_UPDATED}</p>
        <div className="mt-6 rounded-card border border-warning/30 bg-warning/5 p-4 text-sm leading-relaxed text-text-secondary">
          <strong className="text-text-primary">Draft for review.</strong> This document is a working draft. It has not
          yet been reviewed by a lawyer and may change before it takes effect.
        </div>
        <div className="mt-8 text-lg leading-relaxed text-text-secondary">{summary}</div>
      </header>

      <div className="mt-14 grid gap-12 lg:grid-cols-12">
        <nav aria-label="Contents" className="lg:col-span-3">
          <div className="lg:sticky lg:top-[calc(var(--nav-height)+2rem)]">
            <p className="text-sm font-semibold text-text-primary">Contents</p>
            <ol className="mt-4 space-y-2 border-l border-border text-sm">
              {sections.map((section, i) => (
                <li key={section.id}>
                  <a href={`#${section.id}`} className="-ml-px block border-l border-transparent pl-4 text-text-secondary hover:border-text-primary hover:text-text-primary">
                    {i + 1}. {section.title}
                  </a>
                </li>
              ))}
            </ol>
          </div>
        </nav>

        <article className="lg:col-span-8 lg:col-start-5">
          {sections.map((section, i) => (
            <section key={section.id} id={section.id} className="border-t border-border py-10 first:border-t-0 first:pt-0">
              <h2 className="text-2xl text-text-primary sm:text-3xl">
                {i + 1}. {section.title}
              </h2>
              <div className="article mt-5 max-w-none text-base">{section.content}</div>
            </section>
          ))}
        </article>
      </div>
    </div>
  );
}
