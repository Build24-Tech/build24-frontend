import { useCallback, useRef, useState } from 'react';

interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoff?: boolean;
}

interface RetryState {
  isLoading: boolean;
  error: Error | null;
  attempt: number;
  canRetry: boolean;
}

export function useRetry<T>(
  asyncFunction: () => Promise<T>,
  options: RetryOptions = {}
) {
  const { maxAttempts = 3, delay = 1000, backoff = true } = options;
  const attemptRef = useRef(0);

  const [state, setState] = useState<RetryState>({
    isLoading: false,
    error: null,
    attempt: 0,
    canRetry: true,
  });

  const executeInternal = useCallback(async (currentAttempt: number): Promise<T | null> => {
    if (currentAttempt >= maxAttempts) {
      setState(prev => ({ ...prev, canRetry: false }));
      return null;
    }

    setState(prev => ({
      ...prev,
      isLoading: true,
      error: null,
      attempt: currentAttempt,
    }));

    try {
      const result = await asyncFunction();
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: null,
        attempt: 0,
        canRetry: true,
      }));
      attemptRef.current = 0;
      return result;
    } catch (error) {
      const newAttempt = currentAttempt + 1;
      const canRetry = newAttempt < maxAttempts;
      attemptRef.current = newAttempt;

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error as Error,
        attempt: newAttempt,
        canRetry,
      }));

      if (canRetry) {
        // Calculate delay with optional exponential backoff
        const retryDelay = backoff ? delay * Math.pow(2, currentAttempt) : delay;

        setTimeout(() => {
          executeInternal(newAttempt);
        }, retryDelay);
      }

      return null;
    }
  }, [asyncFunction, maxAttempts, delay, backoff]);

  const execute = useCallback(async (): Promise<T | null> => {
    attemptRef.current = 0;
    return executeInternal(0);
  }, [executeInternal]);

  const retry = useCallback(() => {
    if (state.canRetry) {
      attemptRef.current = 0;
      setState(prev => ({ ...prev, attempt: 0, canRetry: true }));
      executeInternal(0);
    }
  }, [executeInternal, state.canRetry]);

  const reset = useCallback(() => {
    attemptRef.current = 0;
    setState({
      isLoading: false,
      error: null,
      attempt: 0,
      canRetry: true,
    });
  }, []);

  return {
    ...state,
    execute,
    retry,
    reset,
  };
}
