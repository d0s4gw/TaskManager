import { render, screen, fireEvent } from '@testing-library/react';
import { expect, it, describe, vi } from 'vitest';
import { LabelInput } from './LabelInput';

describe('LabelInput', () => {
  it('renders existing labels', () => {
    render(<LabelInput labels={['bug', 'feature']} onChange={vi.fn()} />);
    expect(screen.getByText('bug')).toBeInTheDocument();
    expect(screen.getByText('feature')).toBeInTheDocument();
  });

  it('adds a new label on Enter', () => {
    const onChange = vi.fn();
    render(<LabelInput labels={['bug']} onChange={onChange} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'urgent' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    expect(onChange).toHaveBeenCalledWith(['bug', 'urgent']);
  });

  it('adds a new label on comma', () => {
    const onChange = vi.fn();
    render(<LabelInput labels={[]} onChange={onChange} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'design' } });
    fireEvent.keyDown(input, { key: ',' });
    
    expect(onChange).toHaveBeenCalledWith(['design']);
  });

  it('does not add duplicate labels', () => {
    const onChange = vi.fn();
    render(<LabelInput labels={['bug']} onChange={onChange} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'bug' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    expect(onChange).not.toHaveBeenCalled();
  });

  it('removes a label when clicking the X button', () => {
    const onChange = vi.fn();
    render(<LabelInput labels={['bug', 'feature']} onChange={onChange} />);
    
    // There are multiple buttons if there are multiple labels
    const buttons = screen.getAllByRole('button');
    // Click the first button (which corresponds to 'bug' X icon)
    fireEvent.click(buttons[0]);
    
    expect(onChange).toHaveBeenCalledWith(['feature']);
  });

  it('removes the last label on Backspace if input is empty', () => {
    const onChange = vi.fn();
    render(<LabelInput labels={['bug', 'feature']} onChange={onChange} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.keyDown(input, { key: 'Backspace' });
    
    expect(onChange).toHaveBeenCalledWith(['bug']);
  });

  it('does not remove label on Backspace if input has text', () => {
    const onChange = vi.fn();
    render(<LabelInput labels={['bug']} onChange={onChange} />);
    
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'f' } });
    fireEvent.keyDown(input, { key: 'Backspace' });
    
    expect(onChange).not.toHaveBeenCalled();
  });

  it('respects the maximum label limit', () => {
    const onChange = vi.fn();
    const tenLabels = Array.from({ length: 10 }, (_, i) => `label${i}`);
    render(<LabelInput labels={tenLabels} onChange={onChange} />);
    
    // Should display the warning text
    expect(screen.getByText('Maximum of 10 labels reached.')).toBeInTheDocument();
    
    // The input should not be rendered
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });

  it('is disabled properly', () => {
    const onChange = vi.fn();
    render(<LabelInput labels={['bug']} onChange={onChange} disabled={true} />);
    
    // Buttons for removing should not be rendered
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
    
    // Input should not be rendered
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
  });
});
