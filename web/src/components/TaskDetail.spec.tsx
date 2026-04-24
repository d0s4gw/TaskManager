import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { expect, it, describe, vi } from 'vitest';
import { TaskDetail } from './TaskDetail';
import { Task } from '../../../shared/task';

const mockTask: Task = {
  id: '1',
  title: 'Test Task',
  description: 'Original Description',
  completed: false,
  priority: 'low',
  dueDate: new Date('2026-12-31').toISOString(),
  userId: 'u1',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

describe('TaskDetail', () => {
  it('renders nothing when not open', () => {
    const { container } = render(
      <TaskDetail 
        task={mockTask} 
        isOpen={false} 
        onClose={vi.fn()} 
        onUpdate={vi.fn()} 
        onDelete={vi.fn()} 
        onToggle={vi.fn()} 
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders task details when open', () => {
    render(
      <TaskDetail 
        task={mockTask} 
        isOpen={true} 
        onClose={vi.fn()} 
        onUpdate={vi.fn()} 
        onDelete={vi.fn()} 
        onToggle={vi.fn()} 
      />
    );
    expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Original Description')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Low')).toBeInTheDocument();
  });

  it('calls onUpdate on title blur if changed', async () => {
    const onUpdate = vi.fn().mockResolvedValue(undefined);
    render(
      <TaskDetail 
        task={mockTask} 
        isOpen={true} 
        onClose={vi.fn()} 
        onUpdate={onUpdate} 
        onDelete={vi.fn()} 
        onToggle={vi.fn()} 
      />
    );

    const titleInput = screen.getByDisplayValue('Test Task');
    fireEvent.change(titleInput, { target: { value: 'Updated Title' } });
    fireEvent.blur(titleInput);

    expect(onUpdate).toHaveBeenCalledWith('1', { title: 'Updated Title' });
  });

  it('calls onUpdate on priority change', async () => {
    const onUpdate = vi.fn().mockResolvedValue(undefined);
    render(
      <TaskDetail 
        task={mockTask} 
        isOpen={true} 
        onClose={vi.fn()} 
        onUpdate={onUpdate} 
        onDelete={vi.fn()} 
        onToggle={vi.fn()} 
      />
    );

    const prioritySelect = screen.getByDisplayValue('Low');
    fireEvent.change(prioritySelect, { target: { value: 'high' } });

    expect(onUpdate).toHaveBeenCalledWith('1', { priority: 'high' });
  });

  it('calls onToggle when completion button is clicked', () => {
    const onToggle = vi.fn().mockResolvedValue(undefined);
    render(
      <TaskDetail 
        task={mockTask} 
        isOpen={true} 
        onClose={vi.fn()} 
        onUpdate={vi.fn()} 
        onDelete={vi.fn()} 
        onToggle={onToggle} 
      />
    );

    // The first button in header is the toggle
    const toggleButton = screen.getAllByRole('button')[0];
    fireEvent.click(toggleButton);

    expect(onToggle).toHaveBeenCalledWith('1', true);
  });

  it('calls onDelete when delete button is clicked', () => {
    const onDelete = vi.fn().mockResolvedValue(undefined);
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    
    render(
      <TaskDetail 
        task={mockTask} 
        isOpen={true} 
        onClose={vi.fn()} 
        onUpdate={vi.fn()} 
        onDelete={onDelete} 
        onToggle={vi.fn()} 
      />
    );

    const deleteButton = screen.getByText(/Delete Task/i);
    fireEvent.click(deleteButton);

    expect(onDelete).toHaveBeenCalledWith('1');
  });
});
