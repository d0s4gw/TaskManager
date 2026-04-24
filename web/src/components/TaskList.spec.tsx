import { render, screen, fireEvent } from '@testing-library/react';
import { expect, it, describe, vi } from 'vitest';
import { TaskList } from './TaskList';
import { Task } from '../../../shared/task';

const mockTasks: Task[] = [
  { id: '1', title: 'Task 1', completed: false, userId: 'u1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), priority: 'high' },
  { id: '2', title: 'Task 2', completed: true, userId: 'u1', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), priority: 'none' },
];

describe('TaskList', () => {
  it('renders "no tasks" message when list is empty', () => {
    render(<TaskList tasks={[]} onToggle={vi.fn()} onDelete={vi.fn()} onSelectTask={vi.fn()} />);
    expect(screen.getByText(/No tasks yet/i)).toBeInTheDocument();
  });

  it('renders a list of tasks', () => {
    render(<TaskList tasks={mockTasks} onToggle={vi.fn()} onDelete={vi.fn()} onSelectTask={vi.fn()} />);
    expect(screen.getByText('Task 1')).toBeInTheDocument();
    expect(screen.getByText('Task 2')).toBeInTheDocument();
    expect(screen.getByText('high')).toBeInTheDocument(); // Priority badge
  });

  it('calls onSelectTask when the row is clicked', () => {
    const onSelectTask = vi.fn();
    render(<TaskList tasks={mockTasks} onToggle={vi.fn()} onDelete={vi.fn()} onSelectTask={onSelectTask} />);
    
    fireEvent.click(screen.getByText('Task 1'));
    expect(onSelectTask).toHaveBeenCalledWith(mockTasks[0]);
  });

  it('calls onToggle when the toggle button is clicked', () => {
    const onToggle = vi.fn();
    render(<TaskList tasks={mockTasks} onToggle={onToggle} onDelete={vi.fn()} onSelectTask={vi.fn()} />);
    
    // The toggle button is the first button in the row
    const toggleButtons = screen.getAllByRole('button').filter(b => b.className.includes('text-zinc-300') || b.className.includes('text-green-500'));
    fireEvent.click(toggleButtons[0]);
    
    expect(onToggle).toHaveBeenCalledWith('1', true);
  });

  it('calls onDelete when the delete button is clicked', () => {
    const onDelete = vi.fn();
    render(<TaskList tasks={mockTasks} onToggle={vi.fn()} onDelete={onDelete} onSelectTask={vi.fn()} />);
    
    // Delete buttons have opacity-0 group-hover:opacity-100
    const deleteButtons = screen.getAllByRole('button').filter(b => b.className.includes('text-zinc-400'));
    fireEvent.click(deleteButtons[0]);
    
    expect(onDelete).toHaveBeenCalledWith('1');
  });
});
