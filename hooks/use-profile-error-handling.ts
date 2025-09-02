'use client';

import {
  ProfileError,
  ProfileErrorType,
  ProfileRetryManager,
  ProfileValidationError,
  classifyProfileError,
  validateFollowOperation,
  validateProfileData,
  validateProfileImage
} from '@/lib/profile-error-handling';
import { useCallback, useState } from 'react';
import { useToast } from './use-toast';

interface ProfileErrorState {
  error: ProfileError | null;
  isLoading: boolean;
  isRetrying: boolean;
  retryCount: number;
}

interface UseProfileErrorHandlingOptions {
  maxRetries?: number;
  showToast?: boolean;
  onError?: (error: ProfileError) => void;
  onRetry?: (retryCount: number) => void;
  onSuccess?: () => void;
}

export function useProfileErrorHandling(options: UseProfileErrorHandlingOptions = {}) {
  const { maxRetries = 3, showToast = true, onError, onRetry, onSuccess } = options;
  const { toast } = useToast();

  const [errorState, setErrorState] = useState<ProfileErrorState>({
    error: null,
    isLoading: false,
    isRetrying: false,
    retryCount: 0
  });

  const clearError = useCallback(() => {
    setErrorState(prev => ({
      ...prev,
      error: null,
      isRetrying: false
    }));
  }, []);

  const handleError = useCallback((error: Error | ProfileError, context?: string) => {
    const profileError = error instanceof ProfileError
      ? error
      : classifyProfileError(error);

    // Add context if provided
    if (context) {
      profileError.context = {
        ...profileError.context,
        operation: context
      };
    }

    setErrorState(prev => ({
      ...prev,
      error: profileError,
      isLoading: false,
      isRetrying: false
    }));

    // Show toast notification if enabled
    if (showToast) {
      toast({
        title: 'Profile Error',
        description: profileError.message,
        variant: 'destructive'
      });
    }

    // Call error callback
    onError?.(profileError);

    return profileError;
  }, [showToast, toast, onError]);

  const executeWithErrorHandling = useCallback(async <T>(
    operation: () => Promise<T>,
    context?: string
  ): Promise<T | null> => {
    setErrorState(prev => ({
      ...prev,
      isLoading: true,
      error: null
    }));

    try {
      const result = await ProfileRetryManager.withRetry(
        operation,
        context || 'profile_operation',
        maxRetries
      );

      setErrorState(prev => ({
        ...prev,
        isLoading: false,
        retryCount: 0
      }));

      onSuccess?.();
      return result;
    } catch (error) {
      handleError(error as Error, context);
      return null;
    }
  }, [maxRetries, handleError, onSuccess]);

  const retry = useCallback(async <T>(
    operation: () => Promise<T>,
    context?: string
  ): Promise<T | null> => {
    if (errorState.retryCount >= maxRetries) {
      return null;
    }

    setErrorState(prev => ({
      ...prev,
      isRetrying: true,
      retryCount: prev.retryCount + 1
    }));

    onRetry?.(errorState.retryCount + 1);

    try {
      const result = await operation();

      setErrorState(prev => ({
        ...prev,
        error: null,
        isRetrying: false,
        isLoading: false
      }));

      onSuccess?.();
      return result;
    } catch (error) {
      handleError(error as Error, context);
      return null;
    }
  }, [errorState.retryCount, maxRetries, onRetry, onSuccess, handleError]);

  // Profile-specific validation methods
  const validateProfile = useCallback((data: Record<string, any>): ProfileValidationError[] => {
    return validateProfileData(data);
  }, []);

  const validateImage = useCallback((file: File) => {
    return validateProfileImage(file);
  }, []);

  const validateFollow = useCallback((followerId: string, followingId: string) => {
    return validateFollowOperation(followerId, followingId);
  }, []);

  // Specific error creators
  const createProfileNotFoundError = useCallback((userId?: string) => {
    return new ProfileError(
      ProfileErrorType.PROFILE_NOT_FOUND,
      'Profile not found',
      undefined,
      { userId },
      false
    );
  }, []);

  const createPrivateProfileError = useCallback((userId?: string) => {
    return new ProfileError(
      ProfileErrorType.PROFILE_PRIVATE,
      'Profile is private',
      undefined,
      { userId },
      false
    );
  }, []);

  const createUnauthorizedError = useCallback((operation?: string) => {
    return new ProfileError(
      ProfileErrorType.UNAUTHORIZED,
      'Unauthorized access',
      undefined,
      { operation },
      false
    );
  }, []);

  const createValidationError = useCallback((field: string, message: string, suggestions: string[] = []) => {
    return new ProfileValidationError(field, message, suggestions);
  }, []);

  // Helper methods for common profile operations
  const handleProfileLoad = useCallback(async (
    loadOperation: () => Promise<any>,
    userId?: string
  ) => {
    return executeWithErrorHandling(loadOperation, `load_profile_${userId}`);
  }, [executeWithErrorHandling]);

  const handleProfileUpdate = useCallback(async (
    updateOperation: () => Promise<any>,
    userId?: string
  ) => {
    return executeWithErrorHandling(updateOperation, `update_profile_${userId}`);
  }, [executeWithErrorHandling]);

  const handleImageUpload = useCallback(async (
    uploadOperation: () => Promise<any>,
    userId?: string
  ) => {
    return executeWithErrorHandling(uploadOperation, `upload_image_${userId}`);
  }, [executeWithErrorHandling]);

  const handleFollowOperation = useCallback(async (
    followOperation: () => Promise<any>,
    followerId?: string,
    followingId?: string
  ) => {
    return executeWithErrorHandling(
      followOperation,
      `follow_operation_${followerId}_${followingId}`
    );
  }, [executeWithErrorHandling]);

  return {
    // State
    error: errorState.error,
    isLoading: errorState.isLoading,
    isRetrying: errorState.isRetrying,
    retryCount: errorState.retryCount,
    hasError: errorState.error !== null,
    canRetry: errorState.error?.retryable && errorState.retryCount < maxRetries,

    // Actions
    executeWithErrorHandling,
    retry,
    clearError,
    handleError,

    // Validation
    validateProfile,
    validateImage,
    validateFollow,

    // Error creators
    createProfileNotFoundError,
    createPrivateProfileError,
    createUnauthorizedError,
    createValidationError,

    // Operation helpers
    handleProfileLoad,
    handleProfileUpdate,
    handleImageUpload,
    handleFollowOperation
  };
}

// Specialized hooks for specific profile operations
export function useProfileLoadErrorHandling() {
  return useProfileErrorHandling({
    maxRetries: 2,
    showToast: false // Profile load errors are usually handled by UI
  });
}

export function useProfileUpdateErrorHandling() {
  return useProfileErrorHandling({
    maxRetries: 3,
    showToast: true
  });
}

export function useFollowErrorHandling() {
  return useProfileErrorHandling({
    maxRetries: 2,
    showToast: true
  });
}

export function useImageUploadErrorHandling() {
  return useProfileErrorHandling({
    maxRetries: 2,
    showToast: true
  });
}
