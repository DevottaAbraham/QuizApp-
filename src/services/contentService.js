
import { apiFetch } from './apiServices';

/**
 * Fetches the content for the home page from the API.
 * @returns {Promise<Object>} A promise that resolves with the home page content.
 */
export const getHomePageContent = async () => {
    return apiFetch('/api/content/home');
};
