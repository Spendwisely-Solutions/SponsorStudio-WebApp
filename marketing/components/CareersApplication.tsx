'use client';

import React, { useState } from 'react';
import { Check } from 'lucide-react';
import Button from './ui/Button';
import { sendJobApplication } from '../lib/email';
import { CONTACT_EMAIL } from '../lib/site';

const fieldClass =
  'mt-2 block w-full rounded-lg border border-border bg-surface px-4 py-3 text-text-primary placeholder:text-text-muted transition-colors focus:border-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-600/15';

export default function CareersApplication({ roles }: { roles: { id: string; title: string }[] }) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const get = (key: string) => String(data.get(key) ?? '').trim();
    setStatus('sending');
    try {
      await sendJobApplication({
        role: get('role'),
        name: get('name'),
        email: get('email'),
        phone: get('phone'),
        cvUrl: get('cvUrl'),
        note: get('note'),
      });
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return (
      <div className="rounded-card border border-border bg-surface p-8 text-center sm:p-10">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand-600 text-white">
          <Check className="h-6 w-6" />
        </span>
        <p className="mt-5 font-display text-3xl text-text-primary">Application received.</p>
        <p className="mt-2 text-text-secondary">Thanks for applying. We&apos;ll be in touch by email if there&apos;s a fit.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="rounded-card border border-border bg-surface p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block text-sm font-medium text-text-secondary sm:col-span-2">
          Role
          <select name="role" required defaultValue={roles[0]?.title} className={fieldClass}>
            {roles.map((role) => (
              <option key={role.id} value={role.title}>
                {role.title}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium text-text-secondary">
          Full name
          <input name="name" required autoComplete="name" className={fieldClass} />
        </label>
        <label className="block text-sm font-medium text-text-secondary">
          Phone
          <input name="phone" type="tel" required autoComplete="tel" className={fieldClass} />
        </label>
        <label className="block text-sm font-medium text-text-secondary sm:col-span-2">
          Email
          <input name="email" type="email" required autoComplete="email" className={fieldClass} />
        </label>
        <label className="block text-sm font-medium text-text-secondary sm:col-span-2">
          Link to your CV or portfolio
          <input
            name="cvUrl"
            type="url"
            required
            placeholder="Google Drive, LinkedIn or portfolio link"
            className={fieldClass}
          />
        </label>
        <label className="block text-sm font-medium text-text-secondary sm:col-span-2">
          Why this role? <span className="font-normal text-text-muted">(optional)</span>
          <textarea name="note" rows={4} className={fieldClass} />
        </label>
      </div>
      {status === 'error' && (
        <p className="mt-4 text-sm text-danger">
          Something went wrong. Please try again, or email your CV to {CONTACT_EMAIL}.
        </p>
      )}
      <Button type="submit" size="lg" className="mt-6 w-full" disabled={status === 'sending'}>
        {status === 'sending' ? 'Sending…' : 'Send application'}
      </Button>
      <p className="mt-4 text-center text-sm text-text-muted">
        Prefer email? Send your CV to{' '}
        <a href={`mailto:${CONTACT_EMAIL}?subject=Job%20application`} className="text-text-primary underline underline-offset-4">
          {CONTACT_EMAIL}
        </a>
        .
      </p>
    </form>
  );
}
