import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import TaskItem from '../TaskItem';

describe('TaskItem Component', () => {
  const mockTask = { id: 1, title: 'Learn Testing', completed: false, priority: 'high', due_date: '2023-12-01', category: 'Dev' };

  it('renders task details correctly', () => {
    render(<TaskItem task={mockTask} onToggle={() => {}} onDelete={() => {}} onEdit={() => {}} />);
    expect(screen.getByText('Learn Testing')).toBeInTheDocument();
    expect(screen.getByText('high')).toBeInTheDocument();
    expect(screen.getByText('2023-12-01')).toBeInTheDocument();
    expect(screen.getByText('Dev')).toBeInTheDocument();
  });

  it('calls onToggle when checkbox is clicked', () => {
    const handleToggle = vi.fn();
    render(<TaskItem task={mockTask} onToggle={handleToggle} onDelete={() => {}} onEdit={() => {}} />);
    
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    expect(handleToggle).toHaveBeenCalledWith(1, true);
  });

  it('calls onDelete when trash icon is clicked', () => {
    const handleDelete = vi.fn();
    render(<TaskItem task={mockTask} onToggle={() => {}} onDelete={handleDelete} onEdit={() => {}} />);
    
    const deleteBtn = screen.getByLabelText(/delete task/i);
    fireEvent.click(deleteBtn);
    expect(handleDelete).toHaveBeenCalledWith(1);
  });

  it('switches to edit mode when edit icon is clicked', () => {
    render(<TaskItem task={mockTask} onToggle={() => {}} onDelete={() => {}} onEdit={() => {}} />);
    
    const editBtn = screen.getByLabelText(/edit task/i);
    fireEvent.click(editBtn);
    expect(screen.getByText(/save/i)).toBeInTheDocument();
    expect(screen.getByText(/cancel/i)).toBeInTheDocument();
  });
});
