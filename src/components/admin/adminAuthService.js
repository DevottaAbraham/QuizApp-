import { toast } from 'react-toastify';

// This is now a mock service that uses localStorage.
// const API_URL = import.meta.env.VITE_API_URL;

/**
 * Simulates logging in an admin by checking localStorage.
 * @param {string} email The admin's email.
 * @param {string} password The admin's password.
 * @returns {Promise<Object|null>} A promise that resolves with the admin object or null if login fails.
 */
export const loginAdmin = async (email, password) => {
    try {
        const admins = JSON.parse(localStorage.getItem("quizAdmins")) || [];
        const foundAdmin = admins.find(
            admin => admin.email.toLowerCase() === email.toLowerCase() && admin.password === password
        );

        if (foundAdmin) {
            // Return the found admin object, which includes email and role
            return foundAdmin;
        } else {
            toast.error("Invalid credentials. Please try again.");
            return null;
        }
    } catch (error) {
        console.error("Admin login error:", error);
        toast.error("An unexpected error occurred during login.");
        throw error;
    }
};