import {
  classifyError,
  ERROR_MESSAGES,
  ErrorLogger,
  ErrorSeverity,
  FrameworkError,
  NetworkError,
  OfflineManager,
  PersistenceError,
  RetryManager,
  ValidationError,
} from '@/lib/error-handling';

// Mock window and navigator for testing
const mockNavigator = {
  onLine: true,
  userAgent: 'test-agent',
};

const mockWindow = {
  addEventListener: jest.fn(),
  location: { href: 'http://test.com' },
  navigator: mockNavigator,
};

// Only define if not already defined
if (typeof window === 'undefined') {
  Object.defineProperty(global, 'window', {
    value: mockWindow,
    writable: true,
  });
}

if (typeof navigator === 'undefined') {
  Object.defineProperty(global, 'navigator', {
    value: mockNavigator,
    writable: true,
  });
}

describe('Error Handling', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset error logs
    ErrorLogger['logs'] = [];
  });

  describe('Error Classes', () => {
    test('ValidationError should be created correctly', () => {
      const error = new ValidationError('email', 'Invalid email', 'INVALID_EMAIL', ['Use format: user@domain.com']);

      expect(error.name).toBe('ValidationError');
      expect(error.field).toBe('email');
      expect(error.message).toBe('Invalid email');
      expect(error.code).toBe('INVALID_EMAIL');
      expect(error.suggestions).toEqual(['Use format: user@domain.com']);
    });

    test('PersistenceError should be created correctly', () => {
      const originalError = new Error('Database connection failed');
      const error = new PersistenceError('save user data', originalError, false);

      expect(error.name).toBe('PersistenceError');
      expect(error.operation).toBe('save user data');
      expect(error.originalError).toBe(originalError);
      expect(error.retryable).toBe(false);
      expect(error.message).toBe('Failed to save user data: Database connection failed');
    });

    test('FrameworkError should be created correctly', () => {
      const error = new FrameworkError('validation-framework', 'Template not found', false);

      expect(error.name).toBe('FrameworkError');
      expect(error.frameworkId).toBe('validation-framework');
      expect(error.message).toBe('Framework validation-framework: Template not found');
      expect(error.recoverable).toBe(false);
    });

    test('NetworkError should be created correctly', () => {
      const error = new NetworkError('Connection timeout', 408, true);

      expect(error.name).toBe('NetworkError');
      expect(error.message).toBe('Connection timeout');
      expect(error.status).toBe(408);
      expect(error.retryable).toBe(true);
    });
  });

  describe('Error Classification', () => {
    test('should classify ValidationError correctly', () => {
      const error = new ValidationError('name', 'Name is required', 'REQUIRED');
      const classification = classifyError(error);

      expect(classification.type).toBe('validation');
      expect(classification.severity).toBe(ErrorSeverity.MEDIUM);
      expect(classification.retryable).toBe(false);
      expect(classification.userMessage).toBe('Name is required');
      expect(classification.suggestions).toHaveLength(1);
      expect(classification.suggestions[0].title).toBe('Check your input');
    });

    test('should classify NetworkError correctly', () => {
      const error = new NetworkError('Server error', 500, true);
      const classification = classifyError(error);

      expect(classification.type).toBe('network');
      expect(classification.severity).toBe(ErrorSeverity.HIGH);
      expect(classification.retryable).toBe(true);
      expect(classification.suggestions).toHaveLength(2);
      expect(classification.suggestions[0].title).toBe('Check connection');
      expect(classification.suggestions[1].title).toBe('Retry');
    });

    test('should classify offline NetworkError correctly', () => {
      const error = new NetworkError('Offline', 0, false);
      const classification = classifyError(error);

      expect(classification.userMessage).toBe(ERROR_MESSAGES.NETWORK.OFFLINE);
    });

    test('should classify PersistenceError correctly', () => {
      const originalError = new Error('Disk full');
      const error = new PersistenceError('save file', originalError);
      const classification = classifyError(error);

      expect(classification.type).toBe('persistence');
      expect(classification.severity).toBe(ErrorSeverity.HIGH);
      expect(classification.retryable).toBe(true);
      expect(classification.userMessage).toBe(ERROR_MESSAGES.PERSISTENCE.SAVE_FAILED);
    });

    test('should classify FrameworkError correctly', () => {
      const error = new FrameworkError('test-framework', 'Component failed', true);
      const classification = classifyError(error);

      expect(classification.type).toBe('framework');
      expect(classification.severity).toBe(ErrorSeverity.MEDIUM);
      expect(classification.retryable).toBe(true);
      expect(classification.suggestions).toHaveLength(2);
    });

    test('should classify unknown error correctly', () => {
      const error = new Error('Unknown error');
      const classification = classifyError(error);

      expect(classification.type).toBe('unknown');
      expect(classification.severity).toBe(ErrorSeverity.MEDIUM);
      expect(classification.retryable).toBe(true);
      expect(classification.userMessage).toBe('An unexpected error occurred. Please try again.');
    });
  });

  describe('RetryManager', () => {
    test('should succeed on first attempt', async () => {
      const operation = jest.fn().mockResolvedValue('success');

      const result = await RetryManager.withRetry(operation, 3, 100);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(1);
    });

    test('should retry on failure and eventually succeed', async () => {
      const operation = jest.fn()
        .mockRejectedValueOnce(new Error('Temporary failure'))
        .mockRejectedValueOnce(new Error('Another failure'))
        .mockResolvedValue('success');

      const result = await RetryManager.withRetry(operation, 3, 10);

      expect(result).toBe('success');
      expect(operation).toHaveBeenCalledTimes(3);
    });

    test('should not retry ValidationError', async () => {
      const error = new ValidationError('field', 'Invalid', 'INVALID');
      const operation = jest.fn().mockRejectedValue(error);

      await expect(RetryManager.withRetry(operation, 3, 10)).rejects.toThrow(ValidationError);
      expect(operation).toHaveBeenCalledTimes(1);
    });

    test('should not retry non-retryable NetworkError', async () => {
      const error = new NetworkError('Bad request', 400, false);
      const operation = jest.fn().mockRejectedValue(error);

      await expect(RetryManager.withRetry(operation, 3, 10)).rejects.toThrow(NetworkError);
      expect(operation).toHaveBeenCalledTimes(1);
    });

    test('should exhaust retries and throw last error', async () => {
      const error = new Error('Persistent failure');
      const operation = jest.fn().mockRejectedValue(error);

      await expect(RetryManager.withRetry(operation, 2, 10)).rejects.toThrow('Persistent failure');
      expect(operation).toHaveBeenCalledTimes(3); // Initial + 2 retries
    });
  });

  describe('ErrorLogger', () => {
    test('should log error correctly', () => {
      const error = new Error('Test error');
      const context = { userId: 'user123', projectId: 'project456' };

      const errorId = ErrorLogger.log(error, ErrorSeverity.HIGH, context);

      expect(errorId).toMatch(/^error_\d+_[a-z0-9]+$/);

      const logs = ErrorLogger.getLogs();
      expect(logs).toHaveLength(1);
      expect(logs[0].error).toBe(error);
      expect(logs[0].severity).toBe(ErrorSeverity.HIGH);
      expect(logs[0].context.userId).toBe('user123');
      expect(logs[0].context.projectId).toBe('project456');
      expect(logs[0].resolved).toBe(false);
    });

    test('should resolve error correctly', () => {
      const error = new Error('Test error');
      const errorId = ErrorLogger.log(error, ErrorSeverity.MEDIUM);

      ErrorLogger.resolve(errorId, 'User refreshed page');

      const logs = ErrorLogger.getLogs();
      expect(logs[0].resolved).toBe(true);
      expect(logs[0].resolution).toBe('User refreshed page');
      expect(logs[0].resolvedAt).toBeInstanceOf(Date);
    });

    test('should filter logs correctly', () => {
      ErrorLogger.log(new Error('Error 1'), ErrorSeverity.HIGH, { userId: 'user1' });
      ErrorLogger.log(new Error('Error 2'), ErrorSeverity.LOW, { userId: 'user2' });
      ErrorLogger.log(new Error('Error 3'), ErrorSeverity.HIGH, { userId: 'user1' });

      const highSeverityLogs = ErrorLogger.getLogs({ severity: ErrorSeverity.HIGH });
      expect(highSeverityLogs).toHaveLength(2);

      const user1Logs = ErrorLogger.getLogs({ userId: 'user1' });
      expect(user1Logs).toHaveLength(2);

      const resolvedLogs = ErrorLogger.getLogs({ resolved: true });
      expect(resolvedLogs).toHaveLength(0);
    });
  });

  describe('OfflineManager', () => {
    test('should initialize correctly', () => {
      // Mock window.addEventListener if not already mocked
      if (typeof window !== 'undefined') {
        window.addEventListener = jest.fn();
      }

      OfflineManager.initialize();

      if (typeof window !== 'undefined') {
        expect(window.addEventListener).toHaveBeenCalledWith('online', expect.any(Function));
        expect(window.addEventListener).toHaveBeenCalledWith('offline', expect.any(Function));
      }
    });

    test('should return correct online status', () => {
      expect(OfflineManager.getStatus()).toBe(true);
    });

    test('should handle status change listeners', () => {
      const listener = jest.fn();
      const unsubscribe = OfflineManager.onStatusChange(listener);

      // Manually trigger the listener to simulate offline event
      OfflineManager['notifyListeners'](false);

      expect(listener).toHaveBeenCalledWith(false);

      // Test unsubscribe
      unsubscribe();

      // Manually trigger the listener again to simulate online event
      OfflineManager['notifyListeners'](true);

      // Listener should not be called after unsubscribe
      expect(listener).toHaveBeenCalledTimes(1);
    });

    test('should queue operations when offline', () => {
      const operation = jest.fn().mockResolvedValue(undefined);

      // Set offline
      mockNavigator.onLine = false;
      OfflineManager['isOnline'] = false;

      OfflineManager.queueOperation(operation);

      // Operation should not be called immediately
      expect(operation).not.toHaveBeenCalled();

      // Simulate going online
      mockNavigator.onLine = true;
      OfflineManager['isOnline'] = true;
      OfflineManager['processPendingOperations']();

      // Wait for async operation
      setTimeout(() => {
        expect(operation).toHaveBeenCalled();
      }, 0);
    });
  });

  describe('Error Messages', () => {
    test('should have all required error message categories', () => {
      expect(ERROR_MESSAGES.VALIDATION).toBeDefined();
      expect(ERROR_MESSAGES.NETWORK).toBeDefined();
      expect(ERROR_MESSAGES.PERSISTENCE).toBeDefined();
      expect(ERROR_MESSAGES.FRAMEWORK).toBeDefined();
    });

    test('should have user-friendly messages', () => {
      expect(ERROR_MESSAGES.VALIDATION.REQUIRED_FIELD).toBe('This field is required to continue.');
      expect(ERROR_MESSAGES.NETWORK.CONNECTION_FAILED).toBe('Unable to connect. Please check your internet connection.');
      expect(ERROR_MESSAGES.PERSISTENCE.SAVE_FAILED).toBe('Unable to save your changes. Please try again.');
      expect(ERROR_MESSAGES.FRAMEWORK.LOAD_FAILED).toBe('Unable to load this framework. Please try refreshing the page.');
    });
  });
});
