import { ErrorDisplay, FieldError, NetworkStatus } from '@/app/launch-essentials/components/ErrorDisplay';
import {
  FrameworkError,
  NetworkError,
  PersistenceError,
  ValidationError
} from '@/lib/error-handling';
import { fireEvent, render, screen } from '@testing-library/react';

describe('ErrorDisplay', () => {
  test('renders validation error correctly', () => {
    const error = new ValidationError('email', 'Invalid email format', 'INVALID_EMAIL');
    const onRetry = jest.fn();
    const onDismiss = jest.fn();

    render(<ErrorDisplay error={error} onRetry={onRetry} onDismiss={onDismiss} />);

    expect(screen.getByText('Validation Error')).toBeInTheDocument();
    expect(screen.getByText('Invalid email format')).toBeInTheDocument();
    expect(screen.getByText('MEDIUM')).toBeInTheDocument();
    expect(screen.getByText('Suggested Actions:')).toBeInTheDocument();
    expect(screen.getByText('Check your input')).toBeInTheDocument();
  });

  test('renders network error with retry button', () => {
    const error = new NetworkError('Connection failed', 500, true);
    const onRetry = jest.fn();

    render(<ErrorDisplay error={error} onRetry={onRetry} />);

    expect(screen.getByText('Network Error')).toBeInTheDocument();
    expect(screen.getByText('Unable to connect. Please check your internet connection.')).toBeInTheDocument();

    const retryButton = screen.getByRole('button', { name: /try again/i });
    expect(retryButton).toBeInTheDocument();

    fireEvent.click(retryButton);
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  test('renders persistence error correctly', () => {
    const originalError = new Error('Database error');
    const error = new PersistenceError('save data', originalError);

    render(<ErrorDisplay error={error} />);

    expect(screen.getByText('Persistence Error')).toBeInTheDocument();
    expect(screen.getByText('Unable to save your changes. Please try again.')).toBeInTheDocument();
    expect(screen.getByText('HIGH')).toBeInTheDocument();
  });

  test('renders framework error correctly', () => {
    const error = new FrameworkError('validation-framework', 'Template not found', false);

    render(<ErrorDisplay error={error} />);

    expect(screen.getByText('Framework Error')).toBeInTheDocument();
    expect(screen.getByText('Framework validation-framework: Template not found')).toBeInTheDocument();
  });

  test('renders compact version correctly', () => {
    const error = new ValidationError('name', 'Name is required', 'REQUIRED');
    const onDismiss = jest.fn();

    render(<ErrorDisplay error={error} onDismiss={onDismiss} compact />);

    expect(screen.getByText('Name is required')).toBeInTheDocument();

    const dismissButton = screen.getByRole('button');
    fireEvent.click(dismissButton);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  test('handles dismiss action correctly', () => {
    const error = new Error('Test error');
    const onDismiss = jest.fn();

    render(<ErrorDisplay error={error} onDismiss={onDismiss} />);

    const dismissButton = screen.getByRole('button', { name: /dismiss/i });
    fireEvent.click(dismissButton);
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  test('shows suggestions with actions', async () => {
    const error = new ValidationError('email', 'Invalid email', 'INVALID', ['Use format: user@domain.com']);

    render(<ErrorDisplay error={error} />);

    expect(screen.getByText('Check your input')).toBeInTheDocument();
    expect(screen.getByText('Use format: user@domain.com')).toBeInTheDocument();
  });

  test('applies custom className', () => {
    const error = new Error('Test error');
    const { container } = render(<ErrorDisplay error={error} className="custom-class" />);

    expect(container.firstChild).toHaveClass('custom-class');
  });
});

describe('FieldError', () => {
  test('renders field error with suggestions', () => {
    const error = 'This field is required';
    const suggestions = ['Please enter a value', 'This field cannot be empty'];

    render(<FieldError error={error} suggestions={suggestions} />);

    expect(screen.getByText('This field is required')).toBeInTheDocument();
    expect(screen.getByText('Please enter a value')).toBeInTheDocument();
    expect(screen.getByText('This field cannot be empty')).toBeInTheDocument();
  });

  test('does not render when no error', () => {
    const { container } = render(<FieldError />);
    expect(container.firstChild).toBeNull();
  });

  test('renders error without suggestions', () => {
    render(<FieldError error="Invalid input" />);

    expect(screen.getByText('Invalid input')).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  test('applies custom className', () => {
    const { container } = render(<FieldError error="Test error" className="custom-error" />);
    expect(container.firstChild).toHaveClass('custom-error');
  });
});

describe('NetworkStatus', () => {
  test('renders offline message when offline', () => {
    render(<NetworkStatus isOnline={false} />);

    expect(screen.getByText(/you're currently offline/i)).toBeInTheDocument();
    expect(screen.getByText(/changes will be saved locally/i)).toBeInTheDocument();
  });

  test('does not render when online', () => {
    const { container } = render(<NetworkStatus isOnline={true} />);
    expect(container.firstChild).toBeNull();
  });

  test('applies custom className when offline', () => {
    const { container } = render(<NetworkStatus isOnline={false} className="custom-network" />);
    expect(container.firstChild).toHaveClass('custom-network');
  });
});

describe('Error Display Integration', () => {
  test('handles multiple error types correctly', () => {
    const errors = [
      new ValidationError('email', 'Invalid email', 'INVALID'),
      new NetworkError('Connection failed', 500),
      new PersistenceError('save', new Error('DB error')),
      new FrameworkError('test', 'Framework error'),
    ];

    errors.forEach((error, index) => {
      const { unmount } = render(<ErrorDisplay error={error} key={index} />);

      // Each error should render without throwing - check for specific error type
      if (error instanceof ValidationError) {
        expect(screen.getByText('Validation Error')).toBeInTheDocument();
      } else if (error instanceof NetworkError) {
        expect(screen.getByText('Network Error')).toBeInTheDocument();
      } else if (error instanceof PersistenceError) {
        expect(screen.getByText('Persistence Error')).toBeInTheDocument();
      } else if (error instanceof FrameworkError) {
        expect(screen.getByText('Framework Error')).toBeInTheDocument();
      }

      unmount();
    });
  });

  test('handles error with custom suggestions', () => {
    const error = new ValidationError(
      'password',
      'Password too weak',
      'WEAK_PASSWORD',
      ['Use at least 8 characters', 'Include uppercase and lowercase letters', 'Add numbers and symbols']
    );

    render(<ErrorDisplay error={error} />);

    expect(screen.getByText('Password too weak')).toBeInTheDocument();
    // The suggestions are joined together in the description
    expect(screen.getByText(/Use at least 8 characters/)).toBeInTheDocument();
    expect(screen.getByText(/Include uppercase and lowercase letters/)).toBeInTheDocument();
    expect(screen.getByText(/Add numbers and symbols/)).toBeInTheDocument();
  });

  test('handles async suggestion actions', async () => {
    // This test verifies that the error display component renders suggestions correctly
    // The actual action functionality would be tested in integration tests
    const error = new Error('Test error');

    render(<ErrorDisplay error={error} />);

    // Should show default suggestions for unknown errors
    expect(screen.getByText('Refresh page')).toBeInTheDocument();
    expect(screen.getByText('Contact support')).toBeInTheDocument();
  });
});
