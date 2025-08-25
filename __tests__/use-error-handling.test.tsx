import { commonValidationRules, useErrorHandling } from '@/hooks/use-error-handling';
import {
  FrameworkError,
  NetworkError,
  OfflineManager,
  PersistenceError,
  ValidationError
} from '@/lib/error-handling';
import { act, renderHook } from '@testing-library/react';

// Mock the OfflineManager
jest.mock('@/lib/error-handling', () => ({
  ...jest.requireActual('@/lib/error-handling'),
  OfflineManager: {
    getStatus: jest.fn(() => true),
    onStatusChange: jest.fn(() => jest.fn()),
  },
}));

describe('useErrorHandling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should initialize with default state', () => {
    const { result } = renderHook(() => useErrorHandling());

    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isRetrying).toBe(false);
    expect(result.current.retryCount).toBe(0);
    expect(result.current.errorId).toBeNull();
    expect(result.current.isOnline).toBe(true);
    expect(result.current.canRetry).toBe(true);
  });

  test('should handle successful operation', async () => {
    const { result } = renderHook(() => useErrorHandling());
    const mockOperation = jest.fn().mockResolvedValue('success');

    let operationResult;
    await act(async () => {
      operationResult = await result.current.executeWithErrorHandling(mockOperation);
    });

    expect(operationResult).toBe('success');
    expect(result.current.error).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(mockOperation).toHaveBeenCalledTimes(1);
  });

  test('should handle operation failure', async () => {
    const { result } = renderHook(() => useErrorHandling());
    const error = new Error('Operation failed');
    const mockOperation = jest.fn().mockRejectedValue(error);

    let operationResult;
    await act(async () => {
      operationResult = await result.current.executeWithErrorHandling(mockOperation);
    });

    expect(operationResult).toBeNull();
    expect(result.current.error).toBe(error);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.errorId).toBeTruthy();
  });

  test('should call onError callback when error occurs', async () => {
    const onError = jest.fn();
    const { result } = renderHook(() => useErrorHandling({ onError }));
    const error = new Error('Test error');
    const mockOperation = jest.fn().mockRejectedValue(error);

    await act(async () => {
      await result.current.executeWithErrorHandling(mockOperation);
    });

    expect(onError).toHaveBeenCalledWith(error, expect.any(String));
  });

  test('should call onSuccess callback when operation succeeds', async () => {
    const onSuccess = jest.fn();
    const { result } = renderHook(() => useErrorHandling({ onSuccess }));
    const mockOperation = jest.fn().mockResolvedValue('success');

    await act(async () => {
      await result.current.executeWithErrorHandling(mockOperation);
    });

    expect(onSuccess).toHaveBeenCalledTimes(1);
  });

  test('should handle retry operation', async () => {
    const onRetry = jest.fn();
    const { result } = renderHook(() => useErrorHandling({ onRetry, maxRetries: 2 }));

    // First, create an error state
    const error = new Error('Initial error');
    const failingOperation = jest.fn().mockRejectedValue(error);

    await act(async () => {
      await result.current.executeWithErrorHandling(failingOperation);
    });

    expect(result.current.error).toBe(error);
    expect(result.current.retryCount).toBe(0);

    // Now retry with a successful operation
    const successfulOperation = jest.fn().mockResolvedValue('success');

    let retryResult;
    await act(async () => {
      retryResult = await result.current.retry(successfulOperation);
    });

    expect(retryResult).toBe('success');
    expect(result.current.error).toBeNull();
    expect(result.current.retryCount).toBe(1);
    expect(onRetry).toHaveBeenCalledWith(1);
  });

  test('should not retry beyond max retries', async () => {
    const { result } = renderHook(() => useErrorHandling({ maxRetries: 1 }));

    // Create error state with max retries reached
    await act(async () => {
      await result.current.executeWithErrorHandling(jest.fn().mockRejectedValue(new Error('Error')));
    });

    await act(async () => {
      await result.current.retry(jest.fn().mockRejectedValue(new Error('Retry error')));
    });

    expect(result.current.retryCount).toBe(1);
    expect(result.current.canRetry).toBe(false);

    // Try to retry again - should return null
    let retryResult;
    await act(async () => {
      retryResult = await result.current.retry(jest.fn().mockResolvedValue('success'));
    });

    expect(retryResult).toBeNull();
  });

  test('should clear error state', () => {
    const { result } = renderHook(() => useErrorHandling());

    // Set error state manually for testing
    act(() => {
      result.current.logError(new Error('Test error'));
    });

    expect(result.current.error).toBeTruthy();

    act(() => {
      result.current.clearError();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.errorId).toBeNull();
  });

  test('should validate field correctly', () => {
    const { result } = renderHook(() => useErrorHandling());

    const rules = [
      commonValidationRules.required('Name'),
      commonValidationRules.minLength(3, 'Name'),
    ];

    const validResult = result.current.validateField('John', rules);
    expect(validResult.isValid).toBe(true);
    expect(validResult.errors).toHaveLength(0);

    const invalidResult = result.current.validateField('', rules);
    expect(invalidResult.isValid).toBe(false);
    expect(invalidResult.errors).toContain('Name is required');
  });

  test('should create validation error', () => {
    const { result } = renderHook(() => useErrorHandling());

    const error = result.current.createValidationError('email', 'Invalid email', ['Use format: user@domain.com']);

    expect(error).toBeInstanceOf(ValidationError);
    expect(error.field).toBe('email');
    expect(error.message).toBe('Invalid email');
    expect(error.suggestions).toEqual(['Use format: user@domain.com']);
  });

  test('should create network error', () => {
    const { result } = renderHook(() => useErrorHandling());

    const error = result.current.createNetworkError('Connection failed', 500, false);

    expect(error).toBeInstanceOf(NetworkError);
    expect(error.message).toBe('Connection failed');
    expect(error.status).toBe(500);
    expect(error.retryable).toBe(false);
  });

  test('should create persistence error', () => {
    const { result } = renderHook(() => useErrorHandling());
    const originalError = new Error('Database error');

    const error = result.current.createPersistenceError('save data', originalError, false);

    expect(error).toBeInstanceOf(PersistenceError);
    expect(error.operation).toBe('save data');
    expect(error.originalError).toBe(originalError);
    expect(error.retryable).toBe(false);
  });

  test('should create framework error', () => {
    const { result } = renderHook(() => useErrorHandling());

    const error = result.current.createFrameworkError('test-framework', 'Component failed', false);

    expect(error).toBeInstanceOf(FrameworkError);
    expect(error.frameworkId).toBe('test-framework');
    expect(error.message).toBe('Framework test-framework: Component failed');
    expect(error.recoverable).toBe(false);
  });

  test('should track online status changes', () => {
    const mockOnStatusChange = OfflineManager.onStatusChange as jest.Mock;
    const mockUnsubscribe = jest.fn();
    mockOnStatusChange.mockReturnValue(mockUnsubscribe);

    const { unmount } = renderHook(() => useErrorHandling());

    expect(mockOnStatusChange).toHaveBeenCalledWith(expect.any(Function));

    unmount();

    expect(mockUnsubscribe).toHaveBeenCalled();
  });

  test('should classify errors correctly', () => {
    const { result } = renderHook(() => useErrorHandling());

    const validationError = new ValidationError('field', 'Invalid', 'INVALID');
    const classification = result.current.classifyError(validationError);

    expect(classification.type).toBe('validation');
    expect(classification.retryable).toBe(false);
    expect(classification.suggestions).toHaveLength(1);
  });
});

describe('commonValidationRules', () => {
  test('required rule should work correctly', () => {
    const rule = commonValidationRules.required('Name');

    expect(rule.validate('John').isValid).toBe(true);
    expect(rule.validate('').isValid).toBe(false);
    expect(rule.validate(null).isValid).toBe(false);
    expect(rule.validate(undefined).isValid).toBe(false);

    const result = rule.validate('');
    expect(result.errors).toContain('Name is required');
    expect(result.suggestions).toContain('Please provide a value for Name');
  });

  test('minLength rule should work correctly', () => {
    const rule = commonValidationRules.minLength(5, 'Password');

    expect(rule.validate('12345').isValid).toBe(true);
    expect(rule.validate('123456').isValid).toBe(true);
    expect(rule.validate('1234').isValid).toBe(false);
    expect(rule.validate('').isValid).toBe(true); // Empty is valid for minLength

    const result = rule.validate('123');
    expect(result.errors).toContain('Password must be at least 5 characters long');
    expect(result.suggestions).toContain('Add 2 more characters');
  });

  test('maxLength rule should work correctly', () => {
    const rule = commonValidationRules.maxLength(10, 'Username');

    expect(rule.validate('john').isValid).toBe(true);
    expect(rule.validate('1234567890').isValid).toBe(true);
    expect(rule.validate('12345678901').isValid).toBe(false);

    const result = rule.validate('verylongusername');
    expect(result.errors).toContain('Username must be no more than 10 characters long');
    expect(result.suggestions).toContain('Remove 6 characters');
  });

  test('email rule should work correctly', () => {
    const rule = commonValidationRules.email('Email');

    expect(rule.validate('user@example.com').isValid).toBe(true);
    expect(rule.validate('test.email+tag@domain.co.uk').isValid).toBe(true);
    expect(rule.validate('invalid-email').isValid).toBe(false);
    expect(rule.validate('user@').isValid).toBe(false);
    expect(rule.validate('').isValid).toBe(true); // Empty is valid for email

    const result = rule.validate('invalid-email');
    expect(result.errors).toContain('Email must be a valid email address');
    expect(result.suggestions).toContain('Please enter a valid email address (e.g., user@example.com)');
  });

  test('url rule should work correctly', () => {
    const rule = commonValidationRules.url('Website');

    expect(rule.validate('https://example.com').isValid).toBe(true);
    expect(rule.validate('http://localhost:3000').isValid).toBe(true);
    expect(rule.validate('ftp://files.example.com').isValid).toBe(true);
    expect(rule.validate('invalid-url').isValid).toBe(false);
    expect(rule.validate('').isValid).toBe(true); // Empty is valid for URL

    const result = rule.validate('not-a-url');
    expect(result.errors).toContain('Website must be a valid URL');
    expect(result.suggestions).toContain('Please enter a valid URL (e.g., https://example.com)');
  });

  test('numeric rule should work correctly', () => {
    const rule = commonValidationRules.numeric('Age');

    expect(rule.validate('25').isValid).toBe(true);
    expect(rule.validate('3.14').isValid).toBe(true);
    expect(rule.validate('-10').isValid).toBe(true);
    expect(rule.validate('abc').isValid).toBe(false);
    expect(rule.validate('').isValid).toBe(true); // Empty is valid for numeric

    const result = rule.validate('not-a-number');
    expect(result.errors).toContain('Age must be a valid number');
    expect(result.suggestions).toContain('Please enter a numeric value');
  });

  test('range rule should work correctly', () => {
    const rule = commonValidationRules.range(1, 100, 'Score');

    expect(rule.validate(50).isValid).toBe(true);
    expect(rule.validate(1).isValid).toBe(true);
    expect(rule.validate(100).isValid).toBe(true);
    expect(rule.validate(0).isValid).toBe(false);
    expect(rule.validate(101).isValid).toBe(false);

    const result = rule.validate(150);
    expect(result.errors).toContain('Score must be between 1 and 100');
    expect(result.suggestions).toContain('Please enter a value between 1 and 100');
  });
});
