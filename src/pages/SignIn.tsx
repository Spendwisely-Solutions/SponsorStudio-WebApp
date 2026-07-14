import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Eye, EyeOff, Smartphone, Sparkles, FileText, ArrowLeft, ArrowRight } from 'lucide-react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { signIn, signUp } from '../lib/auth';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export default function SignIn() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Read optional initial parameters from URL query params
  const initialMode = searchParams.get('mode') === 'signup';
  const initialRole = searchParams.get('type') === 'organizer' ? 'event_organizer' : 'brand';

  const [isSignUp, setIsSignUp] = useState(initialMode);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [role, setRole] = useState<'brand' | 'event_organizer'>(initialRole);
  
  // Form fields state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState(''); // Contact Person Name
  const [companyName, setCompanyName] = useState(''); // Company / Organization Name
  const [phoneNumber, setPhoneNumber] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  // Force Light Mode theme at the document root level while on the Sign In page
  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = root.classList.contains('dark');
    
    // Switch to light mode
    root.classList.remove('dark');
    root.setAttribute('data-theme', 'light');
    root.style.colorScheme = 'light';
    
    return () => {
      // Restore previous theme state on unmount
      if (isDark) {
        root.classList.add('dark');
        root.setAttribute('data-theme', 'dark');
        root.style.colorScheme = 'dark';
      }
    };
  }, []);

  // Sync state if search params change
  useEffect(() => {
    setIsSignUp(searchParams.get('mode') === 'signup');
    setRole(searchParams.get('type') === 'organizer' ? 'event_organizer' : 'brand');
  }, [searchParams]);

  // Reset all fields when switching modes
  const resetForm = () => {
    setIsForgotPassword(false);
    setResetEmailSent(false);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setCompanyName('');
    setPhoneNumber('');
    setError('');
  };

  async function handleSignInSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError('Please enter a valid email address');
        toast.error('Please enter a valid email address');
        return;
      }
      if (!password || password.length < 6) {
        setError('Password must be at least 6 characters long');
        toast.error('Password must be at least 6 characters long');
        return;
      }

      await signIn(email, password);
      toast.success('Welcome back!');
      navigate('/dashboard');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during sign in';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  async function handleSignUpSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError('Please enter a valid email address');
        toast.error('Please enter a valid email address');
        return;
      }
      if (!password || password.length < 6) {
        setError('Password must be at least 6 characters long');
        toast.error('Password must be at least 6 characters long');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        toast.error('Passwords do not match');
        return;
      }
      if (!name) {
        setError('Please enter your contact name');
        toast.error('Please enter your contact name');
        return;
      }
      const finalOrgName = companyName || name;
      if (!finalOrgName) {
        setError('Please enter a company/organization name');
        toast.error('Please enter a company/organization name');
        return;
      }
      if (!phoneNumber || !/^\+[1-9]{1}[0-9]{3,14}$/.test(phoneNumber)) {
        setError('Please enter a valid phone number in international format (e.g., +919876543210)');
        toast.error('Please enter a valid phone number in international format');
        return;
      }

      await signUp(email, password, role, phoneNumber, finalOrgName);
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during sign up';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError('Please enter a valid email address');
        toast.error('Please enter a valid email address');
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setError(error.message);
        toast.error(error.message);
        return;
      }

      setResetEmailSent(true);
      toast.success('Password reset email sent! Please check your inbox.');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during password reset';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F8FAFC] text-[#1E293B] overflow-x-hidden font-sans">
      {/* Left Pane - Branding & Features (Solid Royal Blue Background) */}
      <div 
        className="relative w-full md:w-[40%] xl:w-[35%] text-white p-8 md:p-12 lg:p-16 flex flex-col justify-start pt-12 md:pt-20 lg:pt-24 min-h-[380px] md:min-h-screen z-10"
        style={{ backgroundColor: '#1E56A0', color: '#ffffff' }}
      >
        {/* Animated grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.08] pointer-events-none"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255, 255, 255, 0.2) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255, 255, 255, 0.2) 1px, transparent 1px)
            `,
            backgroundSize: '40px 40px',
          }}
        />

        {/* Glow decoration */}
        <div className="absolute top-1/4 right-0 w-48 h-48 rounded-full bg-white/10 blur-[50px] pointer-events-none" />
        <div className="absolute bottom-1/4 left-0 w-64 h-64 rounded-full bg-white/5 blur-[70px] pointer-events-none" />

        <div className="relative z-20 space-y-12 md:space-y-16">
          {/* Logo & Headline */}
          <div className="space-y-4">
            <Link to="/" className="inline-block transition-transform hover:scale-105">
              <img
                src="https://i.ibb.co/ZzPfwrxP/logo-final-png.png"
                alt="Sponsor Studio"
                className="h-16 md:h-20 w-auto"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
            </Link>
            <h1 className="text-3xl lg:text-4xl font-black tracking-tight leading-tight font-serif">
              Sponsor Studio
            </h1>
            <p className="text-blue-100 text-sm md:text-base font-medium leading-relaxed max-w-sm">
              India's first AI-powered sponsorship marketplace — connecting brands with the right events.
            </p>
          </div>

          {/* Features Checklists */}
          <div className="space-y-6 lg:space-y-8">
            {/* Feature 1 */}
            <div className="flex items-start gap-4 group">
              <div className="p-3 bg-white/15 border border-white/20 rounded-2xl text-white shadow-md group-hover:scale-115 transition-transform duration-300">
                <Smartphone className="w-5 h-5 text-cyan-300" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-base text-white tracking-wide">Swipe to discover</h3>
                <p className="text-blue-100 text-sm leading-relaxed font-medium">
                  Browse events and express interest in one tap
                </p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-start gap-4 group">
              <div className="p-3 bg-white/15 border border-white/20 rounded-2xl text-white shadow-md group-hover:scale-115 transition-transform duration-300">
                <Sparkles className="w-5 h-5 text-cyan-300" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-base text-white tracking-wide">AI-powered insights</h3>
                <p className="text-blue-100 text-sm leading-relaxed font-medium">
                  Risk analysis and post-event reports, automatically
                </p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-start gap-4 group">
              <div className="p-3 bg-white/15 border border-white/20 rounded-2xl text-white shadow-md group-hover:scale-115 transition-transform duration-300">
                <FileText className="w-5 h-5 text-cyan-300" />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-base text-white tracking-wide">Sign contracts digitally</h3>
                <p className="text-blue-100 text-sm leading-relaxed font-medium">
                  Everything from match to deal — in one place
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Pane - Form Card (Always Light Mode styling) */}
      <div className="w-full md:w-[60%] xl:w-[65%] flex items-center justify-center p-6 md:p-12 lg:p-16 bg-[#F8FAFC] relative z-20 min-h-screen">
        <div className="w-full max-w-md space-y-8 bg-white border border-gray-200 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] p-8 relative overflow-hidden transition-all duration-300">
          
          {/* Top subtle blue line */}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-40 h-1 rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 shadow-sm" />

          {/* Form Header */}
          <div className="space-y-2 text-center">
            <h2 className="text-3xl font-extrabold text-[#0A1628] tracking-tight">
              {isForgotPassword ? 'Reset Password' : isSignUp ? 'Create a free account' : 'Welcome back'}
            </h2>
            <p className="text-sm text-gray-500 font-semibold">
              {isForgotPassword
                ? 'Enter your email to receive a password reset link'
                : isSignUp
                ? 'Join Sponsor Studio to connect with premium opportunities'
                : 'Sign in to your Sponsor Studio account'}
            </p>
          </div>

          {/* Forgot Password Flow */}
          {isForgotPassword ? (
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-6">
              {resetEmailSent ? (
                <div className="text-center space-y-4">
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm font-semibold">
                    A password reset link has been sent to <strong className="break-all text-emerald-800">{email}</strong>. Please check your inbox (and spam folder).
                  </div>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="text-sm text-[#1E56A0] hover:underline font-bold"
                    disabled={loading}
                  >
                    Back to Sign In
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-bold text-gray-700 tracking-wide">
                      Email address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#1E293B] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E56A0]/20 focus:border-[#1E56A0] transition-all font-medium placeholder-gray-400"
                      required
                      disabled={loading}
                    />
                  </div>

                  {error && <div className="text-red-500 text-xs font-semibold">{error}</div>}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-[#1E56A0] text-white font-bold text-sm shadow-md hover:opacity-95 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    {loading ? 'Please wait...' : 'Send Reset Link'}
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="text-sm text-[#1E56A0] hover:underline font-bold transition-colors duration-200"
                      disabled={loading}
                    >
                      Back to Sign In
                    </button>
                  </div>
                </>
              )}
            </form>
          ) : (
            // Unified Sign In / Sign Up Form
            <form onSubmit={isSignUp ? handleSignUpSubmit : handleSignInSubmit} className="space-y-5">
              
              {/* Segmented control for Role/UserType Selection (Only visible for new user sign up) */}
              {isSignUp && (
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-gray-400 tracking-wider uppercase">
                    Account Type
                  </label>
                  <div className="grid grid-cols-2 p-1 bg-[#F1F5F9] rounded-xl border border-gray-200/80">
                    <button
                      type="button"
                      onClick={() => setRole('brand')}
                      className={`py-2 text-xs lg:text-sm font-bold rounded-lg transition-all duration-300 ${
                        role === 'brand'
                          ? 'bg-white text-[#1E56A0] shadow-sm'
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      I'm a Brand
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('event_organizer')}
                      className={`py-2 text-xs lg:text-sm font-bold rounded-lg transition-all duration-300 ${
                        role === 'event_organizer'
                          ? 'bg-white text-[#1E56A0] shadow-sm'
                          : 'text-gray-500 hover:text-gray-800'
                      }`}
                    >
                      I Organise Events
                    </button>
                  </div>
                </div>
              )}

              {/* Labeled Inputs */}
              <div className="space-y-4">
                
                {/* 1. Contact Person Name (Required for Sign Up) */}
                {isSignUp && (
                  <div className="space-y-1.5">
                    <label htmlFor="name" className="block text-sm font-bold text-gray-700 tracking-wide">
                      Contact Person Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#1E293B] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E56A0]/20 focus:border-[#1E56A0] transition-all font-medium placeholder-gray-400"
                      required
                      disabled={loading}
                    />
                  </div>
                )}

                {/* 2. Company / Organization Name (Required for Sign Up) */}
                {isSignUp && (
                  <div className="space-y-1.5">
                    <label htmlFor="companyName" className="block text-sm font-bold text-gray-700 tracking-wide">
                      {role === 'brand' ? 'Company / Brand name' : 'Organization name'}
                    </label>
                    <input
                      id="companyName"
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder={role === 'brand' ? 'e.g. Tata Beverages' : 'e.g. TedX Mumbai'}
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#1E293B] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E56A0]/20 focus:border-[#1E56A0] transition-all font-medium placeholder-gray-400"
                      required
                      disabled={loading}
                    />
                  </div>
                )}

                {/* 3. Work Email */}
                <div className="space-y-1.5">
                  <label htmlFor="email" className="block text-sm font-bold text-gray-700 tracking-wide">
                    Work email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#1E293B] rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E56A0]/20 focus:border-[#1E56A0] transition-all font-medium placeholder-gray-400"
                    required
                    disabled={loading}
                  />
                </div>

                {/* 4. Phone Number (Required for Sign Up) */}
                {isSignUp && (
                  <div className="space-y-1.5">
                    <label htmlFor="phoneNumber" className="block text-sm font-bold text-gray-700 tracking-wide">
                      Phone Number
                    </label>
                    <div className="custom-phone-container">
                      <PhoneInput
                        id="phoneNumber"
                        international
                        countryCallingCodeEditable={false}
                        defaultCountry="IN"
                        value={phoneNumber}
                        onChange={value => setPhoneNumber(value || "")}
                        placeholder="+91 98765 43210"
                        className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#1E293B] rounded-xl px-4 py-3 text-sm focus-within:ring-2 focus-within:ring-[#1E56A0]/20 focus-within:border-[#1E56A0] transition-all font-medium outline-none"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>
                )}

                {/* 5. Password */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label htmlFor="password" className="block text-sm font-bold text-gray-700 tracking-wide">
                      Password
                    </label>
                    {!isSignUp && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsForgotPassword(true);
                          setError('');
                        }}
                        className="text-xs text-[#1E56A0] hover:underline font-bold"
                        disabled={loading}
                      >
                        Forgot Password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#1E293B] rounded-xl pl-4 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E56A0]/20 focus:border-[#1E56A0] transition-all font-medium placeholder-gray-400"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                      disabled={loading}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* 6. Confirm Password (Required for Sign Up) */}
                {isSignUp && (
                  <div className="space-y-1.5">
                    <label htmlFor="confirmPassword" className="block text-sm font-bold text-gray-700 tracking-wide">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#F8FAFC] border border-[#E2E8F0] text-[#1E293B] rounded-xl pl-4 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#1E56A0]/20 focus:border-[#1E56A0] transition-all font-medium placeholder-gray-400"
                        required
                        disabled={loading}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={loading}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}

              </div>

              {/* Error messages */}
              {error && <div className="text-red-500 text-xs font-bold leading-tight">{error}</div>}

              {/* Submit CTA Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-400 to-[#1E56A0] hover:opacity-95 text-white font-bold text-sm shadow-[0_4px_14px_rgba(30,86,160,0.25)] focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 transform active:scale-95"
              >
                {loading ? (
                  <span>Please wait...</span>
                ) : (
                  <>
                    <span>{isSignUp ? 'Sign Up' : 'Sign In'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Toggle Switch Sign-in / Sign-up state */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setError('');
                  }}
                  className="text-sm text-gray-500 font-bold"
                  disabled={loading}
                >
                  {isSignUp ? (
                    <span>
                      Already have an account?{' '}
                      <span className="text-[#1E56A0] hover:underline">Sign in</span>
                    </span>
                  ) : (
                    <span>
                      New here?{' '}
                      <span className="text-[#1E56A0] hover:underline">Create a free account</span>
                    </span>
                  )}
                </button>
              </div>

              {/* Contact Support */}
              <div className="text-center text-xs text-gray-400 pt-3 border-t border-gray-100">
                Having trouble?{' '}
                <a href="mailto:support@sponsorstudio.in" className="text-[#1E56A0] hover:underline font-bold">
                  Contact support
                </a>
              </div>

            </form>
          )}
        </div>
      </div>
      
      {/* Inline styles for PhoneInput override to match theme perfectly */}
      <style>{`
        .custom-phone-container .PhoneInputInput {
          background: transparent !important;
          border: none !important;
          outline: none !important;
          box-shadow: none !important;
          color: #1E293B !important;
          font-weight: 500 !important;
          font-size: 0.875rem !important;
          padding: 0 !important;
          margin-left: 0.5rem !important;
        }
        .custom-phone-container .PhoneInputCountrySelect {
          background: transparent !important;
          color: #1E293B !important;
          border: none !important;
          outline: none !important;
        }
        .custom-phone-container .PhoneInputCountrySelectArrow {
          color: #9ca3af;
        }
      `}</style>
    </div>
  );
}
