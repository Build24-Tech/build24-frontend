'use client';

import { useCallback, useState } from 'react';
import { toast } from 'sonner';

interface ErrorState {
  hasError: boolean;
  error: Error | null;
  errorMessage: string;
}

interface UseErrorHandlingOptions {
  showToast?: boolean;
  logErrors?: boolean;
  fallbackMessage?: string;
}

/**
 * Custom hook for consistent error handling across components
 * Provides error state management and user-friendly error messages
 */
export function useErrorHandling(options: UseErrorHandlingOptions = {}) {
  const {
    showToast = true,
    logErrors = true,
    fallbackMessage = 'Something went wrong. Please try again.'
  } = options;

  const [errorState, setErrorState] = useState<ErrorState>({
    hasError: false,
    error: null,
    errorMessage: ''
  });

  const handleError = useCallback((error: Error | string, context?: string) => {
    const errorObj = typeof error === 'string' ? new Error(error) : error;
    const message = errorObj.message || fallbackMessage;

    // Log error for debugging
    if (logErrors) {
      console.error(`Error${context ? ` in ${context}` : ''}:`, errorObj);
    }

    // Update error state
    setErrorState({
      hasError: true,
      error: errorObj,
      errorMessage: message
    });

    // Show toast notification
    if (showToast) {
      toast.error(message);
    }
  }, [showToast, logErrors, fallbackMessage]);

  const clearError = useCallback(() => {
    setErrorState({
      hasError: false,
      error: null,
      errorMessage: ''
    });
  }, []);

  const retryWithErrorHandling = useCallback(async (
    operation: () => Promise<void>,
    context?: string
  ) => {
    try {
      clearError();
      await operation();
    } catch (error) {
      handleError(error as Error, context);
    }
  }, [handleError, clearError]);

  return {
    ...errorState,
    handleError,
    clearError,
    retryWithErrorHandling
  };
}

/**
 * Hook for handling async operations with loading and error states
 */
export function useAsyncOperation<T = any>() {
  const [isLoading, setIsLoading] = useState(false);
  const { handleError, clearError, hasError, errorMessage } = useErrorHandling();

  const execute = useCallback(async (
    operation: () => Promise<T>,
    context?: string
  ): Promise<T | null> => {
    try {
      setIsLoading(true);
      clearError();
      const result = await operation();
      return result;
    } catch (error) {
      handleError(error as Error, context);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [handleError, clearError]);

  return {
    execute,
    isLoading,
    hasError,
    errorMessage,
    clearError
  };
}

/**
 * Hook for handling form validation errors
 */
export function useFormErrorHandling() {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const setFieldError = useCallback((field: string, message: string) => {
    setFieldErrors(prev => ({
      ...prev,
      [field]: message
    }));
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setFieldErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setFieldErrors({});
  }, []);

  const hasFieldError = useCallback((field: string) => {
    return Boolean(fieldErrors[field]);
  }, [fieldErrors]);

  const getFieldError = useCallback((field: string) => {
    return fieldErrors[field] || '';
  }, [fieldErrors]);

  return {
    fieldErrors,
    setFieldError,
    clearFieldError,
    clearAllErrors,
    hasFieldError,
    getFieldError,
    hasErrors: Object.keys(fieldErrors).length > 0
  };
}
