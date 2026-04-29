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

  it('shows ghost text for mid-string matches', () => {
    render(<PredictiveInput suggestions={['Meeting with client']} onValueChange={onValueChange} />);
    const input = screen.getByRole('textbox');
    
    fireEvent.change(input, { target: { value: 'I need a me' } });
    
    // 'eting with client' should be suggested since "me" matches prefix of "Meeting with client"
    expect(screen.getByText('eting with client')).toBeInTheDocument();
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

  it('accepts suggestion with mid-string lowercase casing', () => {
    render(<PredictiveInput suggestions={['Meeting']} onValueChange={onValueChange} />);
    const input = screen.getByRole('textbox');
    
    fireEvent.change(input, { target: { value: 'I need a m' } });
    fireEvent.keyDown(input, { key: 'Tab' });
    
    expect(input).toHaveValue('I need a meeting');
    expect(onValueChange).toHaveBeenCalledWith('I need a meeting');
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
