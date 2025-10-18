

import { toast } from 'react-toastify';

// In a real application, this would come from an environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

/**
 * Securely stores and retrieves the authentication token from localStorage.
 * localStorage persists even after the browser is closed.
 */
export const setAuthToken = (user) => {
    if (user && user.accessToken && user.refreshToken) {
        localStorage.setItem('accessToken', user.accessToken);
        localStorage.setItem('refreshToken', user.refreshToken);
        localStorage.setItem('currentUser', JSON.stringify(user)); // Use the correct key
    } else {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('currentUser');
    }
};

export const clearAuthToken = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentUser');
};

let isRefreshing = false;
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
 */
export const apiFetch = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    let accessToken = localStorage.getItem("accessToken");

    try {
        const headers = { ...options.headers };

        // Handle FormData vs JSON
        if (options.body instanceof FormData) {
            // Let the browser set the Content-Type for FormData
        } else {
            if (options.body) headers['Content-Type'] = 'application/json';
        }

        if (accessToken && !options.isPublic) {
            headers['Authorization'] = `Bearer ${accessToken}`;
        }

        let response = await fetch(url, { ...options, headers });

        if (response.status === 401 && !options.isPublic && !isRefreshing) {
            isRefreshing = true;
            const refreshToken = localStorage.getItem("refreshToken");
            if (!refreshToken) {
                clearAuthToken();
                window.location.href = '/admin/login';
                throw new Error("Session expired. Please log in again.");
            }

            try {
                const refreshResponse = await fetch(`${API_BASE_URL}/auth/refresh`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ refreshToken }),
                });

                if (refreshResponse.ok) {
                    const { accessToken: newAccessToken } = await refreshResponse.json();
                    localStorage.setItem('accessToken', newAccessToken);
                    // Retry the original request with the new token
                    headers['Authorization'] = `Bearer ${newAccessToken}`;
                    response = await fetch(url, { ...options, headers });
                } else {
                    clearAuthToken();
                    window.location.href = '/admin/login';
                    throw new Error("Session expired. Please log in again.");
                }
            } finally {
                isRefreshing = false;
            }
        }

        if (response.status === 204) return null; // Handle No Content

        const data = await response.json();

        if (!response.ok) {
            const errorMessage = data.message || `HTTP error! Status: ${response.status}`;
            toast.error(errorMessage);
            throw new Error(errorMessage);
        }
        return data;
    } catch (error) {
        if (error.name !== 'AbortError' && !error.message.startsWith('HTTP error')) {
            // Avoid duplicate toasts if we already showed a session expired message
            if (error instanceof TypeError && error.message === 'Failed to fetch') {
                toast.error('Cannot connect to server. Is it running?');
            } else if (!error.message.includes("Session expired")) {
                toast.error(error.message || 'A network error occurred.');
            }
        }
        throw error;
    }
};

// ... (other functions)

// --- Admin Question Management Service ---
export const getQuestions = () => apiFetch('/admin/questions');

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
    if (userData && userData.accessToken) {
        setAuthToken(userData); // Pass the entire user object
    }
    return userData;
};

export const adminLogin = async (username, password) => {
    // Call the single, correct login endpoint: /api/auth/login
    // The backend will return the user's roles, which the frontend uses for authorization.
    const adminData = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
        isPublic: true, // This is a public route
    });

    if (adminData && adminData.accessToken) {
        setAuthToken(adminData); // Pass the entire admin object
    }
    return adminData;
};

export const register = async (username, password) => {
    const userData = await apiFetch('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
        isPublic: true, // This is a public route
    });
    if (userData && userData.accessToken) {
        setAuthToken(userData); // Automatically log in the new user
    }
    return userData;
};

/**
 * Registers a new admin user. This should be used carefully,
 * ideally only by a super-admin or through a secure, initial setup process.
 */
export const adminRegister = async (username, password) => {
    const adminData = await apiFetch('/auth/admin/register', {
        method: 'POST',
        body: JSON.stringify({ username, password }),
        isPublic: true, // Registration should be public but protected by other means on the backend
    });
    // Do not automatically log in after admin registration for security.
    return adminData;
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
export const getLeaderboard = () => apiFetch('/scores/leaderboard');

// Notice Service
export const getNotices = () => apiFetch('/notices');
export const dismissNotice = (noticeId) => apiFetch(`/notices/${noticeId}/dismiss`, { method: 'POST' });
export const getAdminNotices = () => apiFetch('/admin/notices');
export const dismissAllNotices = () => apiFetch('/notices/dismiss-all', { method: 'POST' });
export const createNotice = (noticeData) => apiFetch('/admin/notices', {
    method: 'POST', body: noticeData });
export const deleteNotice = (noticeId) => apiFetch(`/admin/notices/${noticeId}`, {
    method: 'DELETE',
});

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

export const createUser = (userData) => apiFetch('/admin/users', {
    method: 'POST',
    body: JSON.stringify(userData),
});

export const deleteUser = (userId) => apiFetch(`/admin/users/${userId}`, {
    method: 'DELETE',
});

export const updateUser = (userId, userData) => apiFetch(`/admin/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(userData),
});



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