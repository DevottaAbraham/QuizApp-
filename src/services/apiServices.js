

import { toast } from 'react-toastify';

// In a real application, this would come from an environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

/**
 * Securely stores and retrieves the authentication token from localStorage.
 * localStorage persists even after the browser is closed.
 */
export const setAuthToken = (user) => {
    if (user && user.token) {
        localStorage.setItem('token', user.token);
        localStorage.setItem('userRole', user.role);
    } else {
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
    }
};

export const clearAuthToken = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
};

/**
 * A generic fetch wrapper to handle API requests, headers, and error handling.
 * @param {string} endpoint The API endpoint to call (e.g., '/auth/login').
 * @param {object} options The options for the fetch call (method, body, etc.).
 * @returns {Promise<any>} A promise that resolves with the JSON response.
 * @throws {Error} Throws an error if the network response is not ok.
 */
// d:\Quize Website Design\QuizApp\QuizApp\src\services\apiServices.js

// ... (other functions)

/**
 * A generic fetch wrapper to handle API requests, headers, and error handling.
 */
export const apiFetch = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;

    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        ...options.headers,
    };

    // ✅ This block automatically adds the token for you!
    if (!options.isPublic) {
        const token = localStorage.getItem('token');
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }
    }
    
    const config = {
        ...options,
        headers,
    };

    try {
        const response = await fetch(url, config);

        // Check if the response is successful
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            const errorMessage = errorData.message || `HTTP error! status: ${response.status}`;
            toast.error(errorMessage);
            throw new Error(errorMessage);
        }

        // If the response is OK, parse and return the JSON
        return await response.json();

    } catch (error) {
        toast.error(error.message || 'A network error occurred.');
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
    if (userData && userData.token) {
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

    if (adminData && adminData.token) {
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
    if (userData && userData.token) {
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
export const dismissAllNotices = () => apiFetch('/notices/dismiss-all', { method: 'POST' });
export const createNotice = (noticeData) => apiFetch('/admin/notices', {
    method: 'POST',
    body: JSON.stringify(noticeData),
});
export const deleteNotice = (noticeId) => apiFetch(`/admin/notices/${noticeId}`, {
    method: 'DELETE',
});



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