'use client';

import { useErrorHandling } from '@/hooks/use-error-handling';
import React, { ReactNode } from 'react';
import { ErrorBoundary } from './ErrorBoundary';
import { ErrorMessage } from './ErrorMessages';
import { SearchErrorBoundary } from './SearchErrorBoundary';
import { TheoryContentErrorBoundary } from './TheoryContentErrorBoundary';

interface ErrorHandlingWrapperProps {
  children: ReactNode;
  type?: 'general' | 'theory' | 'search';
  theoryId?: string;
  onRetry?: () => void;
  onLogin?: () => void;
  onUpgrade?: () => void;
  onReportIssue?: () => void;
  onFallbackToBasicNavigation?: () => void;
}

export const ErrorHandlingWrapper: React.FC<ErrorHandlingWrapperProps> = ({
  children,
  type = 'general',
  theoryId,
  onRetry,
  onLogin,
  onUpgrade,
  onReportIssue,
  onFallbackToBasicNavigation,
}) => {
  const { hasError, error, clearError } = useErrorHandling({ showToast: false });

  const handleRetry = () => {
    clearError();
    onRetry?.();
  };

  const handleReportIssue = () => {
    if (onReportIssue) {
      onReportIssue();
    } else {
      // Default report issue behavior
      const subject = `Knowledge Hub Error - ${type}${theoryId ? ` - ${theoryId}` : ''}`;
      const body = `Error occurred in Knowledge Hub.\n\nError Type: ${error?.type}\nMessage: ${error?.message}\nContext: ${JSON.stringify(error?.context)}`;
      window.open(`mailto:support@build24.dev?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
    }
  };

  // If there's a runtime error, show the error message
  if (hasError && error) {
    return (
      <ErrorMessage
        error={error}
        onRetry={handleRetry}
        onLogin={onLogin}
        onUpgrade={onUpgrade}
        onReportIssue={handleReportIssue}
      />
    );
  }

  // Wrap with appropriate error boundary based on type
  switch (type) {
    case 'theory':
      return (
        <TheoryContentErrorBoundary theoryId={theoryId} onRetry={onRetry}>
          {children}
        </TheoryContentErrorBoundary>
      );

    case 'search':
      return (
        <SearchErrorBoundary onFallbackToBasicNavigation={onFallbackToBasicNavigation}>
          {children}
        </SearchErrorBoundary>
      );

    default:
      return (
        <ErrorBoundary onError={(error, errorInfo) => {
          console.error('Error boundary caught error:', error, errorInfo);
        }}>
          {children}
        </ErrorBoundary>
      );
  }
};
