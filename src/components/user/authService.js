import * as api from '../../services/apiServices';

/**
 * Makes a login request to the backend API.
 * @param {string} username The user's username.
 * @param {string} password The user's password.
 * @returns {Promise<Object|null>} A promise that resolves with the user object or null if login fails.
 */
export const login = (username, password) => {
    // The actual API call is now in apiService.js
    // The apiFetch wrapper will handle errors and toasts.
    return api.login(username, password);
};

/**
 * Makes a registration request to the backend API.
 * @param {string} username The desired username.
 * @param {string} password The generated password.
 * @returns {Promise<Object|null>} A promise that resolves with the new user object or throws an error if registration fails.
 */
export const register = (username, password) => {
    // The actual API call is now in apiService.js
    // The apiFetch wrapper will handle errors and toasts.
    // We don't need to dispatch 'storageUpdated' because a real app
    // would refetch data or rely on the backend's response.
    return api.register(username, password);
};