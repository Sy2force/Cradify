import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import Button from '@/components/ui/Button';

// Mock matchMedia for framer-motion
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => {},
  }),
});

describe('Button Component', () => {
  beforeEach(() => {
    cleanup();
  });

  afterEach(() => {
    cleanup();
  });

  it('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', () => {
    let clicked = false;
    render(<Button onClick={() => clicked = true}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(clicked).toBe(true);
  });

  it('shows loading state', () => {
    const { container } = render(<Button isLoading>Loading</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveAttribute('disabled');
  });

  it('applies variant styles', () => {
    const { container } = render(<Button variant="primary">Primary</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveClass('bg-gradient-to-r');
  });

  it('renders outline variant', () => {
    const { container } = render(<Button variant="outline">Outline</Button>);
    const button = container.querySelector('button');
    expect(button).toHaveClass('border-2');
  });

  it('renders with icons', () => {
    const Icon = () => <span>Icon</span>;
    render(<Button leftIcon={<Icon />}>With Icon</Button>);
    expect(screen.getByText('Icon')).toBeInTheDocument();
  });
});
