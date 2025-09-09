/**
 * Profile-specific error handling utilities
 */

import { RetryManager } from './error-handling';

// Profile-specific error types
export enum ProfileErrorType {
  PROFILE_NOT_FOUND = 'PROFILE_NOT_FOUND',
  PROFILE_PRIVATE = 'PROFILE_PRIVATE',
  UNAUTHORIZED = 'UNAUTHORIZED',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  UPLOAD_FAILED = 'UPLOAD_FAILED',
  FOLLOW_ERROR = 'FOLLOW_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

// Profile error class
export class ProfileError extends Error {
  constructor(
    public type: ProfileErrorType,
    public message: string,
    public originalError?: Error,
    public context?: Record<string, any>,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'ProfileError';
  }
}

// Follow system specific errors
export class FollowError extends ProfileError {
  constructor(
    message: string,
    public followerId?: string,
    public followingId?: string,
    originalError?: Error
  ) {
    super(ProfileErrorType.FOLLOW_ERROR, message, originalError, {
      followerId,
      followingId
    }, true);
  }
}

// Profile validation errors
export class ProfileValidationError extends ProfileError {
  constructor(
    public field: string,
    message: string,
    public suggestions: string[] = []
  ) {
    super(ProfileErrorType.VALIDATION_ERROR, message, undefined, {
      field,
      suggestions
    }, false);
  }
}

// Profile upload errors
export class ProfileUploadError extends ProfileError {
  constructor(
    message: string,
    public fileSize?: number,
    public fileType?: string,
    originalError?: Error
  ) {
    super(ProfileErrorType.UPLOAD_FAILED, message, originalError, {
      fileSize,
      fileType
    }, true);
  }
}

// Error classification for profile operations
export function classifyProfileError(error: Error): ProfileError {
  if (error instanceof ProfileError) {
    return error;
  }

  const message = error.message.toLowerCase();

  // Check for specific error patterns
  if (message.includes('not found') || message.includes('404')) {
    return new ProfileError(
      ProfileErrorType.PROFILE_NOT_FOUND,
      'Profile not found',
      error,
      {},
      false
    );
  }

  if (message.includes('private') || message.includes('access denied')) {
    return new ProfileError(
      ProfileErrorType.PROFILE_PRIVATE,
      'Profile is private',
      error,
      {},
      false
    );
  }

  if (message.includes('unauthorized') || message.includes('permission')) {
    return new ProfileError(
      ProfileErrorType.UNAUTHORIZED,
      'Unauthorized access',
      error,
      {},
      false
    );
  }

  if (message.includes('validation') || message.includes('invalid')) {
    return new ProfileError(
      ProfileErrorType.VALIDATION_ERROR,
      'Validation error',
      error,
      {},
      false
    );
  }

  if (message.includes('upload') || message.includes('file')) {
    return new ProfileError(
      ProfileErrorType.UPLOAD_FAILED,
      'Upload failed',
      error,
      {},
      true
    );
  }

  if (message.includes('follow') || message.includes('relationship')) {
    return new ProfileError(
      ProfileErrorType.FOLLOW_ERROR,
      'Follow operation failed',
      error,
      {},
      true
    );
  }

  if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
    return new ProfileError(
      ProfileErrorType.NETWORK_ERROR,
      'Network error',
      error,
      {},
      true
    );
  }

  // Default to unknown error
  return new ProfileError(
    ProfileErrorType.UNKNOWN_ERROR,
    'An unexpected error occurred',
    error,
    {},
    true
  );
}

// User-friendly error messages
export const PROFILE_ERROR_MESSAGES = {
  [ProfileErrorType.PROFILE_NOT_FOUND]: {
    title: 'Profile Not Found',
    message: 'The profile you\'re looking for doesn\'t exist or has been removed.',
    action: 'Try searching for a different user or check the URL.'
  },
  [ProfileErrorType.PROFILE_PRIVATE]: {
    title: 'Private Profile',
    message: 'This profile is set to private and cannot be viewed.',
    action: 'Contact the user directly if you need to access their profile.'
  },
  [ProfileErrorType.UNAUTHORIZED]: {
    title: 'Access Denied',
    message: 'You don\'t have permission to access this profile.',
    action: 'Please log in or contact support if you believe this is an error.'
  },
  [ProfileErrorType.VALIDATION_ERROR]: {
    title: 'Invalid Information',
    message: 'The profile information provided is not valid.',
    action: 'Please check your input and try again.'
  },
  [ProfileErrorType.UPLOAD_FAILED]: {
    title: 'Upload Failed',
    message: 'Failed to upload the profile image.',
    action: 'Please try again with a different image or check your internet connection.'
  },
  [ProfileErrorType.FOLLOW_ERROR]: {
    title: 'Follow Operation Failed',
    message: 'Unable to complete the follow/unfollow operation.',
    action: 'Please try again in a moment.'
  },
  [ProfileErrorType.NETWORK_ERROR]: {
    title: 'Connection Error',
    message: 'Unable to connect to the server.',
    action: 'Please check your internet connection and try again.'
  },
  [ProfileErrorType.UNKNOWN_ERROR]: {
    title: 'Something Went Wrong',
    message: 'An unexpected error occurred.',
    action: 'Please try again or contact support if the problem persists.'
  }
} as const;

// Get user-friendly error information
export function getProfileErrorInfo(error: ProfileError) {
  const errorInfo = PROFILE_ERROR_MESSAGES[error.type];
  return {
    ...errorInfo,
    retryable: error.retryable,
    context: error.context,
    originalError: error.originalError
  };
}

// Profile operation retry wrapper
export class ProfileRetryManager {
  static async withRetry<T>(
    operation: () => Promise<T>,
    context: string,
    maxRetries: number = 3
  ): Promise<T> {
    try {
      return await RetryManager.withRetry(operation, maxRetries);
    } catch (error) {
      const profileError = classifyProfileError(error as Error);

      // Add context to the error
      profileError.context = {
        ...profileError.context,
        operation: context,
        retryAttempts: maxRetries
      };

      throw profileError;
    }
  }
}

// Profile validation utilities
export const profileValidationRules = {
  bio: {
    maxLength: 500,
    validate: (value: string): ProfileValidationError | null => {
      if (value && value.length > 500) {
        return new ProfileValidationError(
          'bio',
          'Bio must be 500 characters or less',
          [`Remove ${value.length - 500} characters`]
        );
      }
      return null;
    }
  },

  website: {
    validate: (value: string): ProfileValidationError | null => {
      if (value && value.trim()) {
        const urlPattern = /^https?:\/\/.+\..+/;
        if (!urlPattern.test(value.trim())) {
          return new ProfileValidationError(
            'website',
            'Website must be a valid URL starting with http:// or https://',
            ['Include http:// or https:// at the beginning', 'Example: https://yourwebsite.com']
          );
        }
      }
      return null;
    }
  },

  location: {
    maxLength: 100,
    validate: (value: string): ProfileValidationError | null => {
      if (value && value.length > 100) {
        return new ProfileValidationError(
          'location',
          'Location must be 100 characters or less',
          [`Remove ${value.length - 100} characters`]
        );
      }
      return null;
    }
  },

  work: {
    maxLength: 100,
    validate: (value: string): ProfileValidationError | null => {
      if (value && value.length > 100) {
        return new ProfileValidationError(
          'work',
          'Work must be 100 characters or less',
          [`Remove ${value.length - 100} characters`]
        );
      }
      return null;
    }
  },

  role: {
    maxLength: 100,
    validate: (value: string): ProfileValidationError | null => {
      if (value && value.length > 100) {
        return new ProfileValidationError(
          'role',
          'Role must be 100 characters or less',
          [`Remove ${value.length - 100} characters`]
        );
      }
      return null;
    }
  }
};

// Validate entire profile data
export function validateProfileData(data: Record<string, any>): ProfileValidationError[] {
  const errors: ProfileValidationError[] = [];

  Object.entries(profileValidationRules).forEach(([field, rule]) => {
    const value = data[field];
    if (value !== undefined && value !== null) {
      const error = rule.validate(value);
      if (error) {
        errors.push(error);
      }
    }
  });

  return errors;
}

// Profile image validation
export function validateProfileImage(file: File): ProfileUploadError | null {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    return new ProfileUploadError(
      'Only JPEG, PNG, and WebP images are allowed',
      file.size,
      file.type
    );
  }

  if (file.size > maxSize) {
    return new ProfileUploadError(
      'Image must be smaller than 5MB',
      file.size,
      file.type
    );
  }

  return null;
}

// Follow operation validation
export function validateFollowOperation(
  followerId: string,
  followingId: string
): FollowError | null {
  if (followerId === followingId) {
    return new FollowError(
      'Cannot follow yourself',
      followerId,
      followingId
    );
  }

  if (!followerId || !followingId) {
    return new FollowError(
      'Invalid user IDs provided',
      followerId,
      followingId
    );
  }

  return null;
}

// Error recovery suggestions
export function getRecoverySuggestions(error: ProfileError): string[] {
  const suggestions: string[] = [];

  switch (error.type) {
    case ProfileErrorType.PROFILE_NOT_FOUND:
      suggestions.push('Check the URL for typos');
      suggestions.push('Try searching for the user');
      suggestions.push('The profile may have been deleted');
      break;

    case ProfileErrorType.PROFILE_PRIVATE:
      suggestions.push('Contact the user directly');
      suggestions.push('The user may make their profile public later');
      break;

    case ProfileErrorType.UNAUTHORIZED:
      suggestions.push('Log in to your account');
      suggestions.push('Check if you have the necessary permissions');
      suggestions.push('Contact support if you believe this is an error');
      break;

    case ProfileErrorType.VALIDATION_ERROR:
      if (error.context?.suggestions) {
        suggestions.push(...error.context.suggestions);
      } else {
        suggestions.push('Check your input for errors');
        suggestions.push('Make sure all required fields are filled');
      }
      break;

    case ProfileErrorType.UPLOAD_FAILED:
      suggestions.push('Try a different image');
      suggestions.push('Make sure the image is under 5MB');
      suggestions.push('Use JPEG, PNG, or WebP format');
      suggestions.push('Check your internet connection');
      break;

    case ProfileErrorType.FOLLOW_ERROR:
      suggestions.push('Try again in a moment');
      suggestions.push('Check your internet connection');
      suggestions.push('Make sure you\'re logged in');
      break;

    case ProfileErrorType.NETWORK_ERROR:
      suggestions.push('Check your internet connection');
      suggestions.push('Try refreshing the page');
      suggestions.push('Try again in a few minutes');
      break;

    default:
      suggestions.push('Try refreshing the page');
      suggestions.push('Try again in a few minutes');
      suggestions.push('Contact support if the problem persists');
      break;
  }

  return suggestions;
}
