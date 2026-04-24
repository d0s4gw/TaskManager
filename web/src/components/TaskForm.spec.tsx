import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TaskForm } from './TaskForm';
import { expect, it, describe, vi } from 'vitest';

describe('TaskForm', () => {
  it('renders correctly', () => {
    render(<TaskForm onAddTask={vi.fn()} />);
    expect(screen.getByPlaceholderText(/What needs to be done\? \(Press Enter\)/i)).toBeInTheDocument();
  });

  it('calls onAddTask when form is submitted', async () => {
    const onAddTask = vi.fn().mockResolvedValue(undefined);
    render(<TaskForm onAddTask={onAddTask} />);

    const input = screen.getByPlaceholderText(/What needs to be done\? \(Press Enter\)/i);
    fireEvent.change(input, { target: { value: 'New Task' } });

    fireEvent.submit(screen.getByRole('textbox').closest('form')!);

    await waitFor(() => {
      expect(onAddTask).toHaveBeenCalledWith(expect.objectContaining({
        title: 'New Task',
      }));
    });
  });

  it('clears input after submission', async () => {
    const onAddTask = vi.fn().mockResolvedValue(undefined);
    render(<TaskForm onAddTask={onAddTask} />);

    const input = screen.getByPlaceholderText(/What needs to be done\? \(Press Enter\)/i);
    fireEvent.change(input, { target: { value: 'New Task' } });

    fireEvent.submit(input.closest('form')!);

    await waitFor(() => {
      expect(input).toHaveValue('');
    });
  });
});
