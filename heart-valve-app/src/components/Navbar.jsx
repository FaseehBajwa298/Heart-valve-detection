import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      if (location.pathname === '/') {
        const sections = ['home', 'services', 'about', 'contact'];
        
        // Default to home if at the very top
        if (window.scrollY < 100) {
          setActiveSection('home');
          return;
        }

        for (const section of sections) {
          const element = document.getElementById(section);
          if (element) {
            const rect = element.getBoundingClientRect();
            // Check if top of section is near the navbar (approx 100px-150px offset)
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
    // Call once to set initial state
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getLinkClass = (section) => {
    return activeSection === section 
      ? "bg-blue-600 text-white px-4 py-2 rounded-sm transition-all duration-300" 
      : "text-white hover:text-blue-100 px-4 py-2 rounded-sm transition-all duration-300";
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#4C9BF5] text-white px-4 py-4 md:px-12 flex justify-between items-center shadow-md">
      {/* Logo Section */}
      <div className="flex items-center gap-2">
        <img src="/Logo.png" alt="Medilife Logo" className="h-10 md:h-12" />
      </div>

      {/* Navigation Links */}
      <div className="hidden md:flex items-center space-x-4 text-sm font-medium">
        <a href="/#home" className={getLinkClass('home')}>Home</a>
        <a href="/#services" className={getLinkClass('services')}>Services</a>
        <a href="/#about" className={getLinkClass('about')}>About Us</a>
        <a href="/#contact" className={getLinkClass('contact')}>Contact</a>
      </div>

      {/* Right Section: Login & Emergency */}
      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="text-white hover:text-blue-100 font-medium">Dashboard</Link>
            <span className="text-sm font-medium">{user.email}</span>
            <button 
              onClick={handleLogout}
              className="bg-white text-[#4C9BF5] hover:bg-gray-100 px-6 py-2 font-bold text-sm tracking-wide transition-colors rounded-sm"
            >
              LOGOUT
            </button>
          </div>
        ) : (
          <Link to="/login" className="bg-white text-[#4C9BF5] hover:bg-gray-100 px-6 py-2 font-bold text-sm tracking-wide transition-colors rounded-sm">
            LOGIN
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
