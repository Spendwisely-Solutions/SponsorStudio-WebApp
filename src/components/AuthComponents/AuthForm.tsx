import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';
import { signIn, signUp } from '../../lib/auth';
import { supabase } from '../../lib/supabase';
import type { Database } from '../../lib/database.types';
import toast from 'react-hot-toast';

type UserType = Database['public']['Tables']['profiles']['Row']['user_type'];

interface AuthFormProps {
  onSuccess: () => void;
  onSignUpSuccess?: () => void;
}

export default function AuthForm({ onSuccess, onSignUpSuccess }: AuthFormProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [name, setName] = useState('');
  const [userType, setUserType] = useState<UserType>('brand');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetEmailSent, setResetEmailSent] = useState(false);

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

      const { user, profile: userProfile } = await signIn(email, password);
      toast.success('Welcome back!');
      onSuccess();
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
        setError('Please enter a name');
        toast.error('Please enter a name');
        return;
      }
      if (!phoneNumber || !/^\+[1-9]{1}[0-9]{3,14}$/.test(phoneNumber)) {
        setError('Please enter a valid phone number in international format (e.g., +12025550123)');
        toast.error('Please enter a valid phone number in international format');
        return;
      }

      const authData = await signUp(email, password, userType, phoneNumber, name);
      if (!authData.user) {
        setError('Account creation failed - no user data returned');
        toast.error('Account creation failed - no user data returned');
        throw new Error('Account creation failed - no user data returned');
      }
      toast.success('Account created successfully');
      if (onSignUpSuccess) onSignUpSuccess();
      onSuccess();
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

  const resetForm = () => {
    setIsForgotPassword(false);
    setResetEmailSent(false);
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setPhoneNumber('');
    setName('');
    setError('');
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-gradient-to-br from-white to-gray-50 border border-gray-200 shadow-2xl rounded-2xl p-8 max-h-[90dvh] overflow-y-auto relative transition-all duration-300">
      <style jsx>{`
        /* Minimal scrollbar with subtle color */
        div[class*="max-h-[90dvh]"]::-webkit-scrollbar {
          width: 4px;
          background: transparent;
        }
        div[class*="max-h-[90dvh]"]::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.3);
          border-radius: 4px;
        }
        div[class*="max-h-[90dvh]"]::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.5);
        }
        div[class*="max-h-[90dvh]"]::-webkit-scrollbar-track {
          background: transparent;
        }
        /* For Firefox */
        div[class*="max-h-[90dvh]"] {
          scrollbar-width: thin;
          scrollbar-color: rgba(156, 163, 175, 0.3) transparent;
        }
        .PhoneInput,
        input.custom-input,
        select.custom-select {
          display: flex;
          align-items: center;
          border: 2px solid #e5e7eb !important;
          border-radius: 0.75rem;
          padding: 0.65rem 1.25rem;
          background: #ffffff;
          transition: all 0.3s ease;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        .PhoneInput:hover,
        input.custom-input:hover,
        select.custom-select:hover {
          border-color: #3b82f6 !important;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.2);
          transform: translateY(-1px);
        }
        .PhoneInput:focus-within,
        input.custom-input:focus,
        select.custom-select:focus {
          border-color: #3b82f6 !important;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
          outline: none;
          transform: translateY(-1px);
        }
        .PhoneInputInput,
        input.custom-input,
        select.custom-select {
          border: none;
          outline: none;
          flex: 1;
          font-size: 1rem;
          line-height: 1.5rem;
          background: transparent;
          color: #1f2937;
          width: 100%;
          font-weight: 500;
        }
        .PhoneInputInput::placeholder,
        input.custom-input::placeholder {
          color: #9ca3af;
          font-weight: 400;
        }
        .PhoneInputCountry {
          margin-right: 0.75rem;
        }
        .PhoneInputCountrySelect {
          border: none;
          background: transparent;
          color: #1f2937;
          outline: none;
          font-weight: 500;
        }
        .PhoneInputCountrySelectArrow {
          display: none;
        }
        .PhoneInput--disabled,
        input.custom-input:disabled,
        select.custom-select:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        /* Subtle animation for form elements */
        .form-field {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .form-field:hover {
          transform: translateY(-2px);
        }
      `}</style>
      {/* Dynamic gradient accent bar */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-48 h-2 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 shadow-lg mb-6 transition-all duration-500 hover:scale-105" />
      <h2 className="text-3xl font-extrabold text-center bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent mb-8 tracking-tight drop-shadow-md">
        {isForgotPassword ? 'Reset Password' : isSignUp ? 'Create an Account' : 'Welcome Back'}
      </h2>

      {isForgotPassword ? (
        <form onSubmit={handleForgotPasswordSubmit} className="space-y-6">
          {resetEmailSent ? (
            <div className="text-center">
              <p className="text-sm text-gray-700 font-medium">
                A password reset link has been sent to {email}. Please check your inbox (and spam folder).
              </p>
              <button
                type="button"
                onClick={resetForm}
                className="mt-5 text-sm text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-200"
                disabled={loading}
              >
                Back to Sign In
              </button>
            </div>
          ) : (
            <>
              <div className="form-field">
                <label htmlFor="email" className="block text-sm font-semibold text-gray-800 tracking-wide mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="mt-1 block w-full custom-input disabled:opacity-60"
                  required
                  disabled={loading}
                />
              </div>

              {error && <div className="text-red-600 text-sm font-medium">{error}</div>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-base font-semibold shadow-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.02]"
              >
                {loading ? 'Please wait...' : 'Send Reset Link'}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-sm text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-200"
                  disabled={loading}
                >
                  Back to Sign In
                </button>
              </div>
            </>
          )}
        </form>
      ) : (
        <form
          onSubmit={isSignUp ? handleSignUpSubmit : handleSignInSubmit}
          className="space-y-6"
        >
          <div className="form-field">
            <label htmlFor="email" className="block text-sm font-semibold text-gray-800 tracking-wide mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full custom-input disabled:opacity-60"
              required
              disabled={loading}
            />
          </div>

          {isSignUp && (
            <>
              <div className="form-field">
                <label htmlFor="name" className="block text-sm font-semibold text-gray-800 tracking-wide mb-2">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 block w-full custom-input disabled:opacity-60"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-field">
                <label htmlFor="phoneNumber" className="block text-sm font-semibold text-gray-800 tracking-wide mb-2">
                  Phone Number
                </label>
                <PhoneInput
                  id="phoneNumber"
                  international
                  countryCallingCodeEditable={false}
                  defaultCountry="IN"
                  value={phoneNumber}
                  onChange={value => setPhoneNumber(value || "")}
                  className="mt-1 block w-full disabled:opacity-60"
                  required
                  disabled={loading}
                  placeholder="+12025550123"
                />
              </div>
            </>
          )}

          <div className="form-field">
            <label htmlFor="password" className="block text-sm font-semibold text-gray-800 tracking-wide mb-2">
              Password
            </label>
            <div className="relative mt-1">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full custom-input pr-10 disabled:opacity-60"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200"
                disabled={loading}
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {isSignUp && (
            <div className="form-field">
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-800 tracking-wide mb-2">
                Confirm Password
              </label>
              <div className="relative mt-1">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full custom-input pr-10 disabled:opacity-60"
                  required
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200"
                  disabled={loading}
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>
          )}

          {isSignUp && (
            <div className="form-field">
              <label htmlFor="userType" className="block text-sm font-semibold text-gray-800 tracking-wide mb-2">
                I am a
              </label>
              <select
                id="userType"
                value={userType}
                onChange={(e) => setUserType(e.target.value as UserType)}
                className="mt-1 block w-full custom-select disabled:opacity-60"
                required
                disabled={loading}
              >
                <option value="brand">Brand</option>
                <option value="agency">Marketing Agency</option>
                <option value="influencer">Influencer</option>
                <option value="event_organizer">Opportunity Provider</option>
              </select>
            </div>
          )}

          {error && <div className="text-red-600 text-sm font-medium">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-base font-semibold shadow-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.02]"
          >
            {loading
              ? 'Please wait...'
              : isSignUp
                ? 'Create Account'
                : 'Sign In'}
          </button>
          <div className="text-center space-y-3 mt-3">
            {!isSignUp && (
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(true);
                  setError('');
                  setEmail('');
                  setPassword('');
                }}
                className="text-sm text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-200"
                disabled={loading}
              >
                Forgot Password?
              </button>
            )}
            <div>
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                  setEmail('');
                  setPassword('');
                  setConfirmPassword('');
                  setPhoneNumber('');
                  setName('');
                }}
                className="text-sm text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-200"
                disabled={loading}
              >
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>
            </div>
          </div>

          {error && (
            <div className="text-center text-sm text-gray-600 mt-3">
              Having trouble?{' '}
              <a href="mailto:support@sponsorstudio.in" className="text-blue-600 hover:text-blue-800 font-semibold transition-colors duration-200">
                Contact support
              </a>
            </div>
          )}
        </form>
      )}
    </div>
  );
}