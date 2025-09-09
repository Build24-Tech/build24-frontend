'use client';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  ProfileError,
  getProfileErrorInfo,
  getRecoverySuggestions
} from '@/lib/profile-error-handling';
import {
  AlertTriangle,
  ArrowLeft,
  HelpCircle,
  Home,
  Lock,
  RefreshCw,
  Shield,
  Upload,
  UserX,
  Users,
  Wifi
} from 'lucide-react';
import Link from 'next/link';

interface ProfileErrorDisplayProps {
  error: ProfileError;
  onRetry?: () => void;
  onDismiss?: () => void;
  showDetails?: boolean;
  compact?: boolean;
}

export function ProfileErrorDisplay({
  error,
  onRetry,
  onDismiss,
  showDetails = false,
  compact = false
}: ProfileErrorDisplayProps) {
  const errorInfo = getProfileErrorInfo(error);
  const suggestions = getRecoverySuggestions(error);

  const getErrorIcon = () => {
    switch (error.type) {
      case 'PROFILE_NOT_FOUND':
        return <UserX className="w-8 h-8 text-red-600" />;
      case 'PROFILE_PRIVATE':
        return <Lock className="w-8 h-8 text-yellow-600" />;
      case 'UNAUTHORIZED':
        return <Shield className="w-8 h-8 text-red-600" />;
      case 'UPLOAD_FAILED':
        return <Upload className="w-8 h-8 text-red-600" />;
      case 'FOLLOW_ERROR':
        return <Users className="w-8 h-8 text-red-600" />;
      case 'NETWORK_ERROR':
        return <Wifi className="w-8 h-8 text-red-600" />;
      default:
        return <HelpCircle className="w-8 h-8 text-red-600" />;
    }
  };

  const getAlertVariant = () => {
    switch (error.type) {
      case 'PROFILE_PRIVATE':
        return 'default' as const;
      case 'VALIDATION_ERROR':
        return 'default' as const;
      default:
        return 'destructive' as const;
    }
  };

  if (compact) {
    return (
      <Alert variant={getAlertVariant()} className="mb-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>{errorInfo.title}</AlertTitle>
        <AlertDescription className="mt-2">
          {errorInfo.message}
          {errorInfo.retryable && onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="ml-2"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Retry
            </Button>
          )}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-4">
      <Card>
        <CardHeader className="text-center pb-4">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
              {getErrorIcon()}
            </div>
            <div className="space-y-2">
              <h1 className="text-xl font-bold">{errorInfo.title}</h1>
              <p className="text-muted-foreground max-w-md">
                {errorInfo.message}
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Action Suggestion */}
          <div className="bg-muted/50 rounded-lg p-4">
            <p className="text-sm font-medium mb-2">What you can do:</p>
            <p className="text-sm text-muted-foreground">{errorInfo.action}</p>
          </div>

          {/* Recovery Suggestions */}
          {suggestions.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Suggestions:</p>
              <ul className="text-sm text-muted-foreground space-y-1">
                {suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-muted-foreground">•</span>
                    <span>{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Error Details (development only) */}
          {showDetails && process.env.NODE_ENV === 'development' && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Development Error Details</AlertTitle>
              <AlertDescription className="mt-2 space-y-2">
                <div className="font-mono text-xs">
                  <div><strong>Type:</strong> {error.type}</div>
                  <div><strong>Message:</strong> {error.message}</div>
                  {error.context && (
                    <div><strong>Context:</strong> {JSON.stringify(error.context, null, 2)}</div>
                  )}
                  {error.originalError && (
                    <div><strong>Original:</strong> {error.originalError.message}</div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            {/* Primary Actions */}
            <div className="flex gap-3">
              {errorInfo.retryable && onRetry && (
                <Button onClick={onRetry} className="flex-1">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              )}

              {onDismiss && (
                <Button variant="outline" onClick={onDismiss} className="flex-1">
                  Dismiss
                </Button>
              )}
            </div>

            {/* Navigation Actions */}
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
                const subject = `Profile Error Report - ${error.type}`;
                const body = `Error Type: ${error.type}\nMessage: ${error.message}\nContext: ${JSON.stringify(error.context)}\nRetryable: ${error.retryable}`;
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

// Simplified error display for inline use
export function InlineProfileError({
  error,
  onRetry,
  className = ''
}: {
  error: ProfileError;
  onRetry?: () => void;
  className?: string;
}) {
  const errorInfo = getProfileErrorInfo(error);

  return (
    <div className={`p-4 border border-red-200 bg-red-50 rounded-lg ${className}`}>
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-red-800">{errorInfo.title}</h3>
          <p className="text-sm text-red-700 mt-1">{errorInfo.message}</p>
          {errorInfo.retryable && onRetry && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRetry}
              className="mt-2 h-8 text-xs"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Try Again
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
