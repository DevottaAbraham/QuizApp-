import { vi } from 'vitest';

// Mock the global fetch function
global.fetch = vi.fn();

// Mock the alertService to prevent actual alerts during tests
vi.mock('./alertService', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));
