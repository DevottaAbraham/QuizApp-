import { vi } from 'vitest';

// Mock the global fetch function
global.fetch = vi.fn();

// Mock the 'react-toastify' module to prevent actual toasts during tests
vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
  },
}));
it('should include Authorization header if a token is in sessionStorage', async () => {
  // Mock sessionStorage to simulate a logged-in user
  sessionStorage.setItem('authToken', 'my-secret-token');
});