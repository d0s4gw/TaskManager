import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import TaskForm from '../TaskForm';

describe('TaskForm Component', () => {
  it('renders the input field correctly', () => {
    render(<TaskForm onAddTask={() => {}} />);
    expect(screen.getByPlaceholderText('What needs to be done?')).toBeInTheDocument();
  });

  it('calls onAddTask with title when submitted', () => {
    const handleAddTask = vi.fn();
    render(<TaskForm onAddTask={handleAddTask} />);
    
    const input = screen.getByPlaceholderText('What needs to be done?');
    const button = screen.getByRole('button', { name: /add/i });

    fireEvent.change(input, { target: { value: 'Buy groceries' } });
    fireEvent.click(button);

    expect(handleAddTask).toHaveBeenCalledTimes(1);
    expect(handleAddTask).toHaveBeenCalledWith({ title: 'Buy groceries' });
    expect(input.value).toBe(''); // Input clears after submit
  });

  it('does not call onAddTask if title is empty', () => {
    const handleAddTask = vi.fn();
    render(<TaskForm onAddTask={handleAddTask} />);
    
    const button = screen.getByRole('button', { name: /add/i });
    fireEvent.click(button);

    expect(handleAddTask).not.toHaveBeenCalled();
  });
});
