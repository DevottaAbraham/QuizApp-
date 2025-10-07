import { toast } from 'react-toastify';
import * as api from '../../services/apiServices';

// This is now a mock service that uses localStorage.
// const API_URL = import.meta.env.VITE_API_URL;

/**
 * Logs in an admin by calling the backend API.
 * @param {string} username The admin's username.
 * @param {string} password The admin's password.
 * @returns {Promise<Object|null>} A promise that resolves with the admin object or null if login fails.
 */
export const loginAdmin = async (username, password) => {
    try {
        // We use the same login endpoint for both users and admins.
        const adminData = await api.login(username, password);
        
        // The backend controls who is an admin. We check the role here.
        if (adminData && adminData.role === 'ADMIN') {
            return adminData;
        } else {
            // If the user is not an admin, deny access.
            toast.error("Access Denied: You do not have admin privileges.");
            return null;
        }
    } catch (error) {
        // The apiService will show a toast for network or credential errors.
        // We catch the error here so it doesn't propagate up and crash the component.
        console.error("Admin login API error:", error);
        return null; // Return null on any kind of login failure.
    }
};