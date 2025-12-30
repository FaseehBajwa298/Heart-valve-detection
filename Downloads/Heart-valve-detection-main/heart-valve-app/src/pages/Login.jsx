import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || '';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [mode, setMode] = useState('login');
  const [forgotEmail, setForgotEmail] = useState('');
  const [resetPassword, setResetPassword] = useState('');
  const [resetConfirm, setResetConfirm] = useState('');
  const [resetTokenFromApi, setResetTokenFromApi] = useState('');
  const [resetTokenInput, setResetTokenInput] = useState('');
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const resetToken = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get('resetToken') || '';
  }, [location.search]);

  useEffect(() => {
    if (resetToken) {
      setMode('reset');
      setError('');
      setInfo('');
      return;
    }
    setMode('login');
  }, [resetToken]);

  useEffect(() => {
    if (resetToken) {
      setResetTokenInput(resetToken);
    }
  }, [resetToken]);

  useEffect(() => {
    if (user && mode === 'login') {
      navigate('/dashboard', { replace: true });
    }
  }, [mode, navigate, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setInfo('');

    try {
      const response = await login(email, password);
      
      if (response.success) {
        navigate('/dashboard', { replace: true });
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setInfo('');
    setResetTokenFromApi('');
    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const extra = String(data?.mongoError || '').trim();
        setError(`${data?.message || 'Request failed'}${extra ? ` (${extra})` : ''}`);
        return;
      }
      const token =
        String(data?.resetToken || data?.reset_token || data?.token || '').trim();
      if (token) {
        setInfo('Reset token generated. Continue to reset your password.');
      } else {
        let healthNote = '';
        try {
          const hRes = await fetch(`${API_BASE}/api/health`);
          const hData = await hRes.json().catch(() => null);
          const dbLabel = String(hData?.db || '').trim();
          if (dbLabel) {
            healthNote = ` Backend database: ${dbLabel}.`;
          }
          const mongoErr = String(hData?.mongoError || '').trim();
          if (mongoErr) {
            healthNote = `${healthNote} ${mongoErr}`;
          }
        } catch {
          healthNote = '';
        }
        setInfo(
          `No reset token was returned.${healthNote} This usually means the backend is not connected to the same MongoDB Atlas database where the user exists.`
        );
      }
      if (token) {
        setResetTokenFromApi(token);
      }
    } catch {
      setError('Request failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setInfo('');
    const tokenToUse = String(resetTokenInput || '').trim();
    if (!tokenToUse) {
      setError('Missing reset token');
      setIsLoading(false);
      return;
    }
    if (!resetPassword || resetPassword !== resetConfirm) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenToUse, newPassword: resetPassword }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const extra = String(data?.mongoError || '').trim();
        setError(`${data?.message || 'Reset failed'}${extra ? ` (${extra})` : ''}`);
        return;
      }
      setInfo('Password updated successfully. Please sign in.');
      setResetPassword('');
      setResetConfirm('');
      navigate('/login', { replace: true });
    } catch {
      setError('Reset failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 relative overflow-hidden">
      {/* Floating Shapes */}
      <div className="absolute top-[-50px] left-[-50px] w-32 h-32 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-50px] left-[20%] w-32 h-32 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md z-10 relative">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">
            {mode === 'reset' ? 'Reset Password' : mode === 'forgot' ? 'Forgot Password' : 'Welcome'}
          </h2>
          <p className="text-gray-600 mt-2">
            {mode === 'reset'
              ? 'Set a new password for your account'
              : mode === 'forgot'
                ? 'Generate a reset token'
                : 'Sign in to your account'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded bg-red-50 border border-red-200 text-red-600 text-sm flex items-center animate-shake">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}

        {info && (
          <div className="mb-4 p-3 rounded bg-green-50 border border-green-200 text-green-700 text-sm">
            {info}
          </div>
        )}

        {mode === 'reset' ? (
          <form className="space-y-6" onSubmit={handleResetPassword}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Reset Token</label>
              <div className="mt-1 relative">
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white text-gray-900 disabled:bg-gray-50"
                  placeholder="Paste reset token"
                  required
                  disabled={isLoading}
                  value={resetTokenInput}
                  onChange={(e) => setResetTokenInput(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">New Password</label>
              <div className="mt-1 relative">
                <input
                  type="password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white text-gray-900 disabled:bg-gray-50"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                  value={resetPassword}
                  onChange={(e) => setResetPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
              <div className="mt-1 relative">
                <input
                  type="password"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white text-gray-900 disabled:bg-gray-50"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                  value={resetConfirm}
                  onChange={(e) => setResetConfirm(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-all duration-300 ${
                isLoading
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Updating...
                </div>
              ) : 'Update Password'}
            </button>

            <button
              type="button"
              onClick={() => navigate('/login', { replace: true })}
              className="w-full bg-gray-100 text-gray-700 font-bold py-2 px-4 rounded-md hover:bg-gray-200 transition"
            >
              Back to Sign In
            </button>
          </form>
        ) : mode === 'forgot' ? (
          <form className="space-y-6" onSubmit={handleForgotPassword}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <div className="mt-1 relative">
                <input
                  type="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white text-gray-900 disabled:bg-gray-50"
                  placeholder="you@example.com"
                  required
                  disabled={isLoading}
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-all duration-300 ${
                isLoading
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Sending...
                </div>
              ) : 'Generate Reset Token'}
            </button>

            {resetTokenFromApi && (
              <div className="space-y-3">
                <div className="rounded-md border border-gray-200 bg-gray-50 p-3">
                  <div className="text-xs font-semibold text-gray-600 mb-2">Reset Token</div>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={resetTokenFromApi}
                      className="w-full px-3 py-2 border border-gray-200 rounded-md bg-white text-gray-900 text-xs"
                    />
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(resetTokenFromApi);
                          setInfo('Token copied. Continue to reset.');
                        } catch {
                          setInfo('Unable to copy the token. Please copy it manually.');
                        }
                      }}
                      className="shrink-0 bg-gray-900 text-white px-3 py-2 text-xs font-bold rounded-md hover:bg-black transition"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate(`/login?resetToken=${encodeURIComponent(resetTokenFromApi)}`)}
                  className="w-full bg-gray-100 text-gray-700 font-bold py-2 px-4 rounded-md hover:bg-gray-200 transition"
                >
                  Continue to Reset
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={() => setMode('login')}
              className="w-full bg-gray-100 text-gray-700 font-bold py-2 px-4 rounded-md hover:bg-gray-200 transition"
            >
              Back to Sign In
            </button>
          </form>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email Address</label>
              <div className="mt-1 relative">
                <input
                  type="email"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white text-gray-900 disabled:bg-gray-50"
                  placeholder="you@example.com"
                  required
                  disabled={isLoading}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <div className="mt-1 relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white text-gray-900 disabled:bg-gray-50"
                  placeholder="••••••••"
                  required
                  disabled={isLoading}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  disabled={isLoading}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-slate-700 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-md"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-7-10-7a19.3 19.3 0 014.229-4.935M9.88 9.88a3 3 0 104.243 4.243M6.1 6.1L3 3m18 18l-3.1-3.1m-1.82-1.82L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input id="remember-me" type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded cursor-pointer" />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 cursor-pointer">Remember me</label>
              </div>
              <div className="text-sm">
                <button
                  type="button"
                  onClick={() => {
                    setError('');
                    setInfo('');
                    setMode('forgot');
                  }}
                  className="bg-transparent p-0 border-0 rounded-none font-medium text-indigo-600 hover:text-indigo-500 hover:underline focus:outline-none"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-all duration-300 ${
                isLoading
                  ? 'bg-blue-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Signing in...
                </div>
              ) : 'Sign In'}
            </button>
          </form>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="font-medium text-blue-600 hover:text-blue-500">
              Sign up here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
