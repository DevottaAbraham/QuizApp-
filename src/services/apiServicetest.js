import * as api from './apiService';
import { toast } from 'react-toastify';
import { vi } from 'vitest';

describe('apiService', () => {
  // Clear all mocks before each test
  beforeEach(() => {
    // Instead of resetMocks, we use mockClear for vi mocks
    vi.mocked(fetch).mockClear();
    vi.mocked(toast.error).mockClear();
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
      expect(fetch).toHaveBeenCalledWith('http://localhost:8081/api/content/home', expect.any(Object));
      expect(data).toEqual(mockData);
    });

    it('should handle a 204 No Content response', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        status: 204,
        json: async () => null,
      });

      const data = await api.dismissNotice('notice-123');

      expect(fetch).toHaveBeenCalledTimes(1);
      expect(data).toBeNull();
    });

    it('should handle network errors and throw an exception', async () => {
      const errorMessage = 'API is down';
      vi.mocked(fetch).mockRejectedValue(new Error(errorMessage));

      // We expect this function to throw an error
      await expect(api.getNotices()).rejects.toThrow(errorMessage);

      expect(toast.error).toHaveBeenCalledWith('A network error occurred. Please try again.');
    });

    it('should handle non-ok responses (e.g., 404, 500) and throw an error', async () => {
      const errorResponse = { message: 'Not Found' };
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 404,
        json: async () => errorResponse,
      });

      await expect(api.getScoreDetail('non-existent-id')).rejects.toThrow('Not Found');

      expect(toast.error).toHaveBeenCalledWith('Not Found');
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
        'http://localhost:8081/api/auth/login',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ username: 'test', password: 'password' }),
        })
      );
      expect(result).toEqual(mockUser);
    });

    it('should include Authorization header if a token is in sessionStorage', async () => {
      // Mock sessionStorage to simulate a logged-in user
      sessionStorage.setItem('authToken', 'my-secret-token');

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => [], // Mock response for getScoreHistory
      });

      await api.getScoreHistory();

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer my-secret-token',
          }),
        })
      );

      // Clean up sessionStorage mock
      sessionStorage.removeItem('authToken');
    });

    it('should NOT include Authorization header if no token exists', async () => {
      sessionStorage.removeItem('authToken');

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => ({}),
      });

      await api.getHomePageContent();

      const fetchOptions = fetch.mock.calls[0][1];
      expect(fetchOptions.headers.Authorization).toBeUndefined();
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
        'http://localhost:8081/api/quizzes/submit',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(quizResult),
        })
      );
    });
  });
});
