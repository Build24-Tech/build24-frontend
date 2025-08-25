import { ErrorHandler, ErrorType } from '@/lib/error-handling';

describe('ErrorHandler', () => {
  describe('createError', () => {
    it('should create an AppError with correct properties', () => {
      const error = ErrorHandler.createError(
        ErrorType.NETWORK,
        'Network failed',
        new Error('Original error'),
        { context: 'test' }
      );

      expect(error.type).toBe(ErrorType.NETWORK);
      expect(error.message).toBe('Network failed');
      expect(error.originalError?.message).toBe('Original error');
      expect(error.context).toEqual({ context: 'test' });
      expect(error.timestamp).toBeInstanceOf(Date);
      expect(error.userMessage).toBe('Network connection issue. Please check your internet connection and try again.');
      expect(error.recoverable).toBe(true);
    });
  });

  describe('getUserMessage', () => {
    it('should return appropriate user messages for different error types', () => {
      expect(ErrorHandler.getUserMessage(ErrorType.NETWORK, 'test')).toContain('Network connection issue');
      expect(ErrorHandler.getUserMessage(ErrorType.AUTHENTICATION, 'test')).toContain('Please log in');
      expect(ErrorHandler.getUserMessage(ErrorType.AUTHORIZATION, 'test')).toContain('permission');
      expect(ErrorHandler.getUserMessage(ErrorType.CONTENT_NOT_FOUND, 'test')).toContain('could not be found');
      expect(ErrorHandler.getUserMessage(ErrorType.CONTENT_PARSING, 'test')).toContain('loading the content');
      expect(ErrorHandler.getUserMessage(ErrorType.VALIDATION, 'test')).toContain('Invalid data');
      expect(ErrorHandler.getUserMessage(ErrorType.UNKNOWN, 'test')).toContain('unexpected error');
    });
  });

  describe('isRecoverable', () => {
    it('should correctly identify recoverable errors', () => {
      expect(ErrorHandler.isRecoverable(ErrorType.NETWORK)).toBe(true);
      expect(ErrorHandler.isRecoverable(ErrorType.CONTENT_PARSING)).toBe(true);
      expect(ErrorHandler.isRecoverable(ErrorType.UNKNOWN)).toBe(true);

      expect(ErrorHandler.isRecoverable(ErrorType.AUTHENTICATION)).toBe(false);
      expect(ErrorHandler.isRecoverable(ErrorType.AUTHORIZATION)).toBe(false);
      expect(ErrorHandler.isRecoverable(ErrorType.CONTENT_NOT_FOUND)).toBe(false);
      expect(ErrorHandler.isRecoverable(ErrorType.VALIDATION)).toBe(false);
    });
  });

  describe('handleTheoryLoadError', () => {
    it('should handle 404 errors correctly', () => {
      const error = new Error('404 not found');
      const appError = ErrorHandler.handleTheoryLoadError(error, 'theory-123');

      expect(appError.type).toBe(ErrorType.CONTENT_NOT_FOUND);
      expect(appError.context).toEqual({ theoryId: 'theory-123' });
    });

    it('should handle network errors correctly', () => {
      const error = new Error('network timeout');
      const appError = ErrorHandler.handleTheoryLoadError(error, 'theory-123');

      expect(appError.type).toBe(ErrorType.NETWORK);
      expect(appError.context).toEqual({ theoryId: 'theory-123' });
    });

    it('should handle parsing errors correctly', () => {
      const error = new Error('markdown parse error');
      const appError = ErrorHandler.handleTheoryLoadError(error, 'theory-123');

      expect(appError.type).toBe(ErrorType.CONTENT_PARSING);
      expect(appError.context).toEqual({ theoryId: 'theory-123' });
    });

    it('should handle unknown errors correctly', () => {
      const error = new Error('unknown error');
      const appError = ErrorHandler.handleTheoryLoadError(error, 'theory-123');

      expect(appError.type).toBe(ErrorType.UNKNOWN);
      expect(appError.context).toEqual({ theoryId: 'theory-123' });
    });
  });

  describe('handleSearchError', () => {
    it('should handle network errors correctly', () => {
      const error = new Error('fetch failed');
      const appError = ErrorHandler.handleSearchError(error, 'test query');

      expect(appError.type).toBe(ErrorType.NETWORK);
      expect(appError.context).toEqual({ query: 'test query' });
    });

    it('should handle unknown errors correctly', () => {
      const error = new Error('unknown search error');
      const appError = ErrorHandler.handleSearchError(error, 'test query');

      expect(appError.type).toBe(ErrorType.UNKNOWN);
      expect(appError.context).toEqual({ query: 'test query' });
    });
  });

  describe('handleBookmarkError', () => {
    it('should handle authentication errors correctly', () => {
      const error = new Error('unauthorized access');
      const appError = ErrorHandler.handleBookmarkError(error, 'theory-123');

      expect(appError.type).toBe(ErrorType.AUTHENTICATION);
      expect(appError.context).toEqual({ theoryId: 'theory-123' });
    });

    it('should handle authorization errors correctly', () => {
      const error = new Error('permission denied');
      const appError = ErrorHandler.handleBookmarkError(error, 'theory-123');

      expect(appError.type).toBe(ErrorType.AUTHORIZATION);
      expect(appError.context).toEqual({ theoryId: 'theory-123' });
    });

    it('should handle unknown errors correctly', () => {
      const error = new Error('unknown bookmark error');
      const appError = ErrorHandler.handleBookmarkError(error, 'theory-123');

      expect(appError.type).toBe(ErrorType.UNKNOWN);
      expect(appError.context).toEqual({ theoryId: 'theory-123' });
    });
  });

  describe('handleProgressError', () => {
    it('should handle authentication errors correctly', () => {
      const error = new Error('auth required');
      const appError = ErrorHandler.handleProgressError(error, 'user-123');

      expect(appError.type).toBe(ErrorType.AUTHENTICATION);
      expect(appError.context).toEqual({ userId: 'user-123' });
    });

    it('should handle unknown errors correctly', () => {
      const error = new Error('unknown progress error');
      const appError = ErrorHandler.handleProgressError(error, 'user-123');

      expect(appError.type).toBe(ErrorType.UNKNOWN);
      expect(appError.context).toEqual({ userId: 'user-123' });
    });
  });

  describe('logError', () => {
    it('should log error to console', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const error = ErrorHandler.createError(ErrorType.NETWORK, 'Test error');

      ErrorHandler.logError(error);

      expect(consoleSpy).toHaveBeenCalledWith('Application Error:', expect.objectContaining({
        type: ErrorType.NETWORK,
        message: 'Test error',
        timestamp: expect.any(Date),
      }));

      consoleSpy.mockRestore();
    });
  });
});
