'use client';

import {
  classifyError,
  ErrorLogger,
  FrameworkError,
  NetworkError,
  OfflineManager,
  PersistenceError,
  RetryManager,
  ValidationError
} from '@/lib/error-handling';
import { useCallback, useEffect, useState } from 'react';

interface ErrorState {
  error: Error | null;
  isLoading: boolean;
  isRetrying: boolean;
  retryCount: number;
  errorId: string | null;
}

interface UseErrorHandlingOptions {
  maxRetries?: number;
  onError?: (error: Error, errorId: string) => void;
  onRetry?: (retryCount: number) => void;
  onSuccess?: () => void;
}

export function useErrorHandling(options: UseErrorHandlingOptions = {}) {
  const { maxRetries = 3, onError, onRetry, onSuccess } = options;

  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isLoading: false,
    isRetrying: false,
    retryCount: 0,
    errorId: null,
  });

  const [isOnline, setIsOnline] = useState(OfflineManager.getStatus());

  // Listen for online/offline status changes
  useEffect(() => {
    const unsubscribe = OfflineManager.onStatusChange(setIsOnline);
    return unsubscribe;
  }, []);

  const clearError = useCallback(() => {
    setErrorState(prev => ({
      ...prev,
      error: null,
      errorId: null,
      isRetrying: false,
    }));
  }, []);

  const logError = useCallback((error: Error, context: Record<string, any> = {}) => {
    const { severity } = classifyError(error);
    const errorId = ErrorLogger.log(error, severity, context);

    setErrorState(prev => ({
      ...prev,
      error,
      errorId,
      isLoading: false,
      isRetrying: false,
    }));

    if (onError) {
      onError(error, errorId);
    }

    return errorId;
  }, [onError]);

  const executeWithErrorHandling = useCallback(async <T>(
    operation: () => Promise<T>,
    context: Record<string, any> = {}
  ): Promise<T | null> => {
    setErrorState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      errorId: null,
    }));

    try {
      const result = await RetryManager.withRetry(
        operation,
        maxRetries,
        1000
      );

      setErrorState(prev => ({
        ...prev,
        isLoading: false,
        retryCount: 0,
      }));

      if (onSuccess) {
        onSuccess();
      }

      return result;
    } catch (error) {
      logError(error as Error, context);
      return null;
    }
  }, [maxRetries, logError, onSuccess]);

  const retry = useCallback(async <T>(
    operation: () => Promise<T>,
    context: Record<string, any> = {}
  ): Promise<T | null> => {
    if (errorState.retryCount >= maxRetries) {
      return null;
    }

    setErrorState(prev => ({
      ...prev,
      isRetrying: true,
      retryCount: prev.retryCount + 1,
    }));

    if (onRetry) {
      onRetry(errorState.retryCount + 1);
    }

    try {
      const result = await operation();

      setErrorState(prev => ({
        ...prev,
        error: null,
        errorId: null,
        isRetrying: false,
        isLoading: false,
      }));

      if (onSuccess) {
        onSuccess();
      }

      return result;
    } catch (error) {
      logError(error as Error, { ...context, isRetry: true });
      return null;
    }
  }, [errorState.retryCount, maxRetries, onRetry, onSuccess, logError]);

  const validateField = useCallback((
    value: any,
    rules: ValidationRule[]
  ): ValidationResult => {
    const errors: string[] = [];
    const suggestions: string[] = [];

    for (const rule of rules) {
      const result = rule.validate(value);
      if (!result.isValid) {
        errors.push(result.message);
        if (result.suggestion) {
          suggestions.push(result.suggestion);
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      suggestions,
    };
  }, []);

  const createValidationError = useCallback((
    field: string,
    message: string,
    suggestions: string[] = []
  ) => {
    return new ValidationError(field, message, 'VALIDATION_FAILED', suggestions);
  }, []);

  const createNetworkError = useCallback((
    message: string,
    status?: number,
    retryable: boolean = true
  ) => {
    return new NetworkError(message, status, retryable);
  }, []);

  const createPersistenceError = useCallback((
    operation: string,
    originalError: Error,
    retryable: boolean = true
  ) => {
    return new PersistenceError(operation, originalError, retryable);
  }, []);

  const createFrameworkError = useCallback((
    frameworkId: string,
    message: string,
    recoverable: boolean = true
  ) => {
    return new FrameworkError(frameworkId, message, recoverable);
  }, []);

  return {
    // State
    error: errorState.error,
    isLoading: errorState.isLoading,
    isRetrying: errorState.isRetrying,
    retryCount: errorState.retryCount,
    errorId: errorState.errorId,
    isOnline,
    canRetry: errorState.retryCount < maxRetries,

    // Actions
    executeWithErrorHandling,
    retry,
    clearError,
    logError,
    validateField,

    // Error creators
    createValidationError,
    createNetworkError,
    createPersistenceError,
    createFrameworkError,

    // Utilities
    classifyError: (error: Error) => classifyError(error),
  };
}

// Validation rule interface and common rules
export interface ValidationRule {
  validate: (value: any) => ValidationResult;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  suggestions: string[];
}

export const commonValidationRules = {
  required: (fieldName: string): ValidationRule => ({
    validate: (value: any) => ({
      isValid: value !== null && value !== undefined && value !== '',
      errors: value === null || value === undefined || value === ''
        ? [`${fieldName} is required`]
        : [],
      suggestions: value === null || value === undefined || value === ''
        ? [`Please provide a value for ${fieldName}`]
        : [],
    }),
  }),

  minLength: (min: number, fieldName: string): ValidationRule => ({
    validate: (value: string) => ({
      isValid: !value || value.length >= min,
      errors: value && value.length < min
        ? [`${fieldName} must be at least ${min} characters long`]
        : [],
      suggestions: value && value.length < min
        ? [`Add ${min - value.length} more characters`]
        : [],
    }),
  }),

  maxLength: (max: number, fieldName: string): ValidationRule => ({
    validate: (value: string) => ({
      isValid: !value || value.length <= max,
      errors: value && value.length > max
        ? [`${fieldName} must be no more than ${max} characters long`]
        : [],
      suggestions: value && value.length > max
        ? [`Remove ${value.length - max} characters`]
        : [],
    }),
  }),

  email: (fieldName: string = 'Email'): ValidationRule => ({
    validate: (value: string) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return {
        isValid: !value || emailRegex.test(value),
        errors: value && !emailRegex.test(value)
          ? [`${fieldName} must be a valid email address`]
          : [],
        suggestions: value && !emailRegex.test(value)
          ? ['Please enter a valid email address (e.g., user@example.com)']
          : [],
      };
    },
  }),

  url: (fieldName: string = 'URL'): ValidationRule => ({
    validate: (value: string) => {
      try {
        if (!value) return { isValid: true, errors: [], suggestions: [] };
        new URL(value);
        return { isValid: true, errors: [], suggestions: [] };
      } catch {
        return {
          isValid: false,
          errors: [`${fieldName} must be a valid URL`],
          suggestions: ['Please enter a valid URL (e.g., https://example.com)'],
        };
      }
    },
  }),

  numeric: (fieldName: string): ValidationRule => ({
    validate: (value: any) => {
      const isNumeric = !isNaN(Number(value)) && isFinite(Number(value));
      return {
        isValid: !value || isNumeric,
        errors: value && !isNumeric
          ? [`${fieldName} must be a valid number`]
          : [],
        suggestions: value && !isNumeric
          ? ['Please enter a numeric value']
          : [],
      };
    },
  }),

  range: (min: number, max: number, fieldName: string): ValidationRule => ({
    validate: (value: number) => {
      const numValue = Number(value);
      const inRange = numValue >= min && numValue <= max;
      return {
        isValid: value === null || value === undefined || value === '' || inRange,
        errors: value !== null && value !== undefined && value !== '' && !inRange
          ? [`${fieldName} must be between ${min} and ${max}`]
          : [],
        suggestions: value !== null && value !== undefined && value !== '' && !inRange
          ? [`Please enter a value between ${min} and ${max}`]
          : [],
      };
    },
  }),
};
