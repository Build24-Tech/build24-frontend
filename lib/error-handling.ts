export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTHENTICATION = 'AUTHENTICATION',
  AUTHORIZATION = 'AUTHORIZATION',
  CONTENT_NOT_FOUND = 'CONTENT_NOT_FOUND',
  CONTENT_PARSING = 'CONTENT_PARSING',
  VALIDATION = 'VALIDATION',
  UNKNOWN = 'UNKNOWN',
}

export interface AppError {
  type: ErrorType;
  message: string;
  originalError?: Error;
  context?: Record<string, any>;
  timestamp: Date;
  userMessage: string;
  recoverable: boolean;
}

export class ErrorHandler {
  static createError(
    type: ErrorType,
    message: string,
    originalError?: Error,
    context?: Record<string, any>
  ): AppError {
    return {
      type,
      message,
      originalError,
      context,
      timestamp: new Date(),
      userMessage: this.getUserMessage(type, message),
      recoverable: this.isRecoverable(type),
    };
  }

  static getUserMessage(type: ErrorType, message: string): string {
    switch (type) {
      case ErrorType.NETWORK:
        return 'Network connection issue. Please check your internet connection and try again.';
      case ErrorType.AUTHENTICATION:
        return 'Please log in to access this content.';
      case ErrorType.AUTHORIZATION:
        return 'You don\'t have permission to access this content. Consider upgrading your account.';
      case ErrorType.CONTENT_NOT_FOUND:
        return 'The requested content could not be found. It may have been moved or deleted.';
      case ErrorType.CONTENT_PARSING:
        return 'There was an issue loading the content. Please try again.';
      case ErrorType.VALIDATION:
        return 'Invalid data provided. Please check your input and try again.';
      default:
        return 'An unexpected error occurred. Please try again or contact support if the problem persists.';
    }
  }

  static isRecoverable(type: ErrorType): boolean {
    switch (type) {
      case ErrorType.NETWORK:
      case ErrorType.CONTENT_PARSING:
      case ErrorType.UNKNOWN:
        return true;
      case ErrorType.AUTHENTICATION:
      case ErrorType.AUTHORIZATION:
      case ErrorType.CONTENT_NOT_FOUND:
      case ErrorType.VALIDATION:
        return false;
      default:
        return false;
    }
  }

  static handleTheoryLoadError(error: Error, theoryId?: string): AppError {
    if (error.message.includes('404') || error.message.includes('not found')) {
      return this.createError(
        ErrorType.CONTENT_NOT_FOUND,
        `Theory not found: ${theoryId}`,
        error,
        { theoryId }
      );
    }

    if (error.message.includes('network') || error.message.includes('fetch')) {
      return this.createError(
        ErrorType.NETWORK,
        'Failed to load theory content',
        error,
        { theoryId }
      );
    }

    if (error.message.includes('parse') || error.message.includes('markdown')) {
      return this.createError(
        ErrorType.CONTENT_PARSING,
        'Failed to parse theory content',
        error,
        { theoryId }
      );
    }

    return this.createError(
      ErrorType.UNKNOWN,
      'Unknown error loading theory',
      error,
      { theoryId }
    );
  }

  static handleSearchError(error: Error, query?: string): AppError {
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return this.createError(
        ErrorType.NETWORK,
        'Search service unavailable',
        error,
        { query }
      );
    }

    return this.createError(
      ErrorType.UNKNOWN,
      'Search functionality error',
      error,
      { query }
    );
  }

  static handleBookmarkError(error: Error, theoryId?: string): AppError {
    if (error.message.includes('auth') || error.message.includes('unauthorized')) {
      return this.createError(
        ErrorType.AUTHENTICATION,
        'Authentication required for bookmarks',
        error,
        { theoryId }
      );
    }

    if (error.message.includes('permission') || error.message.includes('forbidden')) {
      return this.createError(
        ErrorType.AUTHORIZATION,
        'Permission denied for bookmark operation',
        error,
        { theoryId }
      );
    }

    return this.createError(
      ErrorType.UNKNOWN,
      'Bookmark operation failed',
      error,
      { theoryId }
    );
  }

  static handleProgressError(error: Error, userId?: string): AppError {
    if (error.message.includes('auth') || error.message.includes('unauthorized')) {
      return this.createError(
        ErrorType.AUTHENTICATION,
        'Authentication required for progress tracking',
        error,
        { userId }
      );
    }

    return this.createError(
      ErrorType.UNKNOWN,
      'Progress tracking error',
      error,
      { userId }
    );
  }

  static logError(error: AppError): void {
    console.error('Application Error:', {
      type: error.type,
      message: error.message,
      timestamp: error.timestamp,
      context: error.context,
      originalError: error.originalError,
    });

    // In a real application, you would send this to your error tracking service
    // Example: Sentry, LogRocket, Bugsnag, etc.
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'exception', {
        description: error.message,
        fatal: !error.recoverable,
        custom_map: {
          error_type: error.type,
          context: JSON.stringify(error.context),
        },
      });
    }
  }
}

// Utility function to wrap async operations with error handling
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  errorHandler: (error: Error) => AppError
): Promise<{ data?: T; error?: AppError }> {
  try {
    const data = await operation();
    return { data };
  } catch (error) {
    const appError = errorHandler(error as Error);
    ErrorHandler.logError(appError);
    return { error: appError };
  }
}
