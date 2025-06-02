import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useHintTimer } from '../useHintTimer';

describe('useHintTimer', () => {
  it('shows hint after 5 seconds', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useHintTimer(true, false));
    expect(result.current.showHint).toBe(false);
    act(() => {
      vi.advanceTimersByTime(6000);
    });
    expect(result.current.showHint).toBe(true);
    vi.useRealTimers();
  });

  it('resets hint and timer', () => {
    const { result } = renderHook(() => useHintTimer(true, false));
    act(() => {
      result.current.setShowHint(true);
      result.current.setHintTimer(10);
      result.current.setShowHint(false);
      result.current.setHintTimer(0);
    });
    expect(result.current.showHint).toBe(false);
    expect(result.current.hintTimer).toBe(0);
  });
});
