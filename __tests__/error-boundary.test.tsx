import { ErrorBoundary } from '@/components/knowledge-hub/ErrorBoundary';
import { SearchErrorBoundary } from '@/components/knowledge-hub/SearchErrorBoundary';
import { TheoryContentErrorBoundary } from '@/components/knowledge-hub/TheoryContentErrorBoundary';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

// Mock component that throws an error
const ThrowError: React.FC<{ shouldThrow?: boolean }> = ({ shouldThrow = true }) => {
  if (shouldThrow) {
    throw new Error('Test error');
  }
  return <div>No error</div>;
};

describe('ErrorBoundary', () => {
  // Suppress console.error for these tests
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  afterAll(() => {
    console.error = originalError;
  });

  it('should render children when there is no error', () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={false} />
      </ErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('should render error UI when there is an error', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText(/We encountered an unexpected error/)).toBeInTheDocument();
  });

  it('should render custom fallback when provided', () => {
    const customFallback = <div>Custom error message</div>;

    render(
      <ErrorBoundary fallback={customFallback}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Custom error message')).toBeInTheDocument();
  });

  it('should call onError callback when error occurs', () => {
    const onError = jest.fn();

    render(
      <ErrorBoundary onError={onError}>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(onError).toHaveBeenCalledWith(
      expect.any(Error),
      expect.objectContaining({
        componentStack: expect.any(String)
      })
    );
  });

  it('should show retry button when error occurs', () => {
    render(
      <ErrorBoundary>
        <ThrowError />
      </ErrorBoundary>
    );

    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('Try Again')).toBeInTheDocument();
    expect(screen.getByText('Refresh Page')).toBeInTheDocument();
  });
});

describe('TheoryContentErrorBoundary', () => {
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  afterAll(() => {
    console.error = originalError;
  });

  it('should render children when there is no error', () => {
    render(
      <TheoryContentErrorBoundary theoryId="test-theory">
        <ThrowError shouldThrow={false} />
      </TheoryContentErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('should render theory-specific error UI when there is an error', () => {
    render(
      <TheoryContentErrorBoundary theoryId="test-theory">
        <ThrowError />
      </TheoryContentErrorBoundary>
    );

    expect(screen.getByText('Content Loading Error')).toBeInTheDocument();
    expect(screen.getByText('Unable to load theory content')).toBeInTheDocument();
  });

  it('should include theory ID in error context', () => {
    const consoleSpy = jest.spyOn(console, 'error');

    render(
      <TheoryContentErrorBoundary theoryId="test-theory-123">
        <ThrowError />
      </TheoryContentErrorBoundary>
    );

    expect(consoleSpy).toHaveBeenCalledWith(
      'Theory content error:',
      expect.objectContaining({
        theoryId: 'test-theory-123'
      })
    );
  });

  it('should call onRetry when retry button is clicked', () => {
    const onRetry = jest.fn();

    render(
      <TheoryContentErrorBoundary theoryId="test-theory" onRetry={onRetry}>
        <ThrowError />
      </TheoryContentErrorBoundary>
    );

    const retryButton = screen.getByText('Try Again');
    fireEvent.click(retryButton);

    expect(onRetry).toHaveBeenCalled();
  });
});

describe('SearchErrorBoundary', () => {
  const originalError = console.error;
  beforeAll(() => {
    console.error = jest.fn();
  });
  afterAll(() => {
    console.error = originalError;
  });

  it('should render children when there is no error', () => {
    render(
      <SearchErrorBoundary>
        <ThrowError shouldThrow={false} />
      </SearchErrorBoundary>
    );

    expect(screen.getByText('No error')).toBeInTheDocument();
  });

  it('should render search-specific error UI when there is an error', () => {
    render(
      <SearchErrorBoundary>
        <ThrowError />
      </SearchErrorBoundary>
    );

    expect(screen.getByText('Search temporarily unavailable')).toBeInTheDocument();
    expect(screen.getByText(/search functionality is currently experiencing issues/)).toBeInTheDocument();
  });

  it('should show fallback navigation option when callback provided', () => {
    const onFallback = jest.fn();

    render(
      <SearchErrorBoundary onFallbackToBasicNavigation={onFallback}>
        <ThrowError />
      </SearchErrorBoundary>
    );

    const fallbackButton = screen.getByText('Browse Categories');
    expect(fallbackButton).toBeInTheDocument();

    fireEvent.click(fallbackButton);
    expect(onFallback).toHaveBeenCalled();
  });

  it('should allow retry functionality', () => {
    render(
      <SearchErrorBoundary>
        <ThrowError />
      </SearchErrorBoundary>
    );

    const retryButton = screen.getByText('Retry Search');
    expect(retryButton).toBeInTheDocument();

    fireEvent.click(retryButton);
    // Error boundary should reset
  });
});
