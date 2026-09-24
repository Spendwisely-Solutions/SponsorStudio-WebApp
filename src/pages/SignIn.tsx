import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Eye,
  EyeOff,
  Smartphone,
  Sparkles,
  FileText,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Building2,
  Users,
  Briefcase,
  User,
  Mail,
  Lock,
} from 'lucide-react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { signIn, signUp } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';

export default function SignIn() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setTheme } = useTheme();

  // Read URL params for mode and initial role
  const initialMode = searchParams.get('mode') === 'signup';
  const initialRole = searchParams.get('type') === 'organizer' ? 'event_organizer' : 'brand';

  const [isSignUp, setIsSignUp] = useState(initialMode);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [role, setRole] = useState<'brand' | 'event_organizer'>(initialRole);

  // Progressive signup step tracker (1 to 4)
  const [step, setStep] = useState(1);

  // Form fields state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  // Force Light Mode on Auth pages
  useEffect(() => {
    setTheme('light');
    const root = window.document.documentElement;
    root.classList.remove('dark');
    root.setAttribute('data-theme', 'light');
    root.style.colorScheme = 'light';
  }, [setTheme]);

  // Sync state if search params change
  useEffect(() => {
    const modeIsSignup = searchParams.get('mode') === 'signup';
    setIsSignUp(modeIsSignup);
    if (modeIsSignup) setStep(1);
    setRole(searchParams.get('type') === 'organizer' ? 'event_organizer' : 'brand');
  }, [searchParams]);

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
    setStep(1);
  };

  // Step Validation for Progressive Sign Up
  const canProceedStep2 = name.trim().length > 0 && companyName.trim().length > 0;
  const canProceedStep3 =
    email.trim().length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) &&
    phoneNumber &&
    /^\+[1-9]{1}[0-9]{3,14}$/.test(phoneNumber);
  const canProceedStep4 = password.length >= 6 && password === confirmPassword;

  const nextStep = () => {
    setError('');
    if (step === 2 && !canProceedStep2) {
      if (!name.trim()) {
        setError('Please enter your full name');
        toast.error('Please enter your full name');
        return;
      }
      if (!companyName.trim()) {
        setError('Please enter your company or organization name');
        toast.error('Please enter your company or organization name');
        return;
      }
    }
    if (step === 3 && !canProceedStep3) {
      if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError('Please enter a valid work email address');
        toast.error('Please enter a valid work email address');
        return;
      }
      if (!phoneNumber || !/^\+[1-9]{1}[0-9]{3,14}$/.test(phoneNumber)) {
        setError('Please enter a valid phone number with country code (e.g. +91 98765 43210)');
        toast.error('Please enter a valid phone number');
        return;
      }
    }
    setStep((prev) => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setError('');
    setStep((prev) => Math.max(prev - 1, 1));
  };

  // Submit Handler: Sign In
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

  // Submit Handler: Sign Up
  async function handleSignUpSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (!canProceedStep4) {
      if (password.length < 6) {
        setError('Password must be at least 6 characters long');
        toast.error('Password must be at least 6 characters long');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        toast.error('Passwords do not match');
        return;
      }
    }

    setLoading(true);

    try {
      const finalOrgName = companyName.trim() || name.trim();
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

  // Submit Handler: Forgot Password
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
    <div className="min-h-screen flex flex-col md:flex-row bg-[#FAF9F6] text-[#0B1020] font-sans">
      {/* Left Pane - Branding & Features (Official Navy Background #141C4A) */}
      <div className="w-full md:w-[40%] xl:w-[35%] bg-[#141C4A] text-white p-8 md:p-12 lg:p-16 flex flex-col justify-between min-h-[380px] md:min-h-screen relative overflow-hidden">
        <div className="relative z-20 space-y-12 md:space-y-16">
          {/* Logo & Headline */}
          <div className="space-y-4">
            <Link to="/" className="inline-block transition-opacity hover:opacity-90">
              <img
                src="/logo.png"
                alt="Sponsor Studio"
                className="h-10 md:h-12 w-auto brightness-0 invert"
              />
            </Link>
            <h1 className="text-3xl lg:text-4xl font-normal font-serif tracking-tight leading-tight text-white">
              Sponsorships, <span className="italic">minus cold emails.</span>
            </h1>
            <p className="text-white/70 text-sm md:text-base leading-relaxed max-w-sm">
              India&apos;s first sponsorship marketplace — connecting brands with verified opportunities.
            </p>
          </div>

          {/* Features Checklists (Design System Compliant) */}
          <div className="space-y-6 lg:space-y-8">
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white">
                <Smartphone className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h3 className="font-semibold text-sm text-white">Swipe to discover</h3>
                <p className="text-white/70 text-xs sm:text-sm leading-relaxed">
                  Browse verified events and express interest in one tap.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h3 className="font-semibold text-sm text-white">Risk & audience insights</h3>
                <p className="text-white/70 text-xs sm:text-sm leading-relaxed">
                  Automated risk reports and verified demographics.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-white">
                <FileText className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h3 className="font-semibold text-sm text-white">Sign MOUs digitally</h3>
                <p className="text-white/70 text-xs sm:text-sm leading-relaxed">
                  Everything from match to signed deal — in one place.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Pane - Form Card (Always Light Theme) */}
      <div className="w-full md:w-[60%] xl:w-[65%] flex items-center justify-center p-6 md:p-12 lg:p-16 bg-[#FAF9F6] relative z-20 min-h-screen">
        <div
          className="w-full max-w-md border border-[rgba(11,16,32,0.10)] rounded-3xl p-8 shadow-[0_4px_20px_rgba(11,16,32,0.04)] space-y-6"
          style={{ backgroundColor: '#ffffff', color: '#0B1020' }}
        >
          {/* Password Reset View */}
          {isForgotPassword ? (
            <form onSubmit={handleForgotPasswordSubmit} className="space-y-6">
              <div className="space-y-2">
                <h2 className="font-serif text-3xl font-normal text-[#0B1020]">Reset password</h2>
                <p className="text-sm text-[#4A5168]">
                  Enter your registered email address to receive password instructions.
                </p>
              </div>

              {resetEmailSent ? (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm space-y-3">
                  <p className="font-medium">Reset instructions sent!</p>
                  <p className="text-xs text-emerald-700">
                    Check <strong>{email}</strong> for instructions to set your new password.
                  </p>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="text-xs font-medium text-[#2A3A92] underline underline-offset-4 hover:text-[#212E75]"
                  >
                    Return to Sign In
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="block text-xs font-semibold text-[#4A5168]">
                      Work Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="w-full h-11 px-4 rounded-xl border border-[rgba(11,16,32,0.12)] bg-white text-[#0B1020] text-sm focus:outline-none focus:border-[#2A3A92] focus:ring-1 focus:ring-[#2A3A92] transition-colors placeholder:text-[#7A8199]"
                      required
                      disabled={loading}
                    />
                  </div>

                  {error && <p className="text-xs font-medium text-red-600">{error}</p>}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-11 rounded-xl bg-[#2A3A92] hover:bg-[#212E75] text-white font-medium text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? 'Sending link...' : 'Send Reset Link'}
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="text-xs font-medium text-[#4A5168] hover:text-[#0B1020] transition-colors"
                    >
                      ← Back to Sign In
                    </button>
                  </div>
                </>
              )}
            </form>
          ) : isSignUp ? (
            /* Progressive Multi-Step Sign-up Flow */
            <div className="space-y-6">
              {/* Header & Step Bar */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs uppercase tracking-wider text-[#7A8199]">
                    Step 0{step} of 04
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(false);
                      resetForm();
                    }}
                    className="text-xs font-medium text-[#2A3A92] hover:text-[#212E75] underline underline-offset-4"
                  >
                    Already have an account? Log in
                  </button>
                </div>

                {/* Progress Line */}
                <div className="h-1.5 w-full bg-[#F2F1EC] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-[#2A3A92]"
                    initial={{ width: '25%' }}
                    animate={{ width: `${(step / 4) * 100}%` }}
                    transition={{ duration: 0.35, ease: 'easeInOut' }}
                  />
                </div>

                <h2 className="font-serif text-2xl sm:text-3xl font-normal text-[#0B1020]">
                  {step === 1 && <>Choose your <span className="italic">role.</span></>}
                  {step === 2 && <>Account <span className="italic">details.</span></>}
                  {step === 3 && <>Contact <span className="italic">information.</span></>}
                  {step === 4 && <>Secure your <span className="italic">account.</span></>}
                </h2>
              </div>

              {/* Animated Step View */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-5"
                >
                  {/* STEP 1: Role Selection */}
                  {step === 1 && (
                    <div className="space-y-3">
                      <p className="text-xs sm:text-sm text-[#4A5168]">Select how you plan to use Sponsor Studio:</p>

                      <div className="grid gap-3">
                        <div
                          onClick={() => setRole('brand')}
                          className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-4 ${
                            role === 'brand'
                              ? 'border-[#2A3A92] bg-[#EEF0FA] shadow-sm'
                              : 'border-[rgba(11,16,32,0.10)] bg-white hover:border-[#2A3A92]/40'
                          }`}
                        >
                          <div className={`p-2.5 rounded-lg ${role === 'brand' ? 'bg-[#2A3A92] text-white' : 'bg-[#F2F1EC] text-[#4A5168]'}`}>
                            <Briefcase className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="text-sm font-semibold text-[#0B1020]">I&apos;m a Brand / Sponsor</h3>
                              {role === 'brand' && <CheckCircle2 className="w-4 h-4 text-[#2A3A92]" />}
                            </div>
                            <p className="text-xs text-[#4A5168] mt-0.5">
                              Discover verified events, creators, and media to sponsor.
                            </p>
                          </div>
                        </div>

                        <div
                          onClick={() => setRole('event_organizer')}
                          className={`p-4 rounded-xl border cursor-pointer transition-all flex items-start gap-4 ${
                            role === 'event_organizer'
                              ? 'border-[#2A3A92] bg-[#EEF0FA] shadow-sm'
                              : 'border-[rgba(11,16,32,0.10)] bg-white hover:border-[#2A3A92]/40'
                          }`}
                        >
                          <div className={`p-2.5 rounded-lg ${role === 'event_organizer' ? 'bg-[#2A3A92] text-white' : 'bg-[#F2F1EC] text-[#4A5168]'}`}>
                            <Users className="w-5 h-5" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h3 className="text-sm font-semibold text-[#0B1020]">I Organise Events</h3>
                              {role === 'event_organizer' && <CheckCircle2 className="w-4 h-4 text-[#2A3A92]" />}
                            </div>
                            <p className="text-xs text-[#4A5168] mt-0.5">
                              List events, manage proposals, and close deals with brands.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: Basic Info */}
                  {step === 2 && (
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label htmlFor="name" className="block text-xs font-semibold text-[#4A5168]">
                          Contact Person Name
                        </label>
                        <div className="relative">
                          <User className="w-4 h-4 text-[#7A8199] absolute left-3 top-3.5 pointer-events-none" />
                          <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Rahul Sharma"
                            className="w-full h-11 pl-10 pr-4 rounded-xl border border-[rgba(11,16,32,0.12)] bg-white text-[#0B1020] text-sm focus:outline-none focus:border-[#2A3A92] focus:ring-1 focus:ring-[#2A3A92] transition-colors placeholder:text-[#7A8199]"
                            required
                            autoFocus
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="companyName" className="block text-xs font-semibold text-[#4A5168]">
                          {role === 'brand' ? 'Company / Brand Name' : 'Organization / Event Name'}
                        </label>
                        <div className="relative">
                          <Building2 className="w-4 h-4 text-[#7A8199] absolute left-3 top-3.5 pointer-events-none" />
                          <input
                            id="companyName"
                            type="text"
                            value={companyName}
                            onChange={(e) => setCompanyName(e.target.value)}
                            placeholder={role === 'brand' ? 'e.g. Acme Beverages' : 'e.g. Sunburn Tech Summit'}
                            className="w-full h-11 pl-10 pr-4 rounded-xl border border-[rgba(11,16,32,0.12)] bg-white text-[#0B1020] text-sm focus:outline-none focus:border-[#2A3A92] focus:ring-1 focus:ring-[#2A3A92] transition-colors placeholder:text-[#7A8199]"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 3: Contact Info */}
                  {step === 3 && (
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label htmlFor="email" className="block text-xs font-semibold text-[#4A5168]">
                          Work Email Address
                        </label>
                        <div className="relative">
                          <Mail className="w-4 h-4 text-[#7A8199] absolute left-3 top-3.5 pointer-events-none z-10" />
                          <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@company.com"
                            className="w-full h-11 pl-10 pr-4 rounded-xl border border-[rgba(11,16,32,0.12)] bg-white text-[#0B1020] text-sm focus:outline-none focus:border-[#2A3A92] focus:ring-1 focus:ring-[#2A3A92] transition-colors placeholder:text-[#7A8199]"
                            required
                            autoFocus
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="phone" className="block text-xs font-semibold text-[#4A5168]">
                          Phone Number
                        </label>
                        <div className="custom-phone-container">
                          <PhoneInput
                            international
                            countryCallingCodeEditable={false}
                            defaultCountry="IN"
                            value={phoneNumber}
                            onChange={(val) => setPhoneNumber(val || '')}
                            placeholder="+91 98765 43210"
                            className="w-full h-11 px-4 rounded-xl border border-[rgba(11,16,32,0.12)] bg-white text-[#0B1020] text-sm focus-within:border-[#2A3A92] focus-within:ring-1 focus-within:ring-[#2A3A92] transition-colors outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 4: Password & Submit */}
                  {step === 4 && (
                    <form onSubmit={handleSignUpSubmit} className="space-y-4">
                      <div className="space-y-1.5">
                        <label htmlFor="password" className="block text-xs font-semibold text-[#4A5168]">
                          Create Password
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-[#7A8199] absolute left-3 top-3.5 pointer-events-none" />
                          <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full h-11 pl-10 pr-10 rounded-xl border border-[rgba(11,16,32,0.12)] bg-white text-[#0B1020] text-sm focus:outline-none focus:border-[#2A3A92] focus:ring-1 focus:ring-[#2A3A92] transition-colors placeholder:text-[#7A8199]"
                            required
                            autoFocus
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-3.5 text-[#7A8199] hover:text-[#0B1020]"
                          >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label htmlFor="confirmPassword" className="block text-xs font-semibold text-[#4A5168]">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-[#7A8199] absolute left-3 top-3.5 pointer-events-none" />
                          <input
                            id="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full h-11 pl-10 pr-10 rounded-xl border border-[rgba(11,16,32,0.12)] bg-white text-[#0B1020] text-sm focus:outline-none focus:border-[#2A3A92] focus:ring-1 focus:ring-[#2A3A92] transition-colors placeholder:text-[#7A8199]"
                            required
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-3.5 text-[#7A8199] hover:text-[#0B1020]"
                          >
                            {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </form>
                  )}
                </motion.div>
              </AnimatePresence>

              {error && <p className="text-xs font-medium text-red-600">{error}</p>}

              {/* Progressive Step Controls */}
              <div className="flex items-center justify-between pt-2">
                {step > 1 ? (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="inline-flex items-center gap-1.5 px-4 h-10 rounded-xl border border-[rgba(11,16,32,0.12)] text-xs font-medium text-[#0B1020] hover:bg-[#F5F4F0] transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>
                ) : <div />}

                {step < 4 ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="inline-flex items-center gap-1.5 px-6 h-10 rounded-xl bg-[#2A3A92] hover:bg-[#212E75] text-white text-xs font-medium transition-colors"
                  >
                    Continue <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSignUpSubmit}
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 px-6 h-10 rounded-xl bg-[#2A3A92] hover:bg-[#212E75] text-white text-xs font-medium transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Creating account...' : 'Complete Sign Up'}
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Sign In Flow */
            <form onSubmit={handleSignInSubmit} className="space-y-6">
              <div className="space-y-2">
                <h2 className="font-serif text-3xl font-normal text-[#0B1020]">
                  Welcome <span className="italic">back.</span>
                </h2>
                <p className="text-sm text-[#4A5168]">
                  Log in to your Sponsor Studio marketplace account.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="signin-email" className="block text-xs font-semibold text-[#4A5168]">
                    Work Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-[#7A8199] absolute left-3 top-3.5 pointer-events-none" />
                    <input
                      id="signin-email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@company.com"
                      className="w-full h-11 pl-10 pr-4 rounded-xl border border-[rgba(11,16,32,0.12)] bg-white text-[#0B1020] text-sm focus:outline-none focus:border-[#2A3A92] focus:ring-1 focus:ring-[#2A3A92] transition-colors placeholder:text-[#7A8199]"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label htmlFor="signin-password" className="block text-xs font-semibold text-[#4A5168]">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsForgotPassword(true)}
                      className="text-xs font-medium text-[#2A3A92] hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-[#7A8199] absolute left-3 top-3.5 pointer-events-none" />
                    <input
                      id="signin-password"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full h-11 pl-10 pr-10 rounded-xl border border-[rgba(11,16,32,0.12)] bg-white text-[#0B1020] text-sm focus:outline-none focus:border-[#2A3A92] focus:ring-1 focus:ring-[#2A3A92] transition-colors placeholder:text-[#7A8199]"
                      required
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 text-[#7A8199] hover:text-[#0B1020]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              {error && <p className="text-xs font-medium text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-xl bg-[#2A3A92] hover:bg-[#212E75] text-white font-medium text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Logging in...' : 'Log in to Dashboard'}
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2 border-t border-[rgba(11,16,32,0.08)]">
                <p className="text-xs text-[#4A5168]">
                  New to Sponsor Studio?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSignUp(true);
                      setStep(1);
                      setError('');
                    }}
                    className="font-medium text-[#2A3A92] hover:underline"
                  >
                    Create a free account
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>

      {/* Phone Input Custom Styling */}
      <style>{`
        .custom-phone-container .PhoneInputInput {
          background: transparent !important;
          border: none !important;
          outline: none !important;
          box-shadow: none !important;
          color: #0B1020 !important;
          font-weight: 400 !important;
          font-size: 0.875rem !important;
          padding: 0 !important;
          margin-left: 0.5rem !important;
        }
        .custom-phone-container .PhoneInputCountrySelect {
          background: transparent !important;
          color: #0B1020 !important;
          border: none !important;
          outline: none !important;
        }
      `}</style>
    </div>
  );
}
