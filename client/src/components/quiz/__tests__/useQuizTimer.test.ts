import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useQuizTimer } from '../useQuizTimer';

describe('useQuizTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('provides expected interface', () => {
    const { result } = renderHook(() => useQuizTimer(true, false, false, {}));

    // Test that the hook provides the expected properties
    expect(result.current).toHaveProperty('currentTime');
    expect(result.current).toHaveProperty('setCurrentTime');
    expect(typeof result.current.setCurrentTime).toBe('function');
  });

  it('resets timer when quizSet changes', () => {
    let quizSet = { id: 1 };
    const { result, rerender } = renderHook(
      ({ active, set }) => useQuizTimer(active, false, false, set),
      {
        initialProps: { active: true, set: quizSet },
      }
    );
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.currentTime).toBeGreaterThanOrEqual(1);
    quizSet = { id: 2 };
    rerender({ active: true, set: quizSet });
    expect(result.current.currentTime).toBe(0);
  });

  it('stops timer when inactive', () => {
    const { result, rerender } = renderHook(
      ({ active }) => useQuizTimer(active, false, false, {}),
      {
        initialProps: { active: true },
      }
    );
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    rerender({ active: false });
    const time = result.current.currentTime;
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.currentTime).toBe(time);
  });
});
