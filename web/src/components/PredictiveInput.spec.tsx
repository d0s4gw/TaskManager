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

  it('shows suggestions when typing', () => {
    render(<PredictiveInput suggestions={mockSuggestions} onValueChange={onValueChange} />);
    const input = screen.getByRole('textbox');
    
    fireEvent.change(input, { target: { value: 'mee' } });
    
    expect(screen.getByText('Meeting')).toBeInTheDocument();
    expect(screen.getByText('Meet friend')).toBeInTheDocument();
    expect(screen.queryByText('Call boss')).not.toBeInTheDocument();
  });

  it('accepts suggestion with Tab key', () => {
    render(<PredictiveInput suggestions={mockSuggestions} onValueChange={onValueChange} />);
    const input = screen.getByRole('textbox');
    
    fireEvent.change(input, { target: { value: 'mee' } });
    fireEvent.keyDown(input, { key: 'Tab' });
    
    expect(input).toHaveValue('Meeting');
    expect(onValueChange).toHaveBeenCalledWith('Meeting');
  });

  it('accepts suggestion with click', () => {
    render(<PredictiveInput suggestions={mockSuggestions} onValueChange={onValueChange} />);
    const input = screen.getByRole('textbox');
    
    fireEvent.change(input, { target: { value: 'mee' } });
    const suggestionBtn = screen.getByText('Meeting');
    fireEvent.click(suggestionBtn);
    
    expect(input).toHaveValue('Meeting');
    expect(onValueChange).toHaveBeenCalledWith('Meeting');
  });

  it('hides suggestions on Escape', () => {
    render(<PredictiveInput suggestions={mockSuggestions} onValueChange={onValueChange} />);
    const input = screen.getByRole('textbox');
    
    fireEvent.change(input, { target: { value: 'mee' } });
    expect(screen.getByText('Meeting')).toBeInTheDocument();
    
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.queryByText('Meeting')).not.toBeInTheDocument();
  });
});
