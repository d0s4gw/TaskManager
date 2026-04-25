"use client";

import React, { createContext, useContext, useEffect, useState } from 'react';

/** Declare the E2E test hook global. Set by Playwright's addInitScript. */
declare global {
  interface Window {
    __E2E_MOCK_USER__?: {
      uid: string;
      email: string;
      displayName: string;
      photoURL: string;
    };
  }
}
import { 
  User, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { logger } from '../lib/logger';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  loginWithMock: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Agent/Dev shortcut: check query param or local storage
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      const params = new URLSearchParams(window.location.search);
      if (params.has('agentLogin') || localStorage.getItem('agentLogin') === 'true') {
        logger.info('Auto-triggering mock login for agent/dev mode');
        loginWithMock();
        setLoading(false);
        return;
      }
    }

    // E2E test shortcut: if a mock user is injected, use it directly
    if (typeof window !== 'undefined' && window.__E2E_MOCK_USER__) {
      const mock = window.__E2E_MOCK_USER__;
      logger.info('Using E2E mock user', { userId: mock.uid });
      setUser({
        ...mock,
        getIdToken: () => Promise.resolve('e2e-mock-firebase-id-token'),
      } as unknown as User);
      setLoading(false);
      return;
    }

    // Guard: if Firebase auth is a dummy object (no credentials), stop loading
    if (!auth || !('onAuthStateChanged' in auth)) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      logger.info('Auth state changed', { userId: user?.uid });
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      logger.error('Error signing in with Google', { error });
    }
  };

  const loginWithMock = () => {
    if (process.env.NODE_ENV !== 'development') return;
    
    const mockUser = {
      uid: 'mock-user-123',
      email: 'agent@test.com',
      displayName: 'Agent Gemini',
      photoURL: 'https://lh3.googleusercontent.com/a/mock',
      getIdToken: () => Promise.resolve('e2e-mock-firebase-id-token'),
    } as unknown as User;
    
    logger.info('Manually triggering mock login');
    setUser(mockUser);
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      logger.error('Error signing out', { error });
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginWithGoogle, loginWithMock, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
