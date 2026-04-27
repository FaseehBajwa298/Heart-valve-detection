import React, { useEffect, useMemo, useRef, useState } from 'react';
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
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  const displayName = useMemo(() => {
    if (!user) return '';
    const first = String(user.firstName || '').trim();
    if (first) return first;
    const email = String(user.email || '').trim();
    return email ? email.split('@')[0] : 'User';
  }, [user]);

  const displayEmail = useMemo(() => {
    if (!user) return '';
    return String(user.email || '').trim();
  }, [user]);

  const avatarLetter = useMemo(() => {
    const ch = (displayName || displayEmail || 'U').trim()[0] || 'U';
    return ch.toUpperCase();
  }, [displayName, displayEmail]);

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

  useEffect(() => {
    const onMouseDown = (e) => {
      if (!isUserMenuOpen) return;
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setIsUserMenuOpen(false);
      }
    };
    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        setIsUserMenuOpen(false);
      }
    };
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isUserMenuOpen]);

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
            <div className="hidden sm:flex items-center gap-3">
              <div className="relative" ref={userMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen((v) => !v)}
                  className="flex items-center gap-2 rounded-full bg-white/10 px-2 py-1 hover:bg-white/15 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-blue-700"
                  aria-haspopup="menu"
                  aria-expanded={isUserMenuOpen}
                >
                  <div className="h-7 w-7 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
                    {avatarLetter}
                  </div>
                  <div className="hidden md:flex flex-col items-start leading-tight">
                    <div className="text-xs font-semibold text-white">{displayName}</div>
                    <div className="text-[10px] text-white/80">{displayEmail}</div>
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white/90" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" clipRule="evenodd" />
                  </svg>
                </button>

                {isUserMenuOpen && (
                  <div
                    className="absolute right-0 mt-2 w-72 overflow-hidden rounded-xl border border-white/20 bg-white text-gray-900 shadow-xl"
                    role="menu"
                  >
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="text-sm font-semibold">{displayName}</div>
                      <div className="text-xs text-gray-600 break-all">{displayEmail}</div>
                    </div>
                    <div className="py-2">
                      <Link
                        to="/dashboard"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm hover:bg-gray-50"
                        role="menuitem"
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/prediction"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm hover:bg-gray-50"
                        role="menuitem"
                      >
                        Prediction
                      </Link>
                      <Link
                        to="/history"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="block px-4 py-2 text-sm hover:bg-gray-50"
                        role="menuitem"
                      >
                        History
                      </Link>
                    </div>
                    <div className="border-t border-gray-100 py-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          handleLogout();
                        }}
                        className="w-full text-left px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                        role="menuitem"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
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
              <Link to="/prediction" onClick={closeMobileMenu} className="block rounded-lg px-3 py-2 text-white/90 hover:text-white hover:bg-white/10">Prediction</Link>
              <Link to="/history" onClick={closeMobileMenu} className="block rounded-lg px-3 py-2 text-white/90 hover:text-white hover:bg-white/10">History</Link>
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
