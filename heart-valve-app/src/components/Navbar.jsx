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
  const [isMobileOpen, setIsMobileOpen] = useState(false);

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
    const base =
      'px-4 py-2 rounded-lg transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-700';
    return activeSection === section
      ? `${base} bg-white/15 text-white ring-1 ring-white/20`
      : `${base} text-white/90 hover:text-white hover:bg-white/10`;
  };

  const closeMobileMenu = () => setIsMobileOpen(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-lg shadow-blue-900/10">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 md:px-6">
        <div className="flex items-center gap-2">
          <Link to="/" onClick={closeMobileMenu}>
            <Logo />
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-2 text-sm font-semibold">
          <a href="/#home" className={getLinkClass('home')}>Home</a>
          <a href="/#services" className={getLinkClass('services')}>Services</a>
          <a href="/#about" className={getLinkClass('about')}>About</a>
          <a href="/#contact" className={getLinkClass('contact')}>Contact</a>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setIsMobileOpen((prev) => !prev)}
            className="md:hidden bg-transparent border-0 p-1 text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-700 rounded-lg"
            aria-label="Toggle menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
            </svg>
          </button>
          {user ? (
            <div className="hidden sm:flex items-center gap-4">
              <Link to="/dashboard" className="text-white/90 hover:text-white font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-700 rounded-lg px-2 py-1">
                Dashboard
              </Link>
              <span className="text-sm font-medium flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                {user.firstName || user.email.split('@')[0]}
              </span>
              <button
                onClick={handleLogout}
                className="bg-white text-blue-700 hover:bg-blue-50 px-6 py-2 font-bold text-sm tracking-wide transition-colors rounded-lg shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-700"
              >
                LOGOUT
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="hidden sm:inline-flex bg-white text-blue-700 hover:bg-blue-50 px-6 py-2 font-bold text-sm tracking-wide transition-colors rounded-lg shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-700"
            >
              LOGIN
            </Link>
          )}
        </div>
      </div>

      {isMobileOpen && (
        <div className="absolute top-full left-0 right-0 md:hidden bg-gradient-to-r from-blue-600 to-cyan-600 border-t border-white/10 shadow-lg px-4 py-4 space-y-2">
          <a href="/#home" onClick={closeMobileMenu} className="block rounded-lg px-3 py-2 text-white/90 hover:text-white hover:bg-white/10">Home</a>
          <a href="/#services" onClick={closeMobileMenu} className="block rounded-lg px-3 py-2 text-white/90 hover:text-white hover:bg-white/10">Services</a>
          <a href="/#about" onClick={closeMobileMenu} className="block rounded-lg px-3 py-2 text-white/90 hover:text-white hover:bg-white/10">About</a>
          <a href="/#contact" onClick={closeMobileMenu} className="block rounded-lg px-3 py-2 text-white/90 hover:text-white hover:bg-white/10">Contact</a>
          {user ? (
            <>
              <Link to="/dashboard" onClick={closeMobileMenu} className="block rounded-lg px-3 py-2 text-white/90 hover:text-white hover:bg-white/10">Dashboard</Link>
              <button
                type="button"
                onClick={() => {
                  closeMobileMenu();
                  handleLogout();
                }}
                className="w-full bg-white text-blue-700 hover:bg-blue-50 px-5 py-2 font-bold text-sm tracking-wide transition-colors rounded-lg shadow-sm"
              >
                LOGOUT
              </button>
            </>
          ) : (
            <Link
              to="/login"
              onClick={closeMobileMenu}
              className="block w-full text-center bg-white text-blue-700 hover:bg-blue-50 px-5 py-2 font-bold text-sm tracking-wide transition-colors rounded-lg shadow-sm"
            >
              LOGIN
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
