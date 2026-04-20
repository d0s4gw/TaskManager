import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import App from '../App';

// Mock the global fetch
global.fetch = vi.fn();

// Mock Firebase Auth
vi.mock('firebase/auth', () => ({
  getAuth: vi.fn(),
  onAuthStateChanged: vi.fn((auth, callback) => {
    // Simulate a logged-in user
    callback({ uid: 'test_user_123', getIdToken: () => Promise.resolve('mock_token') });
    return vi.fn(); // Unsubscribe function
  }),
  signOut: vi.fn(),
  GoogleAuthProvider: vi.fn()
}));

vi.mock('../firebase', () => ({
  auth: {},
  googleProvider: {}
}));

describe('App Component', () => {
  beforeEach(() => {
    fetch.mockClear();
    vi.clearAllMocks();
  });

  it('fetches and renders tasks on mount', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        tasks: [
          { id: '1', title: 'Backend Task', completed: false }
        ]
      })
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Backend Task')).toBeInTheDocument();
    });
  });

  it('handles adding a new task', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ tasks: [] }) // Initial fetch
    });
    
    render(<App />);
    
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ id: '2', title: 'New Task', userId: 'test_user_123' })
    });

    const input = screen.getByPlaceholderText(/what needs to be done/i);
    fireEvent.change(input, { target: { value: 'New Task' } });
    fireEvent.click(screen.getByRole('button', { name: /add/i }));

    await waitFor(() => {
      expect(screen.getByText('New Task')).toBeInTheDocument();
    });
    
    expect(fetch).toHaveBeenCalledWith('/api/tasks', expect.objectContaining({
      method: 'POST'
    }));
  });

  it('handles toggling a task', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        tasks: [
          { id: '1', title: 'Task to Toggle', completed: false }
        ]
      })
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Task to Toggle')).toBeInTheDocument();
    });

    fetch.mockResolvedValueOnce({ ok: true });

    const checkbox = screen.getByRole('checkbox');
    // Using click on checkbox should trigger change
    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/tasks/1', expect.objectContaining({
        method: 'PUT',
        body: expect.stringContaining('"completed":true')
      }));
    });
  });

  it('handles deleting a task', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        tasks: [
          { id: '1', title: 'Task to Delete', completed: false }
        ]
      })
    });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Task to Delete')).toBeInTheDocument();
    });

    fetch.mockResolvedValueOnce({ ok: true });

    const deleteButton = screen.getByLabelText(/delete task/i);
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.queryByText('Task to Delete')).not.toBeInTheDocument();
    });

    expect(fetch).toHaveBeenCalledWith('/api/tasks/1', expect.objectContaining({
      method: 'DELETE'
    }));
  });

  it('displays an error banner if fetching fails', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/could not connect to the server/i)).toBeInTheDocument();
    });
  });
});
