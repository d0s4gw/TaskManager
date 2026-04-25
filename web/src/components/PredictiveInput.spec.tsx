import { render, screen, fireEvent } from '@testing-library/react';
import { expect, it, describe, vi } from 'vitest';
import { PredictiveInput } from './PredictiveInput';

describe('PredictiveInput', () => {
  const mockSuggestions = ['Meeting', 'Meet friend', 'Call boss'];
  const onValueChange = vi.fn();

  it('renders input correctly', () => {
    render(<PredictiveInput suggestions={mockSuggestions} onValueChange={onValueChange} placeholder="Test input" />);
    expect(screen.getByPlaceholderText('Test input')).toBeInTheDocument();
  });

  it('shows ghost text when typing', () => {
    render(<PredictiveInput suggestions={mockSuggestions} onValueChange={onValueChange} />);
    const input = screen.getByRole('textbox');
    
    fireEvent.change(input, { target: { value: 'mee' } });
    
    // 'ting' is the ghost suffix for 'Meeting'
    expect(screen.getByText('ting')).toBeInTheDocument();
    // 't friend' would be for 'Meet friend', but we only show the top match
    expect(screen.queryByText('t friend')).not.toBeInTheDocument();
  });

  it('accepts suggestion with Tab key', () => {
    render(<PredictiveInput suggestions={mockSuggestions} onValueChange={onValueChange} />);
    const input = screen.getByRole('textbox');
    
    fireEvent.change(input, { target: { value: 'mee' } });
    fireEvent.keyDown(input, { key: 'Tab' });
    
    expect(input).toHaveValue('Meeting');
    expect(onValueChange).toHaveBeenCalledWith('Meeting');
  });

  it('accepts suggestion with ArrowRight key', () => {
    render(<PredictiveInput suggestions={mockSuggestions} onValueChange={onValueChange} />);
    const input = screen.getByRole('textbox');
    
    fireEvent.change(input, { target: { value: 'mee' } });
    fireEvent.keyDown(input, { key: 'ArrowRight' });
    
    expect(input).toHaveValue('Meeting');
    expect(onValueChange).toHaveBeenCalledWith('Meeting');
  });

  it('hides ghost text on Escape', () => {
    render(<PredictiveInput suggestions={mockSuggestions} onValueChange={onValueChange} />);
    const input = screen.getByRole('textbox');
    
    fireEvent.change(input, { target: { value: 'mee' } });
    expect(screen.getByText('ting')).toBeInTheDocument();
    
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.queryByText('ting')).not.toBeInTheDocument();
  });
});
