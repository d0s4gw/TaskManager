import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import App from '../App';

// Mock the global fetch
global.fetch = vi.fn();

describe('App Component', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it('fetches and renders tasks on mount', async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        tasks: [
          { id: 1, title: 'Backend Task', completed: false }
        ]
      })
    });

    render(<App />);

    expect(screen.getByText(/loading tasks/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText('Backend Task')).toBeInTheDocument();
    });
  });

  it('displays an error banner if fetching fails', async () => {
    fetch.mockRejectedValueOnce(new Error('Network error'));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/could not connect to the server/i)).toBeInTheDocument();
    });
  });
});
