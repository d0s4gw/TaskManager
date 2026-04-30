import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NestedTaskItem } from './NestedTaskItem';
import { Task } from '../../../shared/task';

describe('NestedTaskItem', () => {
  const mockTask: Task = {
    id: 'test-1',
    title: 'Parent Subtask',
    completed: false,
    priority: 'none',
    userId: 'user-1',
    workspaceId: 'ws-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    position: 0,
    subtasks: []
  };

  const mockOnUpdate = vi.fn();
  const mockOnDelete = vi.fn();

  it('renders the subtask title', () => {
    render(
      <NestedTaskItem 
        task={mockTask} 
        level={0} 
        onUpdate={mockOnUpdate} 
        onDelete={mockOnDelete} 
      />
    );
    expect(screen.getByText('Parent Subtask')).toBeDefined();
  });

  it('calls onUpdate when toggling completion', () => {
    render(
      <NestedTaskItem 
        task={mockTask} 
        level={0} 
        onUpdate={mockOnUpdate} 
        onDelete={mockOnDelete} 
      />
    );
    const checkbox = screen.getByTestId('subtask-checkbox');

    fireEvent.click(checkbox);
    expect(mockOnUpdate).toHaveBeenCalledWith(expect.objectContaining({ completed: true }));
  });

  it('enters editing mode when clicking the title', () => {
    render(
      <NestedTaskItem 
        task={mockTask} 
        level={0} 
        onUpdate={mockOnUpdate} 
        onDelete={mockOnDelete} 
      />
    );
    const title = screen.getByText('Parent Subtask');
    fireEvent.click(title);
    
    const input = screen.getByRole('textbox');
    expect(input).toBeDefined();
    expect((input as HTMLInputElement).value).toBe('Parent Subtask');
  });

  it('submits title change on Enter', () => {
    render(
      <NestedTaskItem 
        task={mockTask} 
        level={0} 
        onUpdate={mockOnUpdate} 
        onDelete={mockOnDelete} 
      />
    );
    fireEvent.click(screen.getByText('Parent Subtask'));
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Updated Title' } });
    fireEvent.submit(input);
    
    expect(mockOnUpdate).toHaveBeenCalledWith(expect.objectContaining({ title: 'Updated Title' }));
  });

  it('renders child subtasks recursively', () => {
    const taskWithChildren: Task = {
      ...mockTask,
      subtasks: [
        { ...mockTask, id: 'child-1', title: 'Child Subtask' }
      ]
    };
    render(
      <NestedTaskItem 
        task={taskWithChildren} 
        level={0} 
        onUpdate={mockOnUpdate} 
        onDelete={mockOnDelete} 
      />
    );
    expect(screen.getByText('Parent Subtask')).toBeDefined();
    expect(screen.getByText('Child Subtask')).toBeDefined();
  });

  it('enters subtask creation mode when clicking add button', () => {
    render(
      <NestedTaskItem 
        task={mockTask} 
        level={0} 
        onUpdate={mockOnUpdate} 
        onDelete={mockOnDelete} 
      />
    );
    const addButton = screen.getByTitle('Add subtask');
    fireEvent.click(addButton);
    
    const input = screen.getByPlaceholderText('Subtask title...');
    expect(input).toBeDefined();
  });
});

