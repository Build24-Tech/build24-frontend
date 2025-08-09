/**
 * Comprehensive error handling utilities for Launch Essentials
 */

// Error types and classes
export class ValidationError extends Error {
  constructor(
    public field: string,
    public message: string,
    public code: string,
    public suggestions?: string[]
  ) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class PersistenceError extends Error {
  constructor(
    public operation: string,
    public originalError: Error,
    public retryable: boolean = true
  ) {
    super(`Failed to ${operation}: ${originalError.message}`);
    this.name = 'PersistenceError';
  }
}

export class FrameworkError extends Error {
  constructor(
    public frameworkId: string,
    message: string,
    public recoverable: boolean = true
  ) {
    super(`Framework ${frameworkId}: ${message}`);
    this.name = 'FrameworkError';
  }
}

export class NetworkError extends Error {
  constructor(
    public message: string,
    public status?: number,
    public retryable: boolean = true
  ) {
    super(message);
    this.name = 'NetworkError';
  }
}

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Error context interface
export interface ErrorContext {
  userId?: string;
  projectId?: string;
  frameworkId?: string;
  stepId?: string;
  timestamp: Date;
  userAgent?: string;
  url?: string;
  additionalData?: Record<string, any>;
}

// Error log entry
export interface ErrorLogEntry {
  id: string;
  error: Error;
  severity: ErrorSeverity;
  context: ErrorContext;
  resolved: boolean;
  resolvedAt?: Date;
  resolution?: string;
}

// Recovery suggestion interface
export interface RecoverySuggestion {
  title: string;
  description: string;
  action?: () => void | Promise<void>;
  actionLabel?: string;
  priority: 'high' | 'medium' | 'low';
}

// User-friendly error messages
export const ERROR_MESSAGES = {
  VALIDATION: {
    REQUIRED_FIELD: 'This field is required to continue.',
    INVALID_FORMAT: 'Please check the format of your input.',
    OUT_OF_RANGE: 'Please enter a value within the allowed range.',
    DUPLICATE_VALUE: 'This value already exists. Please choose a different one.',
  },
  NETWORK: {
    CONNECTION_FAILED: 'Unable to connect. Please check your internet connection.',
    TIMEOUT: 'The request took too long. Please try again.',
    SERVER_ERROR: 'Something went wrong on our end. Please try again later.',
    OFFLINE: 'You appear to be offline. Changes will be saved when connection is restored.',
  },
  PERSISTENCE: {
    SAVE_FAILED: 'Unable to save your changes. Please try again.',
    LOAD_FAILED: 'Unable to load your data. Please refresh the page.',
    SYNC_FAILED: 'Unable to sync your changes. They are saved locally.',
  },
  FRAMEWORK: {
    LOAD_FAILED: 'Unable to load this framework. Please try refreshing the page.',
    INVALID_STATE: 'This framework is in an invalid state. Please restart this section.',
    MISSING_DATA: 'Some required data is missing. Please complete the previous steps.',
  },
} as const;

// Error classification utility
export function classifyError(error: Error): {
  type: string;
  severity: ErrorSeverity;
  retryable: boolean;
  userMessage: string;
  suggestions: RecoverySuggestion[];
} {
  if (error instanceof ValidationError) {
    return {
      type: 'validation',
      severity: ErrorSeverity.MEDIUM,
      retryable: false,
      userMessage: error.message,
      suggestions: [
        {
          title: 'Check your input',
          description: error.suggestions?.join(' ') || 'Please review and correct the highlighted fields.',
          priority: 'high',
        },
      ],
    };
  }

  if (error instanceof NetworkError) {
    return {
      type: 'network',
      severity: error.status && error.status >= 500 ? ErrorSeverity.HIGH : ErrorSeverity.MEDIUM,
      retryable: error.retryable,
      userMessage: error.status === 0 ? ERROR_MESSAGES.NETWORK.OFFLINE : ERROR_MESSAGES.NETWORK.CONNECTION_FAILED,
      suggestions: [
        {
          title: 'Check connection',
          description: 'Verify your internet connection and try again.',
          priority: 'high',
        },
        ...(error.retryable ? [{
          title: 'Retry',
          description: 'Try the operation again.',
          priority: 'medium' as const,
        }] : []),
      ],
    };
  }

  if (error instanceof PersistenceError) {
    return {
      type: 'persistence',
      severity: ErrorSeverity.HIGH,
      retryable: error.retryable,
      userMessage: ERROR_MESSAGES.PERSISTENCE.SAVE_FAILED,
      suggestions: [
        {
          title: 'Retry save',
          description: 'Try saving your changes again.',
          priority: 'high',
        },
        {
          title: 'Export data',
          description: 'Export your work to avoid losing changes.',
          priority: 'medium',
        },
      ],
    };
  }

  if (error instanceof FrameworkError) {
    return {
      type: 'framework',
      severity: error.recoverable ? ErrorSeverity.MEDIUM : ErrorSeverity.HIGH,
      retryable: error.recoverable,
      userMessage: error.message,
      suggestions: [
        {
          title: 'Refresh framework',
          description: 'Try reloading this framework section.',
          priority: 'high',
        },
        ...(error.recoverable ? [{
          title: 'Continue with simplified version',
          description: 'Use a basic version of this framework.',
          priority: 'medium' as const,
        }] : []),
      ],
    };
  }

  // Generic error handling
  return {
    type: 'unknown',
    severity: ErrorSeverity.MEDIUM,
    retryable: true,
    userMessage: 'An unexpected error occurred. Please try again.',
    suggestions: [
      {
        title: 'Refresh page',
        description: 'Try refreshing the page to resolve the issue.',
        priority: 'high',
      },
      {
        title: 'Contact support',
        description: 'If the problem persists, please contact our support team.',
        priority: 'low',
      },
    ],
  };
}

// Retry mechanism with exponential backoff
export class RetryManager {
  private static readonly DEFAULT_MAX_RETRIES = 3;
  private static readonly DEFAULT_BASE_DELAY = 1000;

  static async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = RetryManager.DEFAULT_MAX_RETRIES,
    baseDelay: number = RetryManager.DEFAULT_BASE_DELAY
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        // Don't retry validation errors or non-retryable errors
        if (error instanceof ValidationError ||
          (error instanceof NetworkError && !error.retryable) ||
          (error instanceof PersistenceError && !error.retryable)) {
          throw error;
        }

        if (attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError!;
  }
}

// Error logging service
export class ErrorLogger {
  private static logs: ErrorLogEntry[] = [];

  static log(
    error: Error,
    severity: ErrorSeverity,
    context: Partial<ErrorContext> = {}
  ): string {
    const id = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const entry: ErrorLogEntry = {
      id,
      error,
      severity,
      context: {
        timestamp: new Date(),
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        ...context,
      },
      resolved: false,
    };

    this.logs.push(entry);

    // In production, send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      this.sendToMonitoring(entry);
    } else {
      console.error('Error logged:', entry);
    }

    return id;
  }

  static resolve(errorId: string, resolution: string): void {
    const entry = this.logs.find(log => log.id === errorId);
    if (entry) {
      entry.resolved = true;
      entry.resolvedAt = new Date();
      entry.resolution = resolution;
    }
  }

  static getLogs(filters?: {
    severity?: ErrorSeverity;
    resolved?: boolean;
    userId?: string;
  }): ErrorLogEntry[] {
    let filteredLogs = this.logs;

    if (filters?.severity) {
      filteredLogs = filteredLogs.filter(log => log.severity === filters.severity);
    }

    if (filters?.resolved !== undefined) {
      filteredLogs = filteredLogs.filter(log => log.resolved === filters.resolved);
    }

    if (filters?.userId) {
      filteredLogs = filteredLogs.filter(log => log.context.userId === filters.userId);
    }

    return filteredLogs;
  }

  private static async sendToMonitoring(entry: ErrorLogEntry): Promise<void> {
    try {
      // In a real implementation, this would send to a monitoring service
      // like Sentry, LogRocket, or custom analytics
      console.log('Would send to monitoring:', entry);
    } catch (error) {
      console.error('Failed to send error to monitoring:', error);
    }
  }
}

// Offline detection and handling
export class OfflineManager {
  private static isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private static listeners: ((online: boolean) => void)[] = [];
  private static pendingOperations: (() => Promise<void>)[] = [];

  static initialize(): void {
    if (typeof window === 'undefined') return;

    const handleOnline = () => {
      this.isOnline = true;
      this.notifyListeners(true);
      this.processPendingOperations();
    };

    const handleOffline = () => {
      this.isOnline = false;
      this.notifyListeners(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
  }

  static getStatus(): boolean {
    return this.isOnline;
  }

  static onStatusChange(callback: (online: boolean) => void): () => void {
    this.listeners.push(callback);
    return () => {
      const index = this.listeners.indexOf(callback);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  static queueOperation(operation: () => Promise<void>): void {
    if (this.isOnline) {
      operation().catch(error => {
        ErrorLogger.log(error, ErrorSeverity.MEDIUM, {
          additionalData: { source: 'queued_operation' }
        });
      });
    } else {
      this.pendingOperations.push(operation);
    }
  }

  private static notifyListeners(online: boolean): void {
    this.listeners.forEach(listener => {
      try {
        listener(online);
      } catch (error) {
        console.error('Error in offline status listener:', error);
      }
    });
  }

  private static async processPendingOperations(): Promise<void> {
    const operations = [...this.pendingOperations];
    this.pendingOperations = [];

    for (const operation of operations) {
      try {
        await operation();
      } catch (error) {
        ErrorLogger.log(error as Error, ErrorSeverity.MEDIUM, {
          additionalData: { source: 'pending_operation' }
        });
        // Re-queue failed operations
        this.pendingOperations.push(operation);
      }
    }
  }
}

// Initialize offline manager
if (typeof window !== 'undefined') {
  OfflineManager.initialize();
}
