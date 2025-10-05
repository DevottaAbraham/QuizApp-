import { toast } from 'react-toastify';
/**
 * Simulates a login request to the backend.
 * @param {string} username The user's username.
 * @param {string} password The user's password.
 * @returns {Promise<Object|null>} A promise that resolves with the user object or null if login fails.
 */
export const login = async (username, password) => {
    try {
        const usersCache = JSON.parse(localStorage.getItem("quizUsers")) || [];
        const foundUser = usersCache.find(user => user.username.toLowerCase() === username.toLowerCase() && user.password === password);

        if (!foundUser) {
            toast.error("Invalid username or password. Please contact an admin for credentials.");
            return null;
        }
        return foundUser; // Return the full user object
    } catch (error) {
        console.error("Login error:", error);
        toast.error("An unexpected error occurred during login.");
        throw error;
    }
};

/**
 * Simulates a registration request to the backend.
 * @param {string} username The desired username.
 * @param {string} password The generated password.
 * @returns {Promise<Object|null>} A promise that resolves with the new user object or null if registration fails.
 */
export const register = async (username, password) => {
    try {
        const usersCache = JSON.parse(localStorage.getItem("quizUsers")) || [];
        if (usersCache.some(user => user.username.toLowerCase() === username.toLowerCase())) {
            toast.error("Username already exists. Please choose a different one.");
            return null;
        }

        const userIdPrefix = username.substring(0, 4).toLowerCase().replace(/\s+/g, '');
        const userId = `${userIdPrefix}_${Date.now()}`;
        const newUser = { userId, username, password };
        usersCache.push(newUser);
        localStorage.setItem("quizUsers", JSON.stringify(usersCache));
        // Notify other parts of the app that users have been updated
        window.dispatchEvent(new Event('storageUpdated'));

        return newUser;
    } catch (error) {
        console.error("Registration error:", error);
        toast.error("An unexpected error occurred during registration.");
        throw error;
    }
};