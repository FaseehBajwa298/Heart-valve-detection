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
