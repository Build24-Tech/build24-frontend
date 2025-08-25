import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AppError, ErrorType } from '@/lib/error-handling';
import {
  AlertTriangle,
  Crown,
  FileX,
  Lock,
  LogIn,
  MessageCircle,
  RefreshCw,
  Wifi
} from 'lucide-react';
import React from 'react';

interface ErrorMessageProps {
  error: AppError;
  onRetry?: () => void;
  onLogin?: () => void;
  onUpgrade?: () => void;
  onReportIssue?: () => void;
  compact?: boolean;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  error,
  onRetry,
  onLogin,
  onUpgrade,
  onReportIssue,
  compact = false,
}) => {
  const getIcon = () => {
    switch (error.type) {
      case ErrorType.NETWORK:
        return <Wifi className="h-4 w-4" />;
      case ErrorType.AUTHENTICATION:
        return <LogIn className="h-4 w-4" />;
      case ErrorType.AUTHORIZATION:
        return <Crown className="h-4 w-4" />;
      case ErrorType.CONTENT_NOT_FOUND:
        return <FileX className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getVariant = () => {
    switch (error.type) {
      case ErrorType.AUTHENTICATION:
      case ErrorType.AUTHORIZATION:
        return 'default' as const;
      case ErrorType.NETWORK:
      case ErrorType.CONTENT_NOT_FOUND:
        return 'destructive' as const;
      default:
        return 'destructive' as const;
    }
  };

  const getActions = () => {
    const actions = [];

    if (error.recoverable && onRetry) {
      actions.push(
        <Button key="retry" onClick={onRetry} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      );
    }

    if (error.type === ErrorType.AUTHENTICATION && onLogin) {
      actions.push(
        <Button key="login" onClick={onLogin} variant="default" size="sm">
          <LogIn className="h-4 w-4 mr-2" />
          Log In
        </Button>
      );
    }

    if (error.type === ErrorType.AUTHORIZATION && onUpgrade) {
      actions.push(
        <Button key="upgrade" onClick={onUpgrade} variant="default" size="sm">
          <Crown className="h-4 w-4 mr-2" />
          Upgrade Account
        </Button>
      );
    }

    if (onReportIssue) {
      actions.push(
        <Button key="report" onClick={onReportIssue} variant="secondary" size="sm">
          <MessageCircle className="h-4 w-4 mr-2" />
          Report Issue
        </Button>
      );
    }

    return actions;
  };

  if (compact) {
    return (
      <Alert variant={getVariant()} className="mb-4">
        {getIcon()}
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error.userMessage}</AlertDescription>
        {getActions().length > 0 && (
          <div className="mt-3 flex gap-2">
            {getActions()}
          </div>
        )}
      </Alert>
    );
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getIcon()}
          {error.type === ErrorType.NETWORK && 'Connection Issue'}
          {error.type === ErrorType.AUTHENTICATION && 'Login Required'}
          {error.type === ErrorType.AUTHORIZATION && 'Access Restricted'}
          {error.type === ErrorType.CONTENT_NOT_FOUND && 'Content Not Found'}
          {error.type === ErrorType.CONTENT_PARSING && 'Loading Error'}
          {error.type === ErrorType.VALIDATION && 'Invalid Data'}
          {error.type === ErrorType.UNKNOWN && 'Unexpected Error'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">{error.userMessage}</p>

        {getActions().length > 0 && (
          <div className="flex flex-col sm:flex-row gap-2">
            {getActions()}
          </div>
        )}

        {process.env.NODE_ENV === 'development' && (
          <details className="mt-4 p-3 bg-muted rounded-md">
            <summary className="cursor-pointer text-sm font-medium">
              Debug Information
            </summary>
            <pre className="mt-2 text-xs overflow-auto">
              {JSON.stringify({
                type: error.type,
                message: error.message,
                context: error.context,
                timestamp: error.timestamp,
              }, null, 2)}
            </pre>
          </details>
        )}
      </CardContent>
    </Card>
  );
};

// Specific error message components for common scenarios
export const NetworkError: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => (
  <Alert variant="destructive">
    <Wifi className="h-4 w-4" />
    <AlertTitle>Connection Issue</AlertTitle>
    <AlertDescription>
      Please check your internet connection and try again.
    </AlertDescription>
    {onRetry && (
      <Button onClick={onRetry} variant="outline" size="sm" className="mt-3">
        <RefreshCw className="h-4 w-4 mr-2" />
        Retry
      </Button>
    )}
  </Alert>
);

export const AuthenticationError: React.FC<{ onLogin?: () => void }> = ({ onLogin }) => (
  <Alert>
    <Lock className="h-4 w-4" />
    <AlertTitle>Login Required</AlertTitle>
    <AlertDescription>
      Please log in to access this content and save your progress.
    </AlertDescription>
    {onLogin && (
      <Button onClick={onLogin} variant="default" size="sm" className="mt-3">
        <LogIn className="h-4 w-4 mr-2" />
        Log In
      </Button>
    )}
  </Alert>
);

export const ContentNotFoundError: React.FC<{ onGoBack?: () => void }> = ({ onGoBack }) => (
  <Alert variant="destructive">
    <FileX className="h-4 w-4" />
    <AlertTitle>Content Not Found</AlertTitle>
    <AlertDescription>
      The requested content could not be found. It may have been moved or deleted.
    </AlertDescription>
    {onGoBack && (
      <Button onClick={onGoBack} variant="outline" size="sm" className="mt-3">
        Go Back
      </Button>
    )}
  </Alert>
);
