'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorLogger, ErrorSeverity, classifyError } from '@/lib/error-handling';
import { AlertTriangle, Bug, Home, RefreshCw } from 'lucide-react';
import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorId: string | null;
  retryCount: number;
}

export class ErrorBoundary extends Component<Props, State> {
  private static readonly MAX_RETRIES = 3;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorId: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const errorId = ErrorLogger.log(error, ErrorSeverity.HIGH, {
      additionalData: {
        componentStack: errorInfo.componentStack,
        errorBoundary: true,
      },
    });

    this.setState({ errorId });

    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    if (this.state.retryCount < ErrorBoundary.MAX_RETRIES) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorId: null,
        retryCount: prevState.retryCount + 1,
      }));
    }
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorId: null,
      retryCount: 0,
    });
  };

  handleReportError = () => {
    if (this.state.error && this.state.errorId) {
      // In a real implementation, this would open a support ticket or feedback form
      const errorDetails = {
        errorId: this.state.errorId,
        message: this.state.error.message,
        stack: this.state.error.stack,
        timestamp: new Date().toISOString(),
      };

      console.log('Error report:', errorDetails);

      // Copy error details to clipboard for user to share
      if (navigator.clipboard) {
        navigator.clipboard.writeText(JSON.stringify(errorDetails, null, 2));
      }
    }
  };

  render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { userMessage, suggestions } = classifyError(this.state.error);
      const canRetry = this.state.retryCount < ErrorBoundary.MAX_RETRIES;

      return (
        <div className="min-h-[400px] flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <CardTitle className="text-xl">Something went wrong</CardTitle>
              <CardDescription>
                {userMessage}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {suggestions.length > 0 && (
                <Alert>
                  <AlertDescription>
                    <strong>Suggestions:</strong>
                    <ul className="mt-2 list-disc list-inside space-y-1">
                      {suggestions.map((suggestion, index) => (
                        <li key={index} className="text-sm">
                          <strong>{suggestion.title}:</strong> {suggestion.description}
                        </li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col gap-2 sm:flex-row">
                {canRetry && (
                  <Button onClick={this.handleRetry} className="flex-1">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again ({ErrorBoundary.MAX_RETRIES - this.state.retryCount} left)
                  </Button>
                )}

                <Button variant="outline" onClick={this.handleReset} className="flex-1">
                  <Home className="mr-2 h-4 w-4" />
                  Start Over
                </Button>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={this.handleReportError}
                className="w-full"
              >
                <Bug className="mr-2 h-4 w-4" />
                Report Error (ID: {this.state.errorId?.slice(-8)})
              </Button>

              {process.env.NODE_ENV === 'development' && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm text-muted-foreground">
                    Technical Details (Development)
                  </summary>
                  <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}
