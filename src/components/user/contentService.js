import { toast } from 'react-toastify';

const defaultContent = {
    title: 'Welcome to the Bible Quiz!',
    lead: 'Test your knowledge and grow in faith.'


};

/**
 * Fetches the content for the user home page.
 * Currently simulates an API call by fetching from localStorage.
 * @returns {Promise<Object>} A promise that resolves with the home page content.
 */
export const getHomePageContent = async () => {
    // In a real app, this would be a fetch() call to your backend API.
    // For now, we'll read from localStorage.
    const savedContent = localStorage.getItem('userHomePageContent');
    return savedContent ? JSON.parse(savedContent) : defaultContent;
};
