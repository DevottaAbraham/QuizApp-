import * as api from './apiServices.js';
import alertService from './alertService';
import { vi } from 'vitest';

describe('apiService', () => {
  // Clear all mocks before each test
  beforeEach(() => {
    // Instead of resetMocks, we use mockClear for vi mocks
    vi.mocked(fetch).mockClear();
    vi.mocked(alertService.error).mockClear();
  });

  describe('apiFetch generic wrapper', () => {
    it('should successfully fetch data for a GET request', async () => {
      const mockData = { message: 'Success' };
      // Vitest's way of mocking a successful fetch response
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockData,
      });

      const data = await api.getHomePageContent();

      expect(fetch).toHaveBeenCalledTimes(1);
      // CRITICAL FIX: Do not test against a hardcoded absolute URL.
      // Instead, verify that fetch is called with a URL that ENDS WITH the correct endpoint.
      // This makes the test environment-agnostic.
      expect(fetch).toHaveBeenCalledWith(expect.stringMatching(/\/api\/content\/home$/), expect.any(Object));
      expect(data).toEqual(mockData);
    });

    it('should handle a 204 No Content response', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        status: 204,
        json: async () => null,
      });

      const data = await api.deleteUser('user-123');

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(data).toBeNull();
    });

    it('should handle network errors and throw an exception', async () => {
      const errorMessage = 'API is down';
      vi.mocked(fetch).mockRejectedValue(new Error(errorMessage));

      // We expect this function to throw an error
      await expect(api.getUsers()).rejects.toThrow(errorMessage);

      expect(alertService.error).toHaveBeenCalledWith('Error', 'A network error occurred.');
    });

    it('should handle non-ok responses (e.g., 404, 500) and throw an error', async () => {
      const errorResponse = { message: 'Not Found' };
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => errorResponse,
      });

      await expect(api.getScoreDetail('non-existent-id')).rejects.toThrow('Not Found');

      expect(alertService.error).toHaveBeenCalledWith('API Error', 'Not Found');
    });
  });

  describe('Authentication', () => {
    it('should send username and password on login', async () => {
      const mockUser = { id: 1, username: 'test', token: 'fake-token' };
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockUser,
      });

      const result = await api.login('test', 'password');

      expect(fetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/auth\/login$/),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ username: 'test', password: 'password' }),
        })
      );
      expect(result).toEqual(mockUser);
    });

    it('should always include credentials to send httpOnly cookies', async () => {
      // This test verifies that all authenticated requests are sent with cookies.
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => [], // Mock response for getScoreHistory
      });

      await api.getScoreHistory();
      
      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          // This is the key to cookie-based authentication
          credentials: 'include',
        })
      );
    });

    it('should also include credentials for public routes', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });

      await api.getHomePageContent();
      
      const fetchOptions = vi.mocked(fetch).mock.calls[0][1];
      expect(fetchOptions.credentials).toBe('include');
    });
  });

  describe('Quiz Service', () => {
    it('should correctly submit quiz results via POST', async () => {
      const quizResult = { score: 8, total: 10, answers: [] };
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({ message: 'Score saved' }),
      });

      await api.submitQuiz(quizResult);

      expect(fetch).toHaveBeenCalledWith(
        expect.stringMatching(/\/api\/quizzes\/submit$/),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(quizResult),
        })
      );
    });
  });
});
