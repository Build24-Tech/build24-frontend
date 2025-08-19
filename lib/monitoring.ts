/**
 * Production Monitoring and Logging for Knowledge Hub
 * Handles error tracking, performance monitoring, and user analytics
 */

interface LogLevel {
  ERROR: 'error';
  WARN: 'warn';
  INFO: 'info';
  DEBUG: 'debug';
}

interface LogEntry {
  timestamp: string;
  level: keyof LogLevel;
  message: string;
  context?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  userAgent?: string;
  url?: string;
}

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: string;
  context?: Record<string, any>;
}

interface ErrorReport {
  error: Error;
  context?: Record<string, any>;
  userId?: string;
  component?: string;
  action?: string;
}

class KnowledgeHubMonitoring {
  private sessionId: string;
  private userId?: string;
  private isProduction: boolean;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.isProduction = process.env.NODE_ENV === 'production';

    if (typeof window !== 'undefined') {
      this.setupErrorHandlers();
      this.setupPerformanceMonitoring();
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  setUserId(userId: string): void {
    this.userId = userId;
  }

  /**
   * Log messages with different severity levels
   */
  log(level: keyof LogLevel, message: string, context?: Record<string, any>): void {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      userId: this.userId,
      sessionId: this.sessionId,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
      url: typeof window !== 'undefined' ? window.location.href : undefined
    };

    // Console logging for development
    if (!this.isProduction) {
      console[level](message, context);
      return;
    }

    // Send to external logging service in production
    this.sendToLoggingService(logEntry);
  }

  /**
   * Track Knowledge Hub specific events
   */
  trackEvent(eventName: string, properties?: Record<string, any>): void {
    const event = {
      event: eventName,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
        sessionId: this.sessionId,
        userId: this.userId,
        component: 'knowledge-hub'
      }
    };

    this.log('info', `Event: ${eventName}`, event);

    // Send to analytics service
    if (this.isProduction && typeof window !== 'undefined') {
      this.sendToAnalytics(event);
    }
  }

  /**
   * Report errors with context
   */
  reportError(errorReport: ErrorReport): void {
    const { error, context, component, action } = errorReport;

    const errorData = {
      name: error.name,
      message: error.message,
      stack: error.stack,
      context,
      component,
      action,
      timestamp: new Date().toISOString(),
      userId: this.userId,
      sessionId: this.sessionId,
      url: typeof window !== 'undefined' ? window.location.href : undefined
    };

    this.log('error', `Error in ${component}: ${error.message}`, errorData);

    // Send to error tracking service
    if (this.isProduction) {
      this.sendToErrorTracking(errorData);
    }
  }

  /**
   * Track performance metrics
   */
  trackPerformance(metric: PerformanceMetric): void {
    const performanceData = {
      ...metric,
      sessionId: this.sessionId,
      userId: this.userId
    };

    this.log('info', `Performance: ${metric.name} = ${metric.value}ms`, performanceData);

    if (this.isProduction) {
      this.sendToPerformanceMonitoring(performanceData);
    }
  }

  /**
   * Track Knowledge Hub specific metrics
   */
  trackTheoryView(theoryId: string, readTime?: number): void {
    this.trackEvent('theory_viewed', {
      theoryId,
      readTime,
      feature: 'theory-detail'
    });
  }

  trackSearch(query: string, resultsCount: number, filters?: Record<string, any>): void {
    this.trackEvent('search_performed', {
      query: query.length > 0 ? 'has_query' : 'empty_query', // Don't log actual search terms
      resultsCount,
      filters,
      feature: 'search'
    });
  }

  trackBookmark(theoryId: string, action: 'add' | 'remove'): void {
    this.trackEvent('bookmark_action', {
      theoryId,
      action,
      feature: 'bookmarks'
    });
  }

  trackProgressUpdate(badgeEarned?: string, theoriesRead?: number): void {
    this.trackEvent('progress_updated', {
      badgeEarned,
      theoriesRead,
      feature: 'progress-tracking'
    });
  }

  trackPremiumGate(theoryId: string, action: 'blocked' | 'upgraded'): void {
    this.trackEvent('premium_gate', {
      theoryId,
      action,
      feature: 'premium-content'
    });
  }

  /**
   * Setup global error handlers
   */
  private setupErrorHandlers(): void {
    // Unhandled JavaScript errors
    window.addEventListener('error', (event) => {
      this.reportError({
        error: new Error(event.message),
        context: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno
        },
        component: 'global'
      });
    });

    // Unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.reportError({
        error: new Error(event.reason?.message || 'Unhandled promise rejection'),
        context: {
          reason: event.reason
        },
        component: 'global'
      });
    });
  }

  /**
   * Setup performance monitoring
   */
  private setupPerformanceMonitoring(): void {
    // Page load performance
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

        if (navigation) {
          this.trackPerformance({
            name: 'page_load_time',
            value: navigation.loadEventEnd - navigation.fetchStart,
            timestamp: new Date().toISOString(),
            context: {
              domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
              firstPaint: this.getFirstPaint(),
              firstContentfulPaint: this.getFirstContentfulPaint()
            }
          });
        }
      }, 0);
    });

    // Core Web Vitals
    this.observeWebVitals();
  }

  private getFirstPaint(): number | undefined {
    const paintEntries = performance.getEntriesByType('paint');
    const firstPaint = paintEntries.find(entry => entry.name === 'first-paint');
    return firstPaint?.startTime;
  }

  private getFirstContentfulPaint(): number | undefined {
    const paintEntries = performance.getEntriesByType('paint');
    const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint');
    return fcp?.startTime;
  }

  private observeWebVitals(): void {
    // Largest Contentful Paint (LCP)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const lastEntry = entries[entries.length - 1];
      this.trackPerformance({
        name: 'largest_contentful_paint',
        value: lastEntry.startTime,
        timestamp: new Date().toISOString()
      });
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay (FID)
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        this.trackPerformance({
          name: 'first_input_delay',
          value: entry.processingStart - entry.startTime,
          timestamp: new Date().toISOString()
        });
      });
    }).observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });

      this.trackPerformance({
        name: 'cumulative_layout_shift',
        value: clsValue,
        timestamp: new Date().toISOString()
      });
    }).observe({ entryTypes: ['layout-shift'] });
  }

  /**
   * Send logs to external logging service
   */
  private async sendToLoggingService(logEntry: LogEntry): Promise<void> {
    try {
      // Replace with your logging service endpoint
      const endpoint = process.env.NEXT_PUBLIC_LOGGING_ENDPOINT;
      if (!endpoint) return;

      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(logEntry)
      });
    } catch (error) {
      console.error('Failed to send log to service:', error);
    }
  }

  /**
   * Send events to analytics service
   */
  private async sendToAnalytics(event: any): Promise<void> {
    try {
      // Google Analytics 4
      if (typeof gtag !== 'undefined') {
        gtag('event', event.event, event.properties);
      }

      // Custom analytics endpoint
      const endpoint = process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT;
      if (endpoint) {
        await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(event)
        });
      }
    } catch (error) {
      console.error('Failed to send analytics event:', error);
    }
  }

  /**
   * Send errors to error tracking service
   */
  private async sendToErrorTracking(errorData: any): Promise<void> {
    try {
      // Sentry, Bugsnag, or similar service
      const endpoint = process.env.NEXT_PUBLIC_ERROR_TRACKING_ENDPOINT;
      if (!endpoint) return;

      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorData)
      });
    } catch (error) {
      console.error('Failed to send error to tracking service:', error);
    }
  }

  /**
   * Send performance metrics to monitoring service
   */
  private async sendToPerformanceMonitoring(performanceData: any): Promise<void> {
    try {
      const endpoint = process.env.NEXT_PUBLIC_PERFORMANCE_ENDPOINT;
      if (!endpoint) return;

      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(performanceData)
      });
    } catch (error) {
      console.error('Failed to send performance data:', error);
    }
  }
}

// Global monitoring instance
export const monitoring = new KnowledgeHubMonitoring();

// Convenience functions
export const logError = (error: Error, context?: Record<string, any>, component?: string) => {
  monitoring.reportError({ error, context, component });
};

export const logInfo = (message: string, context?: Record<string, any>) => {
  monitoring.log('info', message, context);
};

export const logWarning = (message: string, context?: Record<string, any>) => {
  monitoring.log('warn', message, context);
};

export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  monitoring.trackEvent(eventName, properties);
};

export const trackPerformance = (name: string, value: number, context?: Record<string, any>) => {
  monitoring.trackPerformance({ name, value, timestamp: new Date().toISOString(), context });
};

// Knowledge Hub specific tracking functions
export const trackTheoryView = (theoryId: string, readTime?: number) => {
  monitoring.trackTheoryView(theoryId, readTime);
};

export const trackSearch = (query: string, resultsCount: number, filters?: Record<string, any>) => {
  monitoring.trackSearch(query, resultsCount, filters);
};

export const trackBookmark = (theoryId: string, action: 'add' | 'remove') => {
  monitoring.trackBookmark(theoryId, action);
};

export const trackProgressUpdate = (badgeEarned?: string, theoriesRead?: number) => {
  monitoring.trackProgressUpdate(badgeEarned, theoriesRead);
};

export const trackPremiumGate = (theoryId: string, action: 'blocked' | 'upgraded') => {
  monitoring.trackPremiumGate(theoryId, action);
};

export default monitoring;
