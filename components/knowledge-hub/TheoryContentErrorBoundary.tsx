'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileX, MessageCircle, RefreshCw } from 'lucide-react';
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  theoryId?: string;
  onRetry?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class TheoryContentErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('TheoryContentErrorBoundary caught an error:', error, errorInfo);

    // Log error for debugging
    if (typeof window !== 'undefined') {
      // In a real app, you'd send this to your error tracking service
      console.error('Theory content error:', {
        theoryId: this.props.theoryId,
        error: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
      });
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
    this.props.onRetry?.();
  };

  handleReportIssue = () => {
    // In a real app, this would open a support ticket or feedback form
    const subject = `Theory Content Error - ${this.props.theoryId || 'Unknown'}`;
    const body = `Error occurred while loading theory content.\n\nError: ${this.state.error?.message}\nTheory ID: ${this.props.theoryId}`;
    window.open(`mailto:support@build24.dev?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
  };

  render() {
    if (this.state.hasError) {
      return (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileX className="h-5 w-5 text-destructive" />
              Content Loading Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Unable to load theory content</AlertTitle>
              <AlertDescription>
                The theory content failed to load properly. This might be due to a network issue or a problem with the content file.
              </AlertDescription>
            </Alert>

            <div className="flex flex-col sm:flex-row gap-2">
              <Button onClick={this.handleRetry} variant="outline">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button onClick={this.handleReportIssue} variant="secondary">
                <MessageCircle className="h-4 w-4 mr-2" />
                Report Issue
              </Button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 p-3 bg-muted rounded-md">
                <summary className="cursor-pointer text-sm font-medium">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 text-xs overflow-auto">
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
