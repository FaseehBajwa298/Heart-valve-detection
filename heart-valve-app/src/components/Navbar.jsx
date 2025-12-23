import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#4C9BF5] text-white px-4 py-4 md:px-12 flex justify-between items-center shadow-md">
      {/* Logo Section */}
      <div className="flex items-center gap-2">
        <img src="/Logo.png" alt="Medilife Logo" className="h-10 md:h-12" />
      </div>

      {/* Navigation Links */}
      <div className="hidden md:flex items-center space-x-8 text-sm font-medium">
        <Link to="/" className="bg-blue-600 text-white px-4 py-2 rounded-sm">Home</Link>
        <a href="/#about" className="text-white hover:text-blue-100 transition">About Us</a>
        <a href="/#services" className="text-white hover:text-blue-100 transition">Services</a>
        <a href="/#contact" className="text-white hover:text-blue-100 transition">Contact</a>
      </div>

      {/* Right Section: Login & Emergency */}
      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-4">
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
