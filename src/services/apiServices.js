import { toast } from 'react-toastify';

// In a real application, this would come from an environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api';

/**
 * A helper function to get the current user's auth token from localStorage.
 * In a real app, you might store this in a more secure way or in memory.
 * @returns {string|null} The auth token or null if not found.
 */
const getAuthToken = () => {
    // Check for either a regular user or an admin token
    const userString = localStorage.getItem("currentUser");
    const adminString = localStorage.getItem("currentAdmin");

    const user = userString ? JSON.parse(userString) : null;
    const admin = adminString ? JSON.parse(adminString) : null;
    return user?.token || admin?.token || null;
};

/**
 * A generic fetch wrapper to handle API requests, headers, and error handling.
 * @param {string} endpoint The API endpoint to call (e.g., '/auth/login').
 * @param {object} options The options for the fetch call (method, body, etc.).
 * @returns {Promise<any>} A promise that resolves with the JSON response.
 * @throws {Error} Throws an error if the network response is not ok.
 */
export const apiFetch = async (endpoint, options = {}) => {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = getAuthToken();

    const defaultHeaders = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    };

    if (token) {
        defaultHeaders['Authorization'] = `Bearer ${token}`;
    }

    const config = {
        ...options,
        headers: {
            ...defaultHeaders,
            ...options.headers,
        },
    };

    try {
        const response = await fetch(url, config);

        if (!response.ok) {
            // Try to parse error details from the response body
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            const errorMessage = errorData.message || `Request failed with status ${response.status}`;
            toast.error(errorMessage);
            throw new Error(errorMessage);
        }

        // Handle responses with no content
        if (response.status === 204) {
            return null;
        }

        return await response.json();
    } catch (error) {
        console.error(`API Fetch Error (${endpoint}):`, error);
        // If the error is a TypeError, it's a network-level failure (e.g., server is down).
        // The custom error from the `!response.ok` block is a regular Error, not a TypeError.
        if (error instanceof TypeError) {
            toast.error('A network error occurred. Please try again.');
        }
        throw error;
    }
};

// --- Exported API Service Functions ---

// Authentication Service
export const login = (username, password) => apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
});

export const register = (username, password) => apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
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

// --- Admin Question Management Service ---
export const getQuestions = () => apiFetch('/admin/questions');

export const getQuestionById = (questionId) => apiFetch(`/admin/questions/${questionId}`);

export const createQuestion = (questionData) => apiFetch('/admin/questions', {
    method: 'POST',
    body: JSON.stringify(questionData),
});

export const updateQuestion = (questionId, questionData) => apiFetch(`/admin/questions/${questionId}`, {
    method: 'PUT',
    body: JSON.stringify(questionData),
});

export const deleteQuestion = (questionId) => apiFetch(`/admin/questions/${questionId}`, {
    method: 'DELETE',
});
