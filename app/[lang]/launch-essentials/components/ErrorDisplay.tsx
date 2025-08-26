'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { classifyError, ErrorSeverity, RecoverySuggestion } from '@/lib/error-handling';
import { AlertCircle, AlertTriangle, CheckCircle, ExternalLink, Info, RefreshCw, X } from 'lucide-react';

interface ErrorDisplayProps {
  error: Error;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
  compact?: boolean;
}

export function ErrorDisplay({
  error,
  onRetry,
  onDismiss,
  className = '',
  compact = false
}: ErrorDisplayProps) {
  const { type, severity, retryable, userMessage, suggestions } = classifyError(error);

  const getSeverityIcon = (severity: ErrorSeverity) => {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case ErrorSeverity.HIGH:
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case ErrorSeverity.MEDIUM:
        return <Info className="h-4 w-4 text-yellow-600" />;
      case ErrorSeverity.LOW:
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      default:
        return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity: ErrorSeverity) => {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return 'destructive';
      case ErrorSeverity.HIGH:
        return 'destructive';
      case ErrorSeverity.MEDIUM:
        return 'default';
      case ErrorSeverity.LOW:
        return 'secondary';
      default:
        return 'default';
    }
  };

  if (compact) {
    return (
      <Alert variant={getSeverityColor(severity) as any} className={className}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getSeverityIcon(severity)}
            <AlertDescription className="mb-0">
              {userMessage}
            </AlertDescription>
          </div>
          <div className="flex items-center gap-1">
            {retryable && onRetry && (
              <Button size="sm" variant="ghost" onClick={onRetry}>
                <RefreshCw className="h-3 w-3" />
              </Button>
            )}
            {onDismiss && (
              <Button size="sm" variant="ghost" onClick={onDismiss}>
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </Alert>
    );
  }

  return (
    <Card className={`border-l-4 ${severity === ErrorSeverity.CRITICAL || severity === ErrorSeverity.HIGH
        ? 'border-l-red-500'
        : severity === ErrorSeverity.MEDIUM
          ? 'border-l-yellow-500'
          : 'border-l-blue-500'
      } ${className}`}>
      <CardContent className="pt-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {getSeverityIcon(severity)}
            <div>
              <h4 className="font-medium text-sm">
                {type.charAt(0).toUpperCase() + type.slice(1)} Error
              </h4>
              <Badge variant={getSeverityColor(severity) as any} className="text-xs mt-1">
                {severity.toUpperCase()}
              </Badge>
            </div>
          </div>
          {onDismiss && (
            <Button size="sm" variant="ghost" onClick={onDismiss}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          {userMessage}
        </p>

        {suggestions.length > 0 && (
          <div className="mb-4">
            <h5 className="font-medium text-sm mb-2">Suggested Actions:</h5>
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <SuggestionItem
                  key={index}
                  suggestion={suggestion}
                  onAction={suggestion.action}
                />
              ))}
            </div>
          </div>
        )}

        <div className="flex gap-2">
          {retryable && onRetry && (
            <Button size="sm" onClick={onRetry}>
              <RefreshCw className="mr-2 h-3 w-3" />
              Try Again
            </Button>
          )}
          {onDismiss && (
            <Button size="sm" variant="outline" onClick={onDismiss}>
              Dismiss
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface SuggestionItemProps {
  suggestion: RecoverySuggestion;
  onAction?: () => void | Promise<void>;
}

function SuggestionItem({ suggestion, onAction }: SuggestionItemProps) {
  const handleAction = async () => {
    if (suggestion.action) {
      await suggestion.action();
    } else if (onAction) {
      await onAction();
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="flex items-start justify-between p-2 bg-muted/50 rounded">
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h6 className="font-medium text-xs">{suggestion.title}</h6>
          <Badge variant="outline" className={`text-xs ${getPriorityColor(suggestion.priority)}`}>
            {suggestion.priority}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          {suggestion.description}
        </p>
      </div>
      {(suggestion.action || onAction) && suggestion.actionLabel && (
        <Button size="sm" variant="ghost" onClick={handleAction} className="ml-2">
          {suggestion.actionLabel}
          <ExternalLink className="ml-1 h-3 w-3" />
        </Button>
      )}
    </div>
  );
}

// Field-level validation error display
interface FieldErrorProps {
  error?: string;
  suggestions?: string[];
  className?: string;
}

export function FieldError({ error, suggestions, className = '' }: FieldErrorProps) {
  if (!error) return null;

  return (
    <div className={`mt-1 ${className}`}>
      <p className="text-sm text-red-600 flex items-center gap-1">
        <AlertCircle className="h-3 w-3" />
        {error}
      </p>
      {suggestions && suggestions.length > 0 && (
        <ul className="mt-1 text-xs text-muted-foreground list-disc list-inside">
          {suggestions.map((suggestion, index) => (
            <li key={index}>{suggestion}</li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Network status indicator
interface NetworkStatusProps {
  isOnline: boolean;
  className?: string;
}

export function NetworkStatus({ isOnline, className = '' }: NetworkStatusProps) {
  if (isOnline) return null;

  return (
    <Alert variant="destructive" className={className}>
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription>
        You're currently offline. Changes will be saved locally and synced when connection is restored.
      </AlertDescription>
    </Alert>
  );
}
