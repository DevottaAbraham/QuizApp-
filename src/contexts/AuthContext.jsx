import React, { createContext, useContext, useState } from 'react';
import { setAuthToken, clearAuthToken } from '../services/apiServices';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [authenticatedUser, setAuthenticatedUser] = useState(() => {
    const storedUser = localStorage.getItem('currentUser');
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const setUser = (user) => {
    if (user) {
      setAuthToken(user);
    } else {
      clearAuthToken();
    }
    setAuthenticatedUser(user);
  };

  const logout = () => setUser(null);

  const value = { authenticatedUser, setUser, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);