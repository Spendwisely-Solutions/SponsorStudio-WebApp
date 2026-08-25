'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Calendar, Smartphone, FileText, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { supabase } from '../lib/supabaseClient';
import { sendDemoRequestEmail } from '../lib/email';
import NavBar from './NavBar';
import Footer from './Footer';
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
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-[#F8FAFC] via-[#EDF5FD] to-[#E2EEFC] text-[#0A1628] overflow-x-hidden relative font-sans">
      {/* Soft radial glow background blobs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-[#1E56A0]/8 blur-[100px] pointer-events-none z-0" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#00D4FF]/6 blur-[120px] pointer-events-none z-0" />

      {/* Grid pattern background overlay */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none z-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(30, 86, 160, 0.2) 1px, transparent 1px),
            linear-gradient(90deg, rgba(30, 86, 160, 0.2) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }}
      />

      {/* Navigation Header */}
      <NavBar hideAuthButton={false} />

      <main className="flex-1 flex flex-col lg:flex-row max-w-7xl w-full mx-auto px-6 sm:px-8 lg:px-12 py-36 gap-12 lg:gap-16 relative z-10">
        {/* Left Section - Strategic Pitch & Social Proof */}
        <div className="flex-1 flex flex-col justify-center space-y-8 lg:pr-6">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1E56A0]/10 border border-[#1E56A0]/20 text-[#1E56A0] text-xs font-bold tracking-wide uppercase">
              <Sparkles className="w-4 h-4 text-[#1E56A0]" />
              Sponsorship Discovery & Execution
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tight leading-tight text-[#0A1628]">
              Scale your brand's event sponsorship strategy
            </h1>
            <p className="text-gray-600 text-base sm:text-lg max-w-xl font-medium leading-relaxed">
              Discover how Sponsor Studio combines AI-powered matching with expert campaign strategy to connect brands with high-impact event activations.
            </p>
          </div>

          {/* Benefits Bullet Points */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-white border border-gray-200 rounded-xl text-[#1E56A0] shadow-sm">
                <Calendar className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-base text-[#0A1628]">Campaign Strategy</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Bespoke, ROI-driven matching aligned directly with your brand goals and audience profiles.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-white border border-gray-200 rounded-xl text-[#1E56A0] shadow-sm">
                <Smartphone className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-base text-[#0A1628]">AI-Powered Marketplace</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Discover verified event opportunities and vet target demographic metrics instantly.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-3 bg-white border border-gray-200 rounded-xl text-[#1E56A0] shadow-sm">
                <FileText className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-base text-[#0A1628]">End-to-End Execution</h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  Complete deals seamlessly with secure legal templates, campaign oversight, and digital MOUs.
                </p>
              </div>
            </div>
          </div>

          {/* Social Proof logos */}
          <div className="pt-8 border-t border-gray-200">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">
              Trusted by premium brands and campus events
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
                    className="h-7 sm:h-8 object-contain max-w-[90px] opacity-60 hover:opacity-100 transition-opacity duration-300"
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Section - Glassmorphic / Premium White Card */}
        <div className="w-full lg:w-[460px] shrink-0">
          <div className="bg-white border border-[#1E56A0]/10 rounded-3xl shadow-[0_15px_40px_rgba(30,86,160,0.06)] p-8 relative overflow-hidden transition-all duration-300">
            {/* Top gradient stripe */}
            <div className="absolute -top-1 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-[#1E56A0] to-blue-600" />
            
            {isSuccess ? (
              <div className="text-center py-10 flex flex-col items-center space-y-6">
                <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl font-black text-[#0A1628]">Demo Requested!</h3>
                  <p className="text-sm text-gray-600 leading-relaxed px-2">
                    Thank you, <strong className="text-[#0A1628]">{name}</strong>. We have received your demo request for <span className="font-semibold text-[#0A1628]">{companyName}</span>.
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
                  <h2 className="text-2xl font-black text-[#0A1628]">Book my free strategy & demo tour</h2>
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
                      className="w-full bg-[#F8FAFC] border border-gray-200 text-[#0A1628] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E56A0]/20 focus:border-[#1E56A0] transition-all font-medium placeholder-gray-400"
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
                      className="w-full bg-[#F8FAFC] border border-gray-200 text-[#0A1628] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E56A0]/20 focus:border-[#1E56A0] transition-all font-medium placeholder-gray-400"
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
                      className="w-full bg-[#F8FAFC] border border-gray-200 text-[#0A1628] rounded-xl px-4 py-3 text-sm focus-within:ring-2 focus-within:ring-[#1E56A0]/20 focus-within:border-[#1E56A0] transition-all font-medium outline-none"
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
                      className="w-full bg-[#F8FAFC] border border-gray-200 text-[#0A1628] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E56A0]/20 focus:border-[#1E56A0] transition-all font-medium placeholder-gray-400"
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
                      className="w-full bg-[#F8FAFC] border border-gray-200 text-[#0A1628] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E56A0]/20 focus:border-[#1E56A0] transition-all font-medium placeholder-gray-400"
                      required
                      disabled={loading}
                    />
                  </div>

                  {/* What best describes you? */}
                  <div className="space-y-1.5">
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                      What best describes you? *
                    </label>
                    <div className="grid grid-cols-3 p-1 bg-[#F1F5F9] border border-gray-200 rounded-xl gap-1">
                      <button
                        type="button"
                        onClick={() => setRole('brand')}
                        className={`py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
                          role === 'brand'
                            ? 'bg-[#1E56A0] text-white shadow-sm'
                            : 'text-gray-500 hover:text-[#0A1628]'
                        }`}
                      >
                        Brand
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole('event_organizer')}
                        className={`py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
                          role === 'event_organizer'
                            ? 'bg-[#1E56A0] text-white shadow-sm'
                            : 'text-gray-500 hover:text-[#0A1628]'
                        }`}
                      >
                        Organizer
                      </button>
                      <button
                        type="button"
                        onClick={() => setRole('agency')}
                        className={`py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
                          role === 'agency'
                            ? 'bg-[#1E56A0] text-white shadow-sm'
                            : 'text-gray-500 hover:text-[#0A1628]'
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
                      className="w-full bg-[#F8FAFC] border border-gray-200 text-[#0A1628] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E56A0]/20 focus:border-[#1E56A0] transition-all font-medium outline-none"
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
                      className="w-full bg-[#F8FAFC] border border-gray-200 text-[#0A1628] rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E56A0]/20 focus:border-[#1E56A0] transition-all font-medium placeholder-gray-400 resize-none"
                      disabled={loading}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-[#1E56A0] hover:opacity-95 text-white font-bold text-sm shadow-md focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 transform active:scale-95"
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
      </main>

      {/* Styled phone number custom fields */}
      <style>{`
        .custom-phone-container .PhoneInputInput {
          background: transparent !important;
          border: none !important;
          outline: none !important;
          box-shadow: none !important;
          color: #0A1628 !important;
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
          color: #0A1628 !important;
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

      {/* Footer */}
      <Footer />
    </div>
  );
}
