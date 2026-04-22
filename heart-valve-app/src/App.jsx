import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Overview from './pages/Overview';
import Prediction from './pages/Prediction';
import History from './pages/History';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

// ScrollToTop component to handle scroll restoration and hash scrolling
const ScrollToTop = () => {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
    } else {
      setTimeout(() => {
        const element = document.getElementById(hash.replace('#', ''));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 0);
    }
  }, [pathname, hash]);

  return null;
};

// ProtectedRoute component to redirect unauthenticated users to Login
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const NotFound = () => {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-[#1a2e35] mb-3">404</h1>
        <p className="text-gray-600 mb-6">Page not found.</p>
        <a
          href="/"
          className="inline-flex items-center bg-blue-600 text-white px-5 py-2.5 rounded-md hover:bg-blue-700 transition-colors"
        >
          Go to Home
        </a>
      </div>
    </div>
  );
};

// MainContent handles the routing and page transition animations
const MainContent = () => {
  const location = useLocation();
  
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      
      {/* 
        The key={location.pathname} ensures the div re-renders 
        triggering the animation on every route change 
      */}
      <div key={location.pathname} className="flex-grow animate-fade-in">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/overview" element={<Overview />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/prediction" element={
            <ProtectedRoute>
              <Prediction />
            </ProtectedRoute>
          } />
          <Route path="/history" element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>

      <Footer />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <MainContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
