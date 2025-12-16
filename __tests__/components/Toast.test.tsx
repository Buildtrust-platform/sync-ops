import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ToastProvider, useToast } from '@/app/components/Toast';

describe('Toast Component', () => {
  it('should render toast provider without crashing', () => {
    render(
      <ToastProvider>
        <div>Test content</div>
      </ToastProvider>
    );
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('should render children correctly within provider', () => {
    render(
      <ToastProvider>
        <div data-testid="child">Child element</div>
      </ToastProvider>
    );
    expect(screen.getByTestId('child')).toBeInTheDocument();
    expect(screen.getByText('Child element')).toBeInTheDocument();
  });
});

describe('Toast Provider Context', () => {
  // Test component to verify context is available
  function TestConsumer() {
    const context = useToast();
    return (
      <div>
        <span data-testid="has-context">{context ? 'has-context' : 'no-context'}</span>
        <span data-testid="has-success">{typeof context.success === 'function' ? 'yes' : 'no'}</span>
        <span data-testid="has-error">{typeof context.error === 'function' ? 'yes' : 'no'}</span>
        <span data-testid="has-warning">{typeof context.warning === 'function' ? 'yes' : 'no'}</span>
        <span data-testid="has-info">{typeof context.info === 'function' ? 'yes' : 'no'}</span>
      </div>
    );
  }

  it('should provide toast context to children', () => {
    render(
      <ToastProvider>
        <TestConsumer />
      </ToastProvider>
    );
    expect(screen.getByTestId('has-context')).toHaveTextContent('has-context');
    expect(screen.getByTestId('has-success')).toHaveTextContent('yes');
    expect(screen.getByTestId('has-error')).toHaveTextContent('yes');
    expect(screen.getByTestId('has-warning')).toHaveTextContent('yes');
    expect(screen.getByTestId('has-info')).toHaveTextContent('yes');
  });

  it('should throw error when useToast is used outside provider', () => {
    // Suppress console.error for this test
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      render(<TestConsumer />);
    }).toThrow();

    consoleSpy.mockRestore();
  });
});
