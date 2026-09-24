'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Smartphone, FileText, CheckCircle2, ArrowRight, ArrowLeft, ArrowUpRight } from 'lucide-react';
import { CONSULTATION_URL } from '../lib/site';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { supabase } from '../lib/supabaseClient';
import { sendDemoRequestEmail } from '../lib/email';
import toast from 'react-hot-toast';

interface ClientLogo {
  id: string;
  name: string;
  logo_url: string;
  trusted_by_order?: number;
}

export default function BookDemoClient() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [clientLogos, setClientLogos] = useState<ClientLogo[]>([]);
  const [logosLoading, setLogosLoading] = useState(true);

  // Form state
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [role, setRole] = useState<'brand' | 'event_organizer' | 'agency' | ''>('');
  const [budget, setBudget] = useState('');
  const [message, setMessage] = useState('');

  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://app.sponsorstudio.in';

  // Fetch client logos for social proof
  useEffect(() => {
    async function fetchLogos() {
      try {
        const { data, error } = await supabase
          .from('client_logos')
          .select('*');
        if (error) throw error;
        if (data) {
          // Sort and slice top 6 for layout
          const filtered = data
            .filter((logo: any) => logo.trusted_by_order && logo.trusted_by_order > 0)
            .sort((a: any, b: any) => (a.trusted_by_order || 0) - (b.trusted_by_order || 0))
            .slice(0, 6);
          setClientLogos(filtered.length > 0 ? filtered : data.slice(0, 6));
        }
      } catch (err) {
        console.error('Error fetching client logos:', err);
      } finally {
        setLogosLoading(false);
      }
    }
    fetchLogos();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }
    if (!phone) {
      toast.error('Please enter your phone number');
      return;
    }
    if (!companyName.trim()) {
      toast.error('Please enter your company/organization name');
      return;
    }
    if (!role) {
      toast.error('Please select your role');
      return;
    }

    setLoading(true);
    try {
      const success = await sendDemoRequestEmail({
        name,
        email,
        phone,
        jobTitle,
        companyName,
        role,
        budget,
        message,
      });

      if (success) {
        setIsSuccess(true);
      }
    } catch (err) {
      console.error('Error during demo request submission:', err);
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col text-ink overflow-x-hidden relative font-sans">
      <div className="container-page flex-1 flex flex-col lg:flex-row py-14 lg:py-20 gap-12 lg:gap-16 relative z-10">
        {/* Left Section - Strategic Pitch & Social Proof */}
        <div className="flex-1 flex flex-col justify-center space-y-8 lg:pr-6">
          <div className="space-y-4">
            <h1 className="text-5xl sm:text-6xl text-ink">
              See Sponsor Studio <span className="italic">in action.</span>
            </h1>
            <p className="text-text-secondary text-lg max-w-xl leading-relaxed">
              Get a walkthrough of the marketplace with our team, and talk through the events, creators or outdoor media that fit your goals.
            </p>
          </div>

          {/* Benefits Bullet Points */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-surface border border-border rounded-lg text-brand-600">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-base text-ink">Campaign strategy</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Bespoke, ROI-driven matching aligned directly with your brand goals and audience profiles.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-surface border border-border rounded-lg text-brand-600">
                <Smartphone className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-base text-ink">Verified marketplace</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Discover verified event opportunities and vet target demographic metrics instantly.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-surface border border-border rounded-lg text-brand-600">
                <FileText className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-base text-ink">End-to-end execution</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Move from first conversation to signed deal with our team handling the paperwork and follow-through.
                </p>
              </div>
            </div>
          </div>

          {/* The paid consultation lives on its own site */}
          <div className="rounded-card border border-border bg-surface p-5">
            <p className="text-sm font-medium text-text-primary">Need a deeper strategy session?</p>
            <p className="mt-1 text-sm text-text-secondary">
              Book a 1-hour sponsorship strategy consultation with our team for ₹5,000 + GST.
            </p>
            <a
              href={CONSULTATION_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-brand-700 underline-offset-4 hover:underline"
            >
              Book a consultation <ArrowUpRight className="h-4 w-4" />
            </a>
          </div>

          {/* Social Proof logos */}
          <div className="pt-8 border-t border-gray-200">
            <p className="text-sm text-text-secondary mb-4">
              Trusted by brands and organisers across India
            </p>
            {logosLoading ? (
              <div className="flex gap-4">
                {Array(4).fill(0).map((_, i) => (
                  <div key={i} className="h-8 w-16 bg-gray-200 animate-pulse rounded" />
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-6 items-center">
                {clientLogos.map((logo) => (
                  <img
                    key={logo.id}
                    src={logo.logo_url}
                    alt={logo.name}
                    className="h-7 sm:h-8 object-contain max-w-[90px] opacity-90 hover:opacity-100 transition-opacity duration-300"
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Section - Glassmorphic / Premium White Card */}
        <div className="w-full lg:w-[460px] shrink-0">
          <div className="bg-surface border border-border rounded-card shadow-pop p-6 sm:p-8 relative overflow-hidden">
            
            {isSuccess ? (
              <div className="text-center py-10 flex flex-col items-center space-y-6">
                <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-success" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-semibold text-ink">Demo Requested!</h3>
                  <p className="text-sm text-gray-600 leading-relaxed px-2">
                    Thank you, <strong className="text-ink">{name}</strong>. We have received your demo request for <span className="font-semibold text-ink">{companyName}</span>.
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    Our strategy team will contact you at <span className="underline">{email}</span> within 24 hours to schedule your walkthrough.
                  </p>
                </div>
                <button
                  onClick={() => setIsSuccess(false)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors text-gray-700 font-sans"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Submit another request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-1">
                  <h2 className="text-2xl text-ink">Book my free strategy & demo tour</h2>
                  <p className="text-xs text-gray-500">Fill out the form below and we will schedule a live walk-through.</p>
                </div>

                <div className="space-y-4">
                  {/* Work Email */}
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Work Email *
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="w-full bg-surface border border-border text-ink rounded-[10px] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600 transition-all font-medium placeholder-gray-400"
                      required
                      disabled={loading}
                    />
                  </div>

                  {/* Name */}
                  <div className="space-y-1.5">
                    <label htmlFor="name" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Your Name *
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full bg-surface border border-border text-ink rounded-[10px] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600 transition-all font-medium placeholder-gray-400"
                      required
                      disabled={loading}
                    />
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-1.5 custom-phone-container">
                    <label htmlFor="phone" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Phone Number *
                    </label>
                    <PhoneInput
                      id="phone"
                      international
                      countryCallingCodeEditable={false}
                      defaultCountry="IN"
                      value={phone}
                      onChange={val => setPhone(val || "")}
                      placeholder="+91 98765 43210"
                      className="w-full bg-surface border border-border text-ink rounded-[10px] px-4 py-3 text-sm focus-within:ring-2 focus-within:ring-brand-600/20 focus-within:border-brand-600 transition-all font-medium outline-none"
                      required
                      disabled={loading}
                    />
                  </div>

                  {/* Job Title */}
                  <div className="space-y-1.5">
                    <label htmlFor="jobTitle" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Job Title
                    </label>
                    <input
                      id="jobTitle"
                      type="text"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      placeholder="e.g. Marketing Lead"
                      className="w-full bg-surface border border-border text-ink rounded-[10px] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600 transition-all font-medium placeholder-gray-400"
                      disabled={loading}
                    />
                  </div>

                  {/* Company Name */}
                  <div className="space-y-1.5">
                    <label htmlFor="companyName" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Company / Organization *
                    </label>
                    <input
                      id="companyName"
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Acme Corp."
                      className="w-full bg-surface border border-border text-ink rounded-[10px] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600 transition-all font-medium placeholder-gray-400"
                      required
                      disabled={loading}
                    />
                  </div>

                  {/* What best describes you? */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      What best describes you? *
                    </label>
                    <div className="grid grid-cols-3 p-1 bg-background-secondary border border-border rounded-[10px] gap-1">
                      <button
                        type="button"
                        onClick={() => setRole('brand')}
                        className={`py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
                          role === 'brand'
                            ? 'bg-brand-600 text-white shadow-sm'
                            : 'text-gray-500 hover:text-ink'
                        }`}
                      >
                        Brand
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole('event_organizer')}
                        className={`py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
                          role === 'event_organizer'
                            ? 'bg-brand-600 text-white shadow-sm'
                            : 'text-gray-500 hover:text-ink'
                        }`}
                      >
                        Organizer
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole('agency')}
                        className={`py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
                          role === 'agency'
                            ? 'bg-brand-600 text-white shadow-sm'
                            : 'text-gray-500 hover:text-ink'
                        }`}
                      >
                        Agency
                      </button>
                    </div>
                  </div>

                  {/* Annual Budget Range */}
                  <div className="space-y-1.5">
                    <label htmlFor="budget" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Estimated Annual Budget / Revenue
                    </label>
                    <select
                      id="budget"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      className="w-full bg-surface border border-border text-ink rounded-[10px] px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600 transition-all font-medium outline-none"
                      disabled={loading}
                    >
                      <option value="">Select range</option>
                      <option value="under_5l">Under ₹5 Lakhs</option>
                      <option value="5l_to_20l">₹5 Lakhs - ₹20 Lakhs</option>
                      <option value="20l_to_1cr">₹20 Lakhs - ₹1 Crore</option>
                      <option value="over_1cr">Over ₹1 Crore</option>
                    </select>
                  </div>

                  {/* Message Notes */}
                  <div className="space-y-1.5">
                    <label htmlFor="message" className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      Tell us about your upcoming plans or goals
                    </label>
                    <textarea
                      id="message"
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Describe any upcoming campaign ideas or events..."
                      className="w-full bg-surface border border-border text-ink rounded-[10px] p-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-600/20 focus:border-brand-600 transition-all font-medium placeholder-gray-400 resize-none"
                      disabled={loading}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3.5 px-4 rounded-[10px] bg-primary hover:bg-primary-hover text-white font-medium text-sm focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 transform active:scale-95"
                >
                  {loading ? (
                    <span>Scheduling...</span>
                  ) : (
                    <>
                      <span>Book my free strategy & demo tour</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Styled phone number custom fields */}
      <style>{`
        .custom-phone-container .PhoneInputInput {
          background: transparent !important;
          border: none !important;
          outline: none !important;
          box-shadow: none !important;
          color: var(--color-ink) !important;
          font-weight: 500 !important;
          font-size: 0.875rem !important;
          padding: 0 !important;
          margin-left: 0.5rem !important;
        }
        .custom-phone-container .PhoneInputInput::placeholder {
          color: #9ca3af !important;
        }
        .custom-phone-container .PhoneInputCountrySelect {
          background: transparent !important;
          color: var(--color-ink) !important;
          border: none !important;
          outline: none !important;
        }
        .custom-phone-container .PhoneInputCountrySelectArrow {
          color: #9ca3af;
        }
        .custom-phone-container .PhoneInputCountryIcon--border {
          background-color: transparent !important;
          box-shadow: none !important;
        }
      `}</style>

    </div>
  );
}
