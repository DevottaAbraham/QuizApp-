import { toast } from 'react-toastify';

/**
 * Simulates a login request to the backend.
 * @param {string} username The user's username.
 * @param {string} password The user's password.
 * @returns {Promise<Object|null>} A promise that resolves with the user object or null if login fails.
 */
export const login = async (username, password) => {
    try {
        const quizUsers = JSON.parse(localStorage.getItem("quizUsers")) || [];
        const foundUser = quizUsers.find(user => user.username.toLowerCase() === username.toLowerCase() && user.password === password);

        if (!foundUser) {
            toast.error("Invalid username or password. Please contact an admin for credentials.");
            return null;
        }
        return { userId: foundUser.userId, username: foundUser.username };
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
        const userId = `user_${Date.now()}`;
        let quizUsers = JSON.parse(localStorage.getItem("quizUsers")) || [];

        if (quizUsers.some(user => user.username.toLowerCase() === username.toLowerCase())) {
            toast.error("Username already exists. Please choose a different one.");
            return null;
        }

        const newUser = { userId, username, password };
        quizUsers.push(newUser);
        localStorage.setItem("quizUsers", JSON.stringify(quizUsers));

        return { userId, username };
    } catch (error) {
        console.error("Registration error:", error);
        toast.error("An unexpected error occurred during registration.");
        throw error;
    }
};