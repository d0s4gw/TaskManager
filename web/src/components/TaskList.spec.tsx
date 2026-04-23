import { render, screen, fireEvent } from '@testing-library/react';
import { expect, it, describe, vi } from 'vitest';
import { TaskList } from './TaskList';
import { Task } from '../../../shared/task';

const mockTasks: Task[] = [
  { id: '1', title: 'Task 1', completed: false, userId: 'u1', createdAt: new Date() },
  { id: '2', title: 'Task 2', completed: true, userId: 'u1', createdAt: new Date() },
];

describe('TaskList', () => {
  it('renders "no tasks" message when list is empty', () => {
    render(<TaskList tasks={[]} onToggle={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText(/No tasks yet/i)).toBeInTheDocument();
  });

  it('renders a list of tasks', () => {
    render(<TaskList tasks={mockTasks} onToggle={vi.fn()} onDelete={vi.fn()} />);
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
  });

  it('calls onToggle when a task is clicked', () => {
    const onToggle = vi.fn();
    render(<TaskList tasks={mockTasks} onToggle={onToggle} onDelete={vi.fn()} />);
    
    // Find the toggle button for Task 1 (not completed)
    const buttons = screen.getAllByRole('button');
    // Button 0 is Toggle 1, Button 1 is Delete 1, Button 2 is Toggle 2, etc.
    fireEvent.click(buttons[0]);
    
    expect(onToggle).toHaveBeenCalledWith('1', true);
  });

  it('calls onDelete when the delete button is clicked', () => {
    const onDelete = vi.fn();
    render(<TaskList tasks={mockTasks} onToggle={vi.fn()} onDelete={onDelete} />);
    
    const deleteButtons = screen.getAllByRole('button').filter(b => b.querySelector('svg'));
    // In our component, Trash icon is the delete button
    fireEvent.click(deleteButtons[1]); // Delete button for Task 1
    
    expect(onDelete).toHaveBeenCalledWith('1');
  });
});
