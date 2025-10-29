import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { LoadingSpinner } from './LoadingSpinner';

describe('LoadingSpinner', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />);
    
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('animate-spin');
  });

  it('renders with custom size', () => {
    render(<LoadingSpinner size="lg" />);
    
    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveClass('h-8', 'w-8');
  });

  it('renders with custom text', () => {
    const customText = 'Loading data...';
    render(<LoadingSpinner text={customText} />);
    
    expect(screen.getByText(customText)).toBeInTheDocument();
  });

  it('renders centered when specified', () => {
    render(<LoadingSpinner centerScreen />);
    
    // When centerScreen is true, it wraps in a fixed overlay
    const overlay = screen.getByTestId('loading-spinner').closest('.fixed');
    expect(overlay).toBeInTheDocument();
    expect(overlay).toHaveClass('fixed', 'inset-0');
  });

  it('renders with different sizes correctly', () => {
    const { rerender } = render(<LoadingSpinner size="sm" />);
    let spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveClass('h-4', 'w-4');

    rerender(<LoadingSpinner size="md" />);
    spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveClass('h-6', 'w-6');

    rerender(<LoadingSpinner size="lg" />);
    spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveClass('h-8', 'w-8');
  });

  it('does not render text when not provided', () => {
    render(<LoadingSpinner />);
    
    const textElement = screen.queryByText(/Loading/);
    expect(textElement).not.toBeInTheDocument();
  });
});
