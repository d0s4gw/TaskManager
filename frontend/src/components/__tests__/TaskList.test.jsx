import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import TaskList from '../TaskList';

describe('TaskList Component', () => {
  it('renders an empty state when no tasks are provided', () => {
    render(<TaskList tasks={[]} onToggle={() => {}} onDelete={() => {}} onEdit={() => {}} />);
    expect(screen.getByText(/no tasks yet/i)).toBeInTheDocument();
  });

  it('renders tasks correctly', () => {
    const tasks = [
      { id: 1, title: 'Task 1', completed: false },
      { id: 2, title: 'Task 2', completed: true }
    ];
    render(<TaskList tasks={tasks} onToggle={() => {}} onDelete={() => {}} onEdit={() => {}} />);
    
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
  });
});
