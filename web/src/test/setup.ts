import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock Firebase Auth and AppCheck
vi.mock('../lib/firebase', () => ({
  auth: {
    currentUser: null,
  },
  db: {},
  appCheck: {},
}));

vi.mock('firebase/app-check', () => ({
  getToken: vi.fn().mockResolvedValue({ token: 'mock-app-check-token' }),
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
