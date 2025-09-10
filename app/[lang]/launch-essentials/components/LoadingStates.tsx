'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, CheckCircle, Clock, Loader2 } from 'lucide-react';
import React from 'react';

// Loading spinner component
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

export function LoadingSpinner({
  size = 'md',
  className = '',
  text
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
  };

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      <Loader2 className={`animate-spin ${sizeClasses[size]}`} />
      {text && <span className="text-sm text-muted-foreground">{text}</span>}
    </div>
  );
}

// Progress indicator with steps
interface ProgressIndicatorProps {
  steps: Array<{
    id: string;
    title: string;
    status: 'pending' | 'loading' | 'completed' | 'error';
  }>;
  currentStep?: string;
  className?: string;
}

export function ProgressIndicator({
  steps,
  currentStep,
  className = ''
}: ProgressIndicatorProps) {
  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  const getStepIcon = (status: string, isActive: boolean) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'loading':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />;
      default:
        return (
          <div className={`h-4 w-4 rounded-full border-2 ${isActive ? 'border-blue-600 bg-blue-100' : 'border-gray-300'
            }`} />
        );
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Progress</CardTitle>
          <Badge variant="outline">
            {completedSteps} of {steps.length} completed
          </Badge>
        </div>
        <Progress value={progressPercentage} className="mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {steps.map((step, index) => {
            const isActive = step.id === currentStep;
            const isLast = index === steps.length - 1;

            return (
              <div key={step.id} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  {getStepIcon(step.status, isActive)}
                  {!isLast && (
                    <div className={`w-px h-6 mt-2 ${step.status === 'completed' ? 'bg-green-200' : 'bg-gray-200'
                      }`} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${isActive ? 'text-blue-600' :
                      step.status === 'completed' ? 'text-green-600' :
                        step.status === 'error' ? 'text-red-600' :
                          'text-gray-600'
                    }`}>
                    {step.title}
                  </p>
                  {step.status === 'loading' && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Processing...
                    </p>
                  )}
                  {step.status === 'error' && (
                    <p className="text-xs text-red-600 mt-1">
                      Failed to complete
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

// Async operation status
interface AsyncOperationStatusProps {
  operation: string;
  status: 'idle' | 'loading' | 'success' | 'error';
  error?: string;
  className?: string;
}

export function AsyncOperationStatus({
  operation,
  status,
  error,
  className = ''
}: AsyncOperationStatusProps) {
  if (status === 'idle') return null;

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'border-blue-200 bg-blue-50';
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-600" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className={`flex items-center gap-2 p-2 rounded border ${getStatusColor()} ${className}`}>
      {getStatusIcon()}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">
          {status === 'loading' && `${operation}...`}
          {status === 'success' && `${operation} completed`}
          {status === 'error' && `${operation} failed`}
        </p>
        {error && status === 'error' && (
          <p className="text-xs text-red-600 mt-1">{error}</p>
        )}
      </div>
    </div>
  );
}

// Skeleton loaders for different content types
export function FormSkeleton({ fields = 3 }: { fields?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: fields }).map((_, index) => (
        <div key={index} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
      <div className="flex gap-2 pt-4">
        <Skeleton className="h-10 w-20" />
        <Skeleton className="h-10 w-16" />
      </div>
    </div>
  );
}

export function CardSkeleton({
  count = 1,
  hasImage = false
}: {
  count?: number;
  hasImage?: boolean;
}) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index}>
          <CardHeader>
            <div className="flex items-start gap-4">
              {hasImage && <Skeleton className="h-12 w-12 rounded" />}
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function TableSkeleton({
  rows = 5,
  columns = 4
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex gap-4">
        {Array.from({ length: columns }).map((_, index) => (
          <Skeleton key={index} className="h-4 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-8 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

// Loading overlay for entire sections
interface LoadingOverlayProps {
  isLoading: boolean;
  text?: string;
  children: React.ReactNode;
  className?: string;
}

export function LoadingOverlay({
  isLoading,
  text = 'Loading...',
  children,
  className = ''
}: LoadingOverlayProps) {
  return (
    <div className={`relative ${className}`}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm text-muted-foreground">{text}</p>
          </div>
        </div>
      )}
    </div>
  );
}
