'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Search } from 'lucide-react';
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  onFallbackToBasicNavigation?: () => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class SearchErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('SearchErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  handleFallback = () => {
    this.props.onFallbackToBasicNavigation?.();
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Alert className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Search temporarily unavailable</AlertTitle>
          <AlertDescription className="mt-2">
            The search functionality is currently experiencing issues. You can still browse theories by category.
          </AlertDescription>
          <div className="mt-3 flex gap-2">
            <Button onClick={this.handleRetry} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Retry Search
            </Button>
            {this.props.onFallbackToBasicNavigation && (
              <Button onClick={this.handleFallback} variant="secondary" size="sm">
                <Search className="h-4 w-4 mr-2" />
                Browse Categories
              </Button>
            )}
          </div>
        </Alert>
      );
    }

    return this.props.children;
  }
}
