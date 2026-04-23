import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import Auth from '../Auth';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup } from 'firebase/auth';

// Mock Firebase Auth
vi.mock('firebase/auth', () => ({
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signInWithPopup: vi.fn(),
  getAuth: vi.fn(),
  GoogleAuthProvider: vi.fn()
}));

vi.mock('../../firebase', () => ({
  auth: {},
  googleProvider: {}
}));

describe('Auth Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders login form by default', () => {
    render(<Auth />);
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    // Use exact match or more specific query for the submit button
    expect(screen.getByRole('button', { name: /^\s*Sign In\s*$/ })).toBeInTheDocument();
  });

  it('switches between login and signup', () => {
    render(<Auth />);
    const toggleButton = screen.getByText(/don't have an account/i);
    fireEvent.click(toggleButton);
    expect(screen.getByText('Create an Account')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^\s*Sign Up\s*$/ })).toBeInTheDocument();
  });

  it('calls signInWithEmailAndPassword on login submit', async () => {
    signInWithEmailAndPassword.mockResolvedValueOnce({});
    render(<Auth />);
    
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /^\s*Sign In\s*$/ }));

    await waitFor(() => {
      expect(signInWithEmailAndPassword).toHaveBeenCalledWith(expect.anything(), 'test@example.com', 'password123');
    });
  });

  it('calls createUserWithEmailAndPassword on signup submit', async () => {
    createUserWithEmailAndPassword.mockResolvedValueOnce({});
    render(<Auth />);
    
    // Switch to signup
    fireEvent.click(screen.getByText(/don't have an account/i));
    
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'new@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /^\s*Sign Up\s*$/ }));

    await waitFor(() => {
      expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(expect.anything(), 'new@example.com', 'password123');
    });
  });

  it('calls signInWithPopup on Google sign in click', async () => {
    signInWithPopup.mockResolvedValueOnce({});
    render(<Auth />);
    
    fireEvent.click(screen.getByText(/sign in with google/i));

    await waitFor(() => {
      expect(signInWithPopup).toHaveBeenCalled();
    });
  });

  it('displays error message on auth failure', async () => {
    signInWithEmailAndPassword.mockRejectedValueOnce(new Error('Invalid credentials'));
    render(<Auth />);
    
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'wrong' } });
    fireEvent.click(screen.getByRole('button', { name: /^\s*Sign In\s*$/ }));

    await waitFor(() => {
      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });
  });
});
