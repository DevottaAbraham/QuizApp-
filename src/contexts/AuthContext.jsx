import React, { createContext, useContext, useState, useEffect } from 'react';
import { setAuthToken, clearAuthToken, getCurrentUser as apiGetCurrentUser } from '../services/apiServices'; // Renamed to avoid conflict

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    // Start with a loading state and try to get user from localStorage as an initial guess
    const [currentUser, setCurrentUser] = useState(() => {
        try {
            const item = window.localStorage.getItem('currentUser');
            return item ? JSON.parse(item) : null;
        } catch (error) {
            return null;
        }
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const initializeAuth = async () => {
            setLoading(true); // Ensure loading is true at the start of initialization
            try {
                // Check for a valid session on the backend
                const user = await apiGetCurrentUser(); // Call the imported getCurrentUser
                if (user) {
                    setAuthToken(user);
                    setCurrentUser(user);
                } else {
                    // No valid session, clear frontend state
                    clearAuthToken();
                    setCurrentUser(null);
                }
            } catch (error) {
                // API call failed (e.g., network error, server down)
                clearAuthToken();
                setCurrentUser(null);
            } finally {
                setLoading(false);
            }
        };

        initializeAuth();
    }, []);

    const value = { currentUser, setCurrentUser, loading };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);