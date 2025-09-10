'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { AlertTriangle, ArrowLeft, Home, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  userId?: string;
  context?: 'profile-view' | 'profile-edit' | 'profile-settings' | 'follow-system';
}

interface State {
  hasError: boolean;
  error?: Error;
  errorId?: string;
}

export class ProfileErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Generate a unique error ID for tracking
    const errorId = `profile_error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return { hasError: true, error, errorId };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ProfileErrorBoundary caught an error:', error, errorInfo);

    // Log error with context
    const context = {
      userId: this.props.userId,
      context: this.props.context,
      componentStack: errorInfo.componentStack,
      errorBoundary: 'ProfileErrorBoundary'
    };

    // In production, send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      this.logErrorToService(error, context);
    }

    this.props.onError?.(error, errorInfo);
  }

  private logErrorToService(error: Error, context: any) {
    // This would integrate with your error tracking service (Sentry, LogRocket, etc.)
    console.log('Would log to error service:', { error, context });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorId: undefined });
  };

  getErrorMessage() {
    const { context } = this.props;
    const { error } = this.state;

    if (error?.message.includes('PROFILE_NOT_FOUND')) {
      return {
        title: 'Profile Not Found',
        description: 'The profile you\'re looking for doesn\'t exist or has been removed.',
        showProfileActions: false
      };
    }

    if (error?.message.includes('PROFILE_PRIVATE')) {
      return {
        title: 'Private Profile',
        description: 'This profile is set to private and cannot be viewed.',
        showProfileActions: false
      };
    }

    if (error?.message.includes('UNAUTHORIZED')) {
      return {
        title: 'Access Denied',
        description: 'You don\'t have permission to access this profile.',
        showProfileActions: false
      };
    }

    if (error?.message.includes('VALIDATION_ERROR')) {
      return {
        title: 'Invalid Data',
        description: 'There was an issue with the profile data. Please try again.',
        showProfileActions: true
      };
    }

    if (error?.message.includes('UPLOAD_FAILED')) {
      return {
        title: 'Upload Failed',
        description: 'Failed to upload the profile image. Please try again with a different image.',
        showProfileActions: true
      };
    }

    // Context-specific error messages
    switch (context) {
      case 'profile-edit':
        return {
          title: 'Profile Edit Error',
          description: 'There was an issue updating your profile. Your changes may not have been saved.',
          showProfileActions: true
        };
      case 'profile-settings':
        return {
          title: 'Settings Error',
          description: 'There was an issue updating your profile settings. Please try again.',
          showProfileActions: true
        };
      case 'follow-system':
        return {
          title: 'Follow System Error',
          description: 'There was an issue with the follow operation. Please try again.',
          showProfileActions: true
        };
      default:
        return {
          title: 'Profile Error',
          description: 'We encountered an unexpected error while loading the profile.',
          showProfileActions: true
        };
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { title, description, showProfileActions } = this.getErrorMessage();

      return (
        <div className="w-full max-w-2xl mx-auto p-4">
          <Card>
            <CardHeader className="text-center pb-4">
              <div className="flex flex-col items-center space-y-4">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
                <div className="space-y-2">
                  <h1 className="text-xl font-bold">{title}</h1>
                  <p className="text-muted-foreground">{description}</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Error Details (only in development) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Development Error Details</AlertTitle>
                  <AlertDescription className="mt-2 font-mono text-xs">
                    {this.state.error.message}
                    {this.state.errorId && (
                      <div className="mt-2">Error ID: {this.state.errorId}</div>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                {showProfileActions && (
                  <Button onClick={this.handleRetry} className="w-full">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </Button>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Button variant="outline" asChild>
                    <Link href="/dashboard" className="flex items-center justify-center gap-2">
                      <Home className="w-4 h-4" />
                      Go to Dashboard
                    </Link>
                  </Button>

                  <Button variant="outline" onClick={() => window.history.back()}>
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Go Back
                  </Button>
                </div>

                {/* Report Issue */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const subject = `Profile Error Report - ${this.props.context || 'Unknown'}`;
                    const body = `Error ID: ${this.state.errorId}\nContext: ${this.props.context}\nUser ID: ${this.props.userId}\nError: ${this.state.error?.message}`;
                    window.open(`mailto:support@build24.dev?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
                  }}
                  className="text-xs text-muted-foreground"
                >
                  Report this issue
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
