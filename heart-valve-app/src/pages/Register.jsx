import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  // Simplified handler for specific inputs since the previous logic was getting messy with unnamed inputs
  const handleInputChange = (field) => (e) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      setIsLoading(false);
      return;
    }
    
    const response = await signup({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      password: formData.password
    });
    
    if (response.success) {
      navigate('/');
    } else {
      alert(response.message);
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 relative overflow-hidden">
      {/* Floating Shapes */}
      <div className="absolute top-[-50px] left-[-50px] w-32 h-32 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-[-50px] right-[-50px] w-32 h-32 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-50px] left-[20%] w-32 h-32 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md z-10 relative">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Create Account</h2>
          <p className="text-gray-600 mt-2">Join our community today</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">First Name</label>
              <input 
                type="text" 
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white text-gray-900" 
                required
                value={formData.firstName}
                onChange={handleInputChange('firstName')}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Name</label>
              <input 
                type="text" 
                className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white text-gray-900" 
                required
                value={formData.lastName}
                onChange={handleInputChange('lastName')}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email Address</label>
            <input 
              type="email" 
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white text-gray-900" 
              required
              value={formData.email}
              onChange={handleInputChange('email')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Password</label>
            <div className="mt-1 relative">
              <input 
                type={showPassword ? 'text' : 'password'} 
                className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white text-gray-900" 
                required
                value={formData.password}
                onChange={handleInputChange('password')}
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

          <div>
            <label className="block text-sm font-medium text-gray-700">Confirm Password</label>
            <div className="mt-1 relative">
              <input 
                type={showConfirmPassword ? 'text' : 'password'} 
                className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none transition bg-white text-gray-900" 
                required
                value={formData.confirmPassword}
                onChange={handleInputChange('confirmPassword')}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((v) => !v)}
                disabled={isLoading}
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-500 hover:text-slate-700 disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-md"
              >
                {showConfirmPassword ? (
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

          <div className="flex items-center">
            <input id="agree-terms" type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" required />
            <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-900">
              I agree to the{' '}
              <button
                type="button"
                onClick={() => window.alert('Terms will be published soon.')}
                className="bg-transparent p-0 border-0 rounded-none font-medium text-indigo-600 hover:text-indigo-500 hover:underline focus:outline-none"
              >
                Terms
              </button>{' '}
              and{' '}
              <button
                type="button"
                onClick={() => window.alert('Privacy policy will be published soon.')}
                className="bg-transparent p-0 border-0 rounded-none font-medium text-indigo-600 hover:text-indigo-500 hover:underline focus:outline-none"
              >
                Privacy Policy
              </button>
            </label>
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors ${
              isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
            }`}
          >
            {isLoading ? 'Creating...' : 'Create Account'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
