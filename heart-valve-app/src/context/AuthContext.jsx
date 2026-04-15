import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for existing user session
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = (email, password) => {
    // Check if user exists in our mock "database" (localStorage)
    const storedUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const foundUser = storedUsers.find(u => u.email === email && u.password === password);

    if (foundUser) {
      const sessionUser = { email: foundUser.email, firstName: foundUser.firstName };
      setUser(sessionUser);
      localStorage.setItem('user', JSON.stringify(sessionUser));
      return { success: true };
    } else {
      return { success: false, message: 'Invalid email or password' };
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const signup = (userData) => {
    const { email, password, firstName, lastName } = userData;
    const storedUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    
    if (storedUsers.some(u => u.email === email)) {
      return { success: false, message: 'User already exists with this email' };
    }

    const newUser = { email, password, firstName, lastName };
    storedUsers.push(newUser);
    localStorage.setItem('registeredUsers', JSON.stringify(storedUsers));

    // Also log them in automatically
    const sessionUser = { email, firstName };
    setUser(sessionUser);
    localStorage.setItem('user', JSON.stringify(sessionUser));
    
    return { success: true };
  };

  const value = {
    user,
    login,
    logout,
    signup
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
