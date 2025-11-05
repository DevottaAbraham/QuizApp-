

import { toast } from 'react-toastify';
import { createBrowserHistory } from 'history';

// Create a history object to allow navigation from outside React components
export const history = createBrowserHistory();

// In a real application, this would come from an environment variable
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://quizapp-backend-nxm7.onrender.com';

fetch(`${API_BASE_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ UserName, password }),
});

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
export const apiFetch = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;

    // CRITICAL: Ensure all API requests include credentials (cookies).
    const fetchOptions = {
        ...options,
        credentials: 'include',
        headers: { ...options.headers },
    };

    try {
        if (options.body instanceof FormData) {
            // Let the browser set the Content-Type for FormData
        } else {
            if (options.body) fetchOptions.headers['Content-Type'] = 'application/json';
        }

        let response = await fetch(url, fetchOptions);

        // If the token is expired (401), try to refresh it.
        if (response.status === 401 && !options.isPublic) {
            if (!isRefreshing) {
                isRefreshing = true;
                // CRITICAL FIX: The refresh call itself is a public endpoint and should not trigger another refresh.
                refreshPromise = apiFetch('/auth/refresh', { method: 'POST', isPublic: true })
                    .then(refreshResponse => {
                        if (!refreshResponse.ok) {
                            // If refresh fails, the session is truly over.
                            // CRITICAL FIX: Redirect based on the role of the stored user, not the current URL path.
                            // This prevents session crossover where an expired admin token redirects a regular user.
                            const storedUser = JSON.parse(localStorage.getItem('currentUser'));
                            clearAuthToken();

                            if (storedUser && storedUser.role === 'ADMIN') {
                                history.push('/admin/login');
                            } else {
                                // Default to user login if no user is stored or if they are a USER.
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
            
            // CRITICAL FIX: Do not show an error toast for the initial, expected 401 on /api/auth/me.
            // This is a normal part of the authentication flow, not a user-facing error.
            if (!(response.status === 401 && endpoint === '/auth/me')) {
                toast.error(errorMessage);
            }
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
    try { // The /api/auth/me endpoint is now accessible to any authenticated user.
        // This single function can now be used reliably across the entire application.
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
    // The AuthContext will handle setting the user state and localStorage
    if (userData) {
        setAuthToken(userData);
    }
    return userData;
};

export const register = async (username, password) => {
    // After registration, the backend automatically logs the user in and sets cookies.
    // The AuthContext will handle setting the user state and localStorage.
    const userData = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
        isPublic: true, // This is a public route
    });
    if (userData) {
        setAuthToken(userData);
    }
    return userData;
};

export const logout = async () => {
    clearAuthToken(); // Immediately clear frontend state for responsiveness
    return await apiFetch('/auth/logout', { method: 'POST' }); // Send logout request to backend
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
export const getActiveQuiz = () => apiFetch('/quizzes/active'); // This was pointing to /admin/quizzes/active
export const submitQuiz = (quizResult) => apiFetch('/quizzes/submit', {
    method: 'POST',
    body: JSON.stringify(quizResult),
});

// Score Service
export const getScoreHistory = () => apiFetch('/scores/history');
export const getScoreDetail = (quizId) => apiFetch(`/scores/history/${quizId}`);
export const getAllScores = () => apiFetch('/admin/scores');
// CRITICAL FIX: The leaderboard is for all users. Point to the public-facing endpoint in ScoreController.
// This was incorrectly pointing to an admin-only endpoint, causing access denied errors for regular users.
export const getLeaderboard = () => apiFetch('/scores/leaderboard');
export const getMonthlyPerformance = () => apiFetch('/admin/scores/monthly-performance');
export const getMyPerformance = () => apiFetch('/scores/my-performance'); // For the logged-in user's own performance

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

// CRITICAL FIX: Ensure userId is explicitly passed and checked to prevent "undefined" string issues.
// If userId is null/undefined, these functions should ideally not be called, or handle it gracefully.
// By explicitly checking and passing a valid ID, we prevent the "undefined" string from reaching the backend.
export const getUserById = (userId) => {
    if (!userId) throw new Error("User ID is required for getUserById.");
    return apiFetch(`/admin/users/${userId}`);
};
export const getScoresForUser = (userId) => {
    if (!userId) throw new Error("User ID is required for getScoresForUser.");
    return apiFetch(`/admin/users/${userId}/scores`);
};
export const getPerformanceForUser = (userId) => {
    if (!userId) throw new Error("User ID is required for getPerformanceForUser.");
    return apiFetch(`/admin/users/${userId}/performance`);
};



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