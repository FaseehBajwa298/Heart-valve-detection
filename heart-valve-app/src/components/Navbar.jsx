import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ==== Logo Component ====
const Logo = () => {
  return (
    <div className="flex items-center gap-2">
      <svg
        viewBox="0 0 48 48"
        className="w-10 h-10"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="hv-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3b82f6" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>

        {/* Outer rounded card */}
        <rect
          x="4"
          y="4"
          width="40"
          height="40"
          rx="12"
          fill="url(#hv-gradient)"
        />

        {/* ECG line */}
        <polyline
          points="8,26 14,22 18,28 22,16 28,30 32,22 40,24"
          fill="none"
          stroke="white"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Small heart icon */}
        <path
          d="M16 15c-1.6-2.2 0.4-5 2.8-5 1.2 0 2.1 0.6 2.7 1.5 0.6-0.9 1.5-1.5 2.7-1.5 2.4 0 4.4 2.8 2.8 5
             -1.4 2-3.9 3.6-5.5 4.5 -1.6-0.9-4.1-2.5-5.5-4.5z"
          fill="white"
          opacity="0.9"
        />
      </svg>

      <span className="font-semibold text-xl tracking-tight">
        <span className="text-white">Heart</span>
        <span className="text-white">Valve</span>
        <span className="text-white"> AI</span>
      </span>
    </div>
  );
};

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      if (location.pathname === '/') {
        const sections = ['home', 'services', 'about', 'contact'];

        if (window.scrollY < 100) {
          setActiveSection('home');
          return;
        }

        for (const section of sections) {
          const element = document.getElementById(section);
          if (element) {
            const rect = element.getBoundingClientRect();
            if (rect.top <= 150 && rect.bottom >= 150) {
              setActiveSection(section);
            }
          }
        }
      } else {
        setActiveSection('');
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getLinkClass = (section) => {
    return activeSection === section
      ? 'bg-blue-600 text-white px-4 py-2 rounded-sm transition-all duration-300'
      : 'text-white hover:text-blue-100 px-4 py-2 rounded-sm transition-all duration-300';
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#4C9BF5] text-white px-4 py-4 md:px-12 flex justify-between items-center shadow-md">
      {/* Logo Section */}
      <div className="flex items-center gap-2">
        <Logo />
      </div>

      {/* Navigation Links */}
      <div className="hidden md:flex items-center space-x-4 text-sm font-medium">
        <a href="/#home" className={getLinkClass('home')}>Home</a>
        <a href="/#services" className={getLinkClass('services')}>Services</a>
        <a href="/#about" className={getLinkClass('about')}>About Us</a>
        <a href="/#contact" className={getLinkClass('contact')}>Contact</a>
      </div>

      {/* Right Section: Login / Dashboard */}
      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-white hover:text-blue-100 font-medium">
              Dashboard
            </Link>
            <span className="text-sm font-medium">{user.email}</span>
            <button
              onClick={handleLogout}
              className="bg-white text-[#4C9BF5] hover:bg-gray-100 px-6 py-2 font-bold text-sm tracking-wide transition-colors rounded-sm"
            >
              LOGOUT
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="bg-white text-[#4C9BF5] hover:bg-gray-100 px-6 py-2 font-bold text-sm tracking-wide transition-colors rounded-sm"
          >
            LOGIN
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
