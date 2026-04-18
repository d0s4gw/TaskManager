import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import React from 'react';
import TaskEditForm from '../TaskEditForm';

describe('TaskEditForm Component', () => {
  const mockTask = { id: 1, title: 'Edit Me', description: 'Some info', due_date: '', priority: 'low', category: '' };

  it('renders the form with initial values', () => {
    render(<TaskEditForm task={mockTask} onSave={() => {}} onCancel={() => {}} />);
    expect(screen.getByDisplayValue('Edit Me')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Some info')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Low')).toBeInTheDocument();
  });

  it('calls onSave with updated values', () => {
    const handleSave = vi.fn();
    render(<TaskEditForm task={mockTask} onSave={handleSave} onCancel={() => {}} />);
    
    const titleInput = screen.getByDisplayValue('Edit Me');
    fireEvent.change(titleInput, { target: { value: 'Edited Title' } });
    
    const saveBtn = screen.getByText(/save/i);
    fireEvent.click(saveBtn);
    
    expect(handleSave).toHaveBeenCalledWith({
      title: 'Edited Title',
      description: 'Some info',
      due_date: '',
      priority: 'low',
      category: ''
    });
  });

  it('does not save if title is empty', () => {
    const handleSave = vi.fn();
    render(<TaskEditForm task={mockTask} onSave={handleSave} onCancel={() => {}} />);
    
    const titleInput = screen.getByDisplayValue('Edit Me');
    fireEvent.change(titleInput, { target: { value: '   ' } });
    
    const saveBtn = screen.getByText(/save/i);
    fireEvent.click(saveBtn);
    
    expect(handleSave).not.toHaveBeenCalled();
  });
});
