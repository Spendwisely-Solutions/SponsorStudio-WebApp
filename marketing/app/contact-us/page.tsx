'use client';

import { useState } from 'react';
import { Check, Copy, Mail, MapPin } from 'lucide-react';
import ContactForm from '../../components/HomePage/ContactForm';
import type { FormData } from '../../components/HomePage/Home';
import { CONTACT_EMAIL } from '../../lib/site';

const ADDRESS = 'Heavenly Plaza, Vazhakkala, Kakkanad, Ernakulam, Kerala 682021, India';
// Address-based embed; unlike the old "pb=" URL it needs no API key and cannot go stale.
const MAP_SRC = `https://maps.google.com/maps?q=${encodeURIComponent(ADDRESS)}&z=15&output=embed`;

export default function ContactUsPage() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    message: '',
    organization_type: '',
  });
  const [showThankYou, setShowThankYou] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(ADDRESS);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy address:', err);
    }
  };

  return (
    <div className="container-page py-14 lg:py-20">
      <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
        <div className="rounded-card bg-navy p-8 text-white sm:p-10 lg:col-span-5">
          <h1 className="text-5xl text-white sm:text-6xl">
            Talk to <span className="italic">the team.</span>
          </h1>
          <p className="mt-5 text-lg leading-relaxed text-white/70">
            Questions about listing an event, buying credits or a partnership you&apos;re planning? Send us a note and
            a real person will get back to you.
          </p>

          <dl className="mt-10 divide-y divide-white/15 border-y border-white/15">
            <div className="flex gap-4 py-5">
              <Mail className="mt-0.5 h-5 w-5 shrink-0 text-white/70" />
              <div>
                <dt className="text-sm font-medium text-white">Email</dt>
                <dd className="mt-1 text-sm text-white/70">
                  <a href={`mailto:${CONTACT_EMAIL}`} className="underline underline-offset-4 hover:text-white">
                    {CONTACT_EMAIL}
                  </a>
                </dd>
              </div>
            </div>
            <div className="flex gap-4 py-5">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-white/70" />
              <div>
                <dt className="text-sm font-medium text-white">Office</dt>
                <dd className="mt-1 text-sm leading-relaxed text-white/70">
                  Heavenly Plaza, Vazhakkala
                  <br />
                  Kakkanad, Ernakulam, Kerala 682021
                </dd>
                <button
                  type="button"
                  onClick={copyAddress}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-white/70 hover:text-white"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied ? 'Copied' : 'Copy address'}
                </button>
              </div>
            </div>
          </dl>
        </div>

        <div className="lg:col-span-7">
          <ContactForm
            formData={formData}
            setFormData={setFormData}
            showThankYou={showThankYou}
            setShowThankYou={setShowThankYou}
            disableAnimations
          />
        </div>
      </div>

      <div className="mt-16 overflow-hidden rounded-card border border-border bg-background-secondary">
        <iframe
          src={MAP_SRC}
          title="Map showing the Sponsor Studio office in Kakkanad, Kochi"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="h-[360px] w-full border-0 grayscale-[30%]"
        />
      </div>
    </div>
  );
}
