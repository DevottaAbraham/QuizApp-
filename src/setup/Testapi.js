import { vi } from 'vitest';

// Mock the global fetch function
global.fetch = vi.fn();

// Mock the 'react-toastify' module to prevent actual toasts during tests
vi.mock('react-toastify', () => ({
  toast: {
    error: vi.fn(),
  },
}));
