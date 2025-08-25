import { useRetry } from '@/hooks/use-retry';
import { act, renderHook } from '@testing-library/react';

describe('useRetry', () => {
  it('should execute function successfully on first attempt', async () => {
    const mockFn = jest.fn().mockResolvedValue('success');
    const { result } = renderHook(() => useRetry(mockFn));

    let executeResult: any;
    await act(async () => {
      executeResult = await result.current.execute();
    });

    expect(executeResult).toBe('success');
    expect(result.current.error).toBeNull();
    expect(result.current.attempt).toBe(0);
    expect(result.current.canRetry).toBe(true);
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should handle errors correctly', async () => {
    const mockFn = jest.fn().mockRejectedValue(new Error('Test error'));
    const { result } = renderHook(() => useRetry(mockFn, { maxAttempts: 1 }));

    let executeResult: any;
    await act(async () => {
      executeResult = await result.current.execute();
    });

    expect(executeResult).toBeNull();
    expect(result.current.error?.message).toBe('Test error');
    expect(result.current.attempt).toBe(1);
    expect(result.current.canRetry).toBe(false);
  });

  it('should reset state correctly', () => {
    const mockFn = jest.fn().mockResolvedValue('success');
    const { result } = renderHook(() => useRetry(mockFn));

    act(() => {
      result.current.reset();
    });

    expect(result.current.error).toBeNull();
    expect(result.current.attempt).toBe(0);
    expect(result.current.canRetry).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it('should provide retry functionality', () => {
    const mockFn = jest.fn().mockResolvedValue('success');
    const { result } = renderHook(() => useRetry(mockFn));

    act(() => {
      result.current.retry();
    });

    expect(result.current.canRetry).toBe(true);
  });
});
