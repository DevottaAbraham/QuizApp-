

import { toast } from 'react-toastify';
import { createBrowserHistory } from 'history';

// Create a history object to allow navigation from outside React components
export const history = createBrowserHistory();

// In a real application, this would come from an environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

/**
 * Stores the current user's information (without tokens) in localStorage.
 */
export const setAuthToken = (user) => {
    if (user) {
        localStorage.setItem('currentUser', JSON.stringify(user)); // Use the correct key
    } else {
        localStorage.removeItem('currentUser');
    }
};

export const clearAuthToken = () => {
    localStorage.removeItem('currentUser');
};

let isRefreshing = false;
let refreshPromise = null;
/**
 * A generic fetch wrapper to handle API requests, headers, and error handling.
 * @param {string} endpoint The API endpoint to call (e.g., '/auth/login').
 * @param {object} options The options for the fetch call (method, body, etc.).
 * @returns {Promise<any>} A promise that resolves with the JSON response.
 * @throws {Error} Throws an error if the network response is not ok.
 */
// d:\Quize Website Design\QuizApp\QuizApp\src\services\apiServices.js
/**
 * A generic fetch wrapper to handle API requests, headers, and error handling.
 * This version includes automatic JWT refresh logic.
 */
export const apiFetch = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;

    try {
        const headers = { ...options.headers };
        if (options.body instanceof FormData) {
            // Let the browser set the Content-Type for FormData
        } else {
            if (options.body) headers['Content-Type'] = 'application/json';
        }

        const fetchOptions = { ...options, headers, credentials: 'include' };

        let response = await fetch(url, fetchOptions);

        // If the token is expired (401), try to refresh it.
        if (response.status === 401 && !options.isPublic) {
            if (!isRefreshing) {
                isRefreshing = true;
                // Start the refresh process. All subsequent failed requests will wait on this promise.
                refreshPromise = fetch(`${API_BASE_URL}/auth/refresh`, {
                        method: 'POST',
                        credentials: 'include'
                    })
                    .then(refreshResponse => {
                        if (!refreshResponse.ok) {
                            // If refresh fails, the session is truly over.
                            clearAuthToken();
                            // Determine where to redirect based on the current path
                            if (window.location.pathname.startsWith('/admin')) {
                                history.push('/admin/login');
                            } else {
                                history.push('/user/login');
                            }
                            return Promise.reject(new Error("Session expired. Please log in again."));
                        }
                        return refreshResponse.json();
                    })
                    .finally(() => {
                        // Reset the refresh state once done.
                        isRefreshing = false;
                        refreshPromise = null;
                    });
            }

            // Wait for the refresh to complete...
            await refreshPromise;
            // ...then retry the original request. The browser now has the new accessToken cookie.
            response = await fetch(url, fetchOptions);
        }

        if (response.status === 204) return null; // Handle No Content

        if (!response.ok) {
            const data = await response.json().catch(() => ({}));
            const errorMessage = data.message || `HTTP error! Status: ${response.status}`;
            toast.error(errorMessage);
            throw new Error(errorMessage);
        }

        return await response.json();
    } catch (error) {
        // Handle network errors and other exceptions
        if (error.name !== 'AbortError' && !error.message.startsWith('HTTP error')) {
            if (error instanceof TypeError && error.message === 'Failed to fetch') {
                toast.error('Cannot connect to server. Is it running?');
            } else if (!error.message.includes("Session expired")) {
                toast.error(error.message || 'A network error occurred.');
            }
        }
        throw error;
    }
};

/**
 * Fetches the current user's data if a token is available.
 * This should be called when the application initializes to restore the session.
 */
export const getCurrentUser = async () => {
    try {
        // This endpoint will succeed if the cookie is valid, and fail if not.
        return await apiFetch('/auth/me');
    } catch (error) {
        // If the request fails (e.g., 401), it means no valid session exists.
        return null;
    }
};

// ... (other functions)

// --- Admin Question Management Service ---
export const getQuestions = () => apiFetch('/admin/questions');
export const getQuestionById = (questionId) => apiFetch(`/admin/questions/${questionId}`);

// ...

// ✅ This function correctly uses apiFetch to create a question.
export const createQuestion = (questionData) => apiFetch('/admin/questions', {
    method: 'POST',
    body: JSON.stringify(questionData),
});

// ... (other functions)

// --- Exported API Service Functions ---

// Authentication Service
export const login = async (username, password) => {
    const userData = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
        isPublic: true, // This is a public route
    });
    // After a successful login, the backend sets httpOnly cookies.
    // We just need to store the user's info (without tokens) in localStorage.
    if (userData) {
        setAuthToken(userData);
    }
    return userData;
};

export const register = async (username, password) => {
    const userData = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
        isPublic: true, // This is a public route
    });
    // After registration, the backend automatically logs the user in and sets cookies.
    // We store the returned user info in localStorage.
    if (userData) {
        setAuthToken(userData); // Automatically log in the new user
    }
    return userData;
};

export const logout = async () => {
    return await apiFetch('/auth/logout', { method: 'POST' });
};

export const registerAdmin = async (username, password) => {
    // This endpoint is specifically for the initial admin setup.
    return await apiFetch('/auth/register-admin', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
        isPublic: true, // The endpoint is public, but protected by backend logic.
    });
};

export const forgotPasswordGenerateTemp = async (username) => {
    return await apiFetch('/auth/forgot-password-generate-temp', {
        method: 'POST',
        body: JSON.stringify({ username }),
        isPublic: true,
    });
};

export const adminForgotPassword = async (payload) => {
    return await apiFetch('/auth/admin-forgot-password', {
        method: 'POST',
        body: JSON.stringify(payload),
        isPublic: true,
    });
};


export const checkSetupStatus = () => apiFetch('/auth/setup-status', {
    method: 'GET',
    isPublic: true,
});

// Content Service
export const getHomePageContent = () => apiFetch('/content/home');

export const updateHomePageContent = (contentData) => apiFetch('/admin/content/home', {
    method: 'PUT',
    body: JSON.stringify(contentData),
});


// Quiz Service
export const getActiveQuiz = () => apiFetch('/quizzes/active');
export const submitQuiz = (quizResult) => apiFetch('/quizzes/submit', {
    method: 'POST',
    body: JSON.stringify(quizResult),
});

// Score Service
export const getScoreHistory = () => apiFetch('/scores/history');
export const getScoreDetail = (quizId) => apiFetch(`/scores/history/${quizId}`);
export const getAllScores = () => apiFetch('/admin/scores');
export const getLeaderboard = () => apiFetch('/admin/leaderboard'); // Corrected to use the admin-specific endpoint
export const getMonthlyPerformance = () => apiFetch('/admin/scores/monthly-performance');

// Image Upload Service
export const uploadImage = (file) => {
    const formData = new FormData();
    formData.append('image', file);
    return apiFetch('/upload/image', { method: 'POST', body: formData });
};


// --- Admin Dashboard Service ---
export const getDashboardStats = () => apiFetch('/admin/dashboard/stats');

// --- Admin Management Service ---
// Note: These endpoints need to be created in your backend.

export const getUsers = () => apiFetch('/admin/users');

export const createAdmin = (adminData) => apiFetch('/admin/admins', {
    method: 'POST',
    body: JSON.stringify(adminData),
});

export const getAdmins = () => apiFetch('/admin/admins');


export const createUser = (userData) => apiFetch('/admin/users', {
    method: 'POST',
    body: JSON.stringify(userData),
});

export const deleteAdmin = (adminId) => apiFetch(`/admin/admins/${adminId}`, {
    method: 'DELETE',
});

export const deleteUser = (userId) => apiFetch(`/admin/users/${userId}`, {
    method: 'DELETE',
});

export const updateUser = (userId, userData) => apiFetch(`/admin/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
});

export const resetUserPassword = (userId) => apiFetch(`/admin/users/${userId}/reset-password`, {
    method: 'POST',
});

export const forceChangePassword = (payload) => apiFetch('/auth/force-change-password', {
    method: 'POST',
    body: JSON.stringify(payload),
});

export const getUserById = (userId) => apiFetch(`/admin/users/${userId}`);

export const getScoresForUser = (userId) => apiFetch(`/admin/users/${userId}/scores`);

export const getPerformanceForUser = (userId) => apiFetch(`/admin/users/${userId}/performance`);



export const updateQuestion = (questionId, questionData) => apiFetch(`/admin/questions/${questionId}`, {
    method: 'PUT',
    body: JSON.stringify(questionData),
});

export const deleteQuestion = (questionId) => apiFetch(`/admin/questions/${questionId}`, {
    method: 'DELETE',
});

export const publishQuestion = (questionId, payload) => {
    if (questionId === 'bulk') {
        return apiFetch(`/admin/questions/bulk/publish`, {
            method: 'POST',
            body: JSON.stringify(payload),
        });
    }
    return apiFetch(`/admin/questions/${questionId}/publish`, { method: 'POST', body: JSON.stringify(payload) });
};

export const deleteAllPublishedQuestions = () => apiFetch('/admin/questions/published', {
    method: 'DELETE',
});