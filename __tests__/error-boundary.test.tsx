import { ErrorBoundary, withErrorBoundary } from '@/app/launch-essentials/components/ErrorBoundary';
import { fireEvent, render, screen } from '@testing-library/react';

// Mock the error handling utilities
jest.mock('@/lib/error-handling', () => ({
  ErrorLogger: {
    log: jest.fn(() => 'error_123_abc'),
  },
  ErrorSeverity: {
    HIGH: 'high',
    MEDIUM: 'medium',
    LOW: 'low',
    CRITICAL: 'critical',
  },
  classifyError: jest.fn(() => ({
    type: 'unknown',
    severity: 'medium',
    retryable: true,
    userMessage: 'An unexpected error occurred. Please try again.',
    suggestions: [
      {
        title: 'Refresh page',
        description: 'Try refreshing the page to resolve the issue.',
        priority: 'high',
      },
    ],
  })),
}));

// Component that throws an error for testing
const ThrowError = ({ shouldThrow = false }: { shouldThrow?: boolean }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

// Component that throws on render
const AlwaysThrows = () => {
  throw new Error('Always throws error');
};

describe('ErrorBoundary', () => {
  // Suppress console.error for these tests since we're intentionally throwing errors
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  afterAll(() => {
    console.error = originalError;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>Test content</div>
      </ErrorBoundary>
    );

    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  test('renders error UI when child component throws', () => {
    render(
      <ErrorBoundary>
        <AlwaysThrows />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('An unexpected error occurred. Please try again.')).toBeInTheDocument();
    expect(screen.getByText('Suggestions:')).toBeInTheDocument();
    expect(screen.getByText('Refresh page:')).toBeInTheDocument();
  });

  test('logs error when component throws', () => {
    const { ErrorLogger } = require('@/lib/error-handling');

    render(
      <ErrorBoundary>
        <AlwaysThrows />
      </ErrorBoundary>
    );

    expect(ErrorLogger.log).toHaveBeenCalledWith(
      expect.any(Error),
      'high',
      expect.objectContaining({
        additionalData: expect.objectContaining({
          componentStack: expect.any(String),
          errorBoundary: true,
        }),
      })
    );
  });

  test('calls onError callback when provided', () => {
    const onError = jest.fn();

    render(
      <ErrorBoundary onError={onError}>
        <AlwaysThrows />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String),
      })
    );
  });

  test('renders custom fallback when provided', () => {
    const customFallback = <div>Custom error message</div>;

    render(
      <ErrorBoundary fallback={customFallback}>
        <AlwaysThrows />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
    expect(screen.queryByText('Something went wrong')).not.toBeInTheDocument();
  });

  test('retry button works correctly', () => {
    // Create a component that can be controlled to throw or not throw
    let shouldThrow = true;
    const ControlledThrowError = () => {
      if (shouldThrow) {
        throw new Error('Test error');
      }
      return <div>No error</div>;
    };

    const { rerender } = render(
      <ErrorBoundary>
        <ControlledThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    const retryButton = screen.getByRole('button', { name: /try again/i });
    expect(retryButton).toBeInTheDocument();
    expect(retryButton).toHaveTextContent('Try Again (3 left)');

    // Change the component to not throw before clicking retry
    shouldThrow = false;
    fireEvent.click(retryButton);

    // After retry, should show the component without error
    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  test('retry count decreases with each retry', () => {
    render(
      <ErrorBoundary>
        <AlwaysThrows />
      </ErrorBoundary>
    );

    // Initial state - 3 retries left
    let retryButton = screen.getByRole('button', { name: /try again/i });
    expect(retryButton).toHaveTextContent('Try Again (3 left)');

    // First retry - should show error again with 2 left
    fireEvent.click(retryButton);
    retryButton = screen.getByRole('button', { name: /try again/i });
    expect(retryButton).toHaveTextContent('Try Again (2 left)');

    // Second retry - should show error again with 1 left
    fireEvent.click(retryButton);
    retryButton = screen.getByRole('button', { name: /try again/i });
    expect(retryButton).toHaveTextContent('Try Again (1 left)');

    // Third retry - should exhaust retries and hide retry button
    fireEvent.click(retryButton);
    expect(screen.queryByRole('button', { name: /try again/i })).not.toBeInTheDocument();
  });

  test('start over button resets error state', () => {
    render(
      <ErrorBoundary>
        <AlwaysThrows />
      </ErrorBoundary>
    );

    const startOverButton = screen.getByRole('button', { name: /start over/i });
    fireEvent.click(startOverButton);

    // After start over, should attempt to render children again
    expect(screen.getByText('Something went wrong')).toBeInTheDocument(); // Still throws
  });

  test('report error button works', () => {
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: jest.fn(),
      },
    });

    render(
      <ErrorBoundary>
        <AlwaysThrows />
      </ErrorBoundary>
    );

    const reportButton = screen.getByRole('button', { name: /report error/i });
    // The error ID is sliced to show last 8 characters, so "error_123_abc" becomes "_123_abc"
    expect(reportButton).toHaveTextContent('Report Error (ID: _123_abc)');

    fireEvent.click(reportButton);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      expect.stringContaining('"errorId": "error_123_abc"')
    );
  });

  test('shows technical details in development mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'development';

    render(
      <ErrorBoundary>
        <AlwaysThrows />
      </ErrorBoundary>
    );

    expect(screen.getByText('Technical Details (Development)')).toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });

  test('hides technical details in production mode', () => {
    const originalEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';

    render(
      <ErrorBoundary>
        <AlwaysThrows />
      </ErrorBoundary>
    );

    expect(screen.queryByText('Technical Details (Development)')).not.toBeInTheDocument();

    process.env.NODE_ENV = originalEnv;
  });
});

describe('withErrorBoundary HOC', () => {
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  afterAll(() => {
    console.error = originalError;
  });

  test('wraps component with error boundary', () => {
    const TestComponent = () => <div>Test component</div>;
    const WrappedComponent = withErrorBoundary(TestComponent);

    render(<WrappedComponent />);

    expect(screen.getByText('Test component')).toBeInTheDocument();
  });

  test('catches errors in wrapped component', () => {
    const WrappedComponent = withErrorBoundary(AlwaysThrows);

    render(<WrappedComponent />);

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  test('uses custom fallback when provided', () => {
    const customFallback = <div>Custom fallback</div>;
    const WrappedComponent = withErrorBoundary(AlwaysThrows, customFallback);

    render(<WrappedComponent />);

    expect(screen.getByText('Custom fallback')).toBeInTheDocument();
  });

  test('sets correct display name', () => {
    const TestComponent = () => <div>Test</div>;
    TestComponent.displayName = 'TestComponent';

    const WrappedComponent = withErrorBoundary(TestComponent);

    expect(WrappedComponent.displayName).toBe('withErrorBoundary(TestComponent)');
  });

  test('handles component without display name', () => {
    const TestComponent = () => <div>Test</div>;
    const WrappedComponent = withErrorBoundary(TestComponent);

    expect(WrappedComponent.displayName).toBe('withErrorBoundary(TestComponent)');
  });

  test('passes props correctly to wrapped component', () => {
    const TestComponent = ({ message }: { message: string }) => <div>{message}</div>;
    const WrappedComponent = withErrorBoundary(TestComponent);

    render(<WrappedComponent message="Hello World" />);

    expect(screen.getByText('Hello World')).toBeInTheDocument();
  });
});

describe('ErrorBoundary Integration', () => {
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  afterAll(() => {
    console.error = originalError;
  });

  test('handles multiple error boundaries', () => {
    const InnerComponent = ({ shouldThrow }: { shouldThrow: boolean }) => {
      if (shouldThrow) throw new Error('Inner error');
      return <div>Inner content</div>;
    };

    const OuterComponent = ({ shouldThrow }: { shouldThrow: boolean }) => {
      if (shouldThrow) throw new Error('Outer error');
      return (
        <ErrorBoundary>
          <InnerComponent shouldThrow={false} />
        </ErrorBoundary>
      );
    };

    render(
      <ErrorBoundary>
        <OuterComponent shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('Inner content')).toBeInTheDocument();
  });

  test('inner error boundary catches before outer', () => {
    const InnerComponent = () => {
      throw new Error('Inner error');
    };

    const OuterComponent = () => (
      <ErrorBoundary>
        <InnerComponent />
      </ErrorBoundary>
    );

    render(
      <ErrorBoundary>
        <OuterComponent />
      </ErrorBoundary>
    );

    // Should show error UI from inner boundary
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });
});
