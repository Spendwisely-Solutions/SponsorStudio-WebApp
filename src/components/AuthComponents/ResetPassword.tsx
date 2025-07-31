import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

const ResetPassword: React.FC = () => {
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [isTokenValid, setIsTokenValid] = useState<boolean>(false);
  const [verifying, setVerifying] = useState<boolean>(true);
  const navigate = useNavigate();
  const location = useLocation();
  const isVerifyingRef = useRef<boolean>(false);

  useEffect(() => {

    // Prevent multiple verifications
    if (isVerifyingRef.current || isTokenValid) {
      return;
    }

    isVerifyingRef.current = true;
    setError(''); // Clear error initially

    // Extract token from URL hash or query parameters
    const hashParams = new URLSearchParams(location.hash.substring(1));
    const queryParams = new URLSearchParams(location.search);
    const accessToken = hashParams.get('access_token') || queryParams.get('access_token');
    const tokenType = hashParams.get('type') || queryParams.get('type');

    const verifyToken = async () => {

      if (!accessToken || tokenType !== 'recovery') {
        setError('Invalid or missing reset token. Please use the link from your email.');
        setVerifying(false);
        isVerifyingRef.current = false;
        return;
      }

      try {
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: hashParams.get('refresh_token') || queryParams.get('refresh_token') || '',
        });

        if (error || !data.session) {
          console.error('Session Error:', error);
          setError('Invalid or expired reset token. Please request a new password reset link.');
          setVerifying(false);
          isVerifyingRef.current = false;
          return;
        }

        setError(''); // Clear any existing error
        setIsTokenValid(true);
        setVerifying(false);
        isVerifyingRef.current = false;
      } catch (err) {
        console.error('Verification Error:', err);
        setError('An error occurred while verifying the reset token.');
        setVerifying(false);
        isVerifyingRef.current = false;
      }
    };

    verifyToken();

    // Cleanup to reset verification flag
    return () => {
    };
  }, [location, isTokenValid]);

  // Show toast only when form cannot render and error exists
  useEffect(() => {
    if (!verifying && !isTokenValid && error) {
      toast.error(error);
    }
  }, [verifying, isTokenValid, error]);

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        console.error('Session Check Error:', sessionError);
        setError('Session expired. Please request a new password reset link.');
        toast.error('Session expired. Please request a new password reset link.');
        return;
      }

      if (!newPassword || newPassword.length < 6) {
        setError('Password must be at least 6 characters long');
        toast.error('Password must be at least 6 characters long');
        return;
      }
      if (newPassword !== confirmPassword) {
        setError('Passwords do not match');
        toast.error('Passwords do not match');
        return;
      }

      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        console.error('Update User Error:', error);
        setError(error.message);
        toast.error(error.message);
        return;
      }

      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (err) {
      console.error('Reset Error:', err);
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during password reset';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-white rounded-lg shadow-md p-6 max-h-[90vh] overflow-y-auto">
      <style jsx>{`
        input.custom-input {
          display: flex;
          align-items: center;
          border: 1px solid #d1d5db !important;
          border-radius: 0.375rem;
          padding: 0.375rem 0.75rem;
          background: white;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
        }
        input.custom-input:hover {
          border-color: #a1a1aa !important;
        }
        input.custom-input:focus {
          border-color: #2B4B9B !important;
          box-shadow: 0 0 0 2px rgba(43, 75, 155, 0.2);
          outline: none;
        }
        input.custom-input {
          border: none;
          outline: none;
          flex: 1;
          font-size: 0.875rem;
          line-height: 1.25rem;
          background: transparent;
          color: #111827;
          width: 100%;
        }
        input.custom-input::placeholder {
          color: #9ca3af;
        }
        input.custom-input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
      <h2 className="text-xl font-bold text-center text-[#2B4B9B] mb-4">
        Reset Your Password
      </h2>

      {verifying ? (
        <div className="text-center text-sm text-gray-600">
          Verifying reset token...
        </div>
      ) : isTokenValid ? (
        <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
          <div>
            <label htmlFor="newPassword" className="block text-xs font-medium text-gray-700">
              New Password
            </label>
            <div className="relative mt-1">
              <input
                id="newPassword"
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="block w-full px-3 py-1.5 shadow-sm custom-input pr-8 disabled:opacity-50"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-500 hover:text-gray-700"
                disabled={loading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-700">
              Confirm New Password
            </label>
            <div className="relative mt-1">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full px-3 py-1.5 shadow-sm custom-input pr-8 disabled:opacity-50"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-2 flex items-center text-gray-500 hover:text-gray-700"
                disabled={loading}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && <div className="text-red-600 text-xs">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-3 rounded-md bg-[#2B4B9B] text-white text-sm font-medium hover:bg-[#1a2f61] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2B4B9B] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Please wait...' : 'Reset Password'}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-xs text-[#2B4B9B] hover:text-[#1a2f61]"
              disabled={loading}
            >
              Back to Sign In
            </button>
          </div>
        </form>
      ) : (
        <div className="text-center">
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="mt-4 text-xs text-[#2B4B9B] hover:text-[#1a2f61]"
          >
            Back to Sign In
          </button>
        </div>
      )}

      <div className="text-center text-xs text-gray-600 mt-2">
        Having trouble?{' '}
        <a href="mailto:connect@sponsorstudio.in" className="text-[#2B4B9B] hover:text-[#1a2f61]">
          Contact support
        </a>
      </div>
    </div>
  );
};

export default ResetPassword;