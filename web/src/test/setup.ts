import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Firebase Auth
vi.mock('../lib/firebase', () => ({
  auth: {
    currentUser: null,
  },
}));

// Mock AuthContext
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: null,
    loading: false,
    loginWithGoogle: vi.fn(),
    logout: vi.fn(),
  }),
}));
