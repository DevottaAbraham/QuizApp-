import React, { createContext, useContext, useState } from 'react';
import { setAuthToken, clearAuthToken } from '../services/apiServices';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Always start with no user authenticated. This will force a login.
  const [authenticatedUser, setAuthenticatedUser] = useState(() => {
    // By returning null, we ensure the app always starts at the login screen.
    return null;
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