import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useSharedQuizTimer } from '../useSharedQuizTimer';

describe('useSharedQuizTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initialization', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => useSharedQuizTimer());

      expect(result.current.currentTime).toBe(0);
      expect(result.current.isRunning).toBe(true);
      expect(typeof result.current.resetTimer).toBe('function');
      expect(typeof result.current.pauseTimer).toBe('function');
      expect(typeof result.current.resumeTimer).toBe('function');
      expect(typeof result.current.setCurrentTime).toBe('function');
    });

    it('should accept custom options', () => {
      const onTick = vi.fn();
      const onReset = vi.fn();

      const { result } = renderHook(() =>
        useSharedQuizTimer({
          isActive: false,
          isComplete: true,
          pauseOnResult: true,
          onTick,
          onReset,
        })
      );

      expect(result.current.currentTime).toBe(0);
      expect(result.current.isRunning).toBe(false);
    });
  });

  describe('timer functionality', () => {
    it('should increment time when active', () => {
      const { result } = renderHook(() =>
        useSharedQuizTimer({ isActive: true })
      );

      expect(result.current.currentTime).toBe(0);

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.currentTime).toBe(1);

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(result.current.currentTime).toBe(4);
    });

    it('should not increment time when inactive', () => {
      const { result } = renderHook(() =>
        useSharedQuizTimer({ isActive: false })
      );

      expect(result.current.currentTime).toBe(0);

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(result.current.currentTime).toBe(0);
    });

    it('should pause when quiz is complete', () => {
      const { result, rerender } = renderHook(
        ({ isComplete }) => useSharedQuizTimer({ isComplete }),
        { initialProps: { isComplete: false } }
      );

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(result.current.currentTime).toBe(2);

      rerender({ isComplete: true });

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(result.current.currentTime).toBe(2);
    });

    it('should pause when showing results if pauseOnResult is true', () => {
      const { result, rerender } = renderHook(
        ({ pauseOnResult }) => useSharedQuizTimer({ pauseOnResult }),
        { initialProps: { pauseOnResult: false } }
      );

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(result.current.currentTime).toBe(2);

      rerender({ pauseOnResult: true });

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(result.current.currentTime).toBe(2);
    });
  });

  describe('callbacks', () => {
    it('should call onTick when timer updates', () => {
      const onTick = vi.fn();

      renderHook(() => useSharedQuizTimer({ onTick }));

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(onTick).toHaveBeenCalledWith(1);

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(onTick).toHaveBeenCalledWith(2);
    });

    it('should call onReset when timer resets', () => {
      const onReset = vi.fn();

      const { result } = renderHook(() => useSharedQuizTimer({ onReset }));

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      act(() => {
        result.current.resetTimer();
      });

      expect(onReset).toHaveBeenCalled();
    });

    it('should call onReset when dependency changes', () => {
      const onReset = vi.fn();
      let dependency = 'initial';

      const { rerender } = renderHook(() =>
        useSharedQuizTimer({ onReset, resetDependency: dependency })
      );

      dependency = 'changed';
      rerender();

      expect(onReset).toHaveBeenCalled();
    });
  });

  describe('manual controls', () => {
    it('should reset timer manually', () => {
      const { result } = renderHook(() => useSharedQuizTimer());

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(result.current.currentTime).toBe(5);

      act(() => {
        result.current.resetTimer();
      });

      expect(result.current.currentTime).toBe(0);
    });

    it('should pause timer manually', () => {
      const { result } = renderHook(() => useSharedQuizTimer());

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(result.current.currentTime).toBe(2);
      expect(result.current.isRunning).toBe(true);

      act(() => {
        result.current.pauseTimer();
      });

      expect(result.current.isRunning).toBe(false);

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(result.current.currentTime).toBe(2);
    });

    it('should resume timer manually', () => {
      const { result } = renderHook(() => useSharedQuizTimer());

      act(() => {
        result.current.pauseTimer();
      });

      expect(result.current.isRunning).toBe(false);

      act(() => {
        result.current.resumeTimer();
      });

      expect(result.current.isRunning).toBe(true);

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(result.current.currentTime).toBe(2);
    });

    it('should not resume if quiz is complete', () => {
      const { result } = renderHook(() =>
        useSharedQuizTimer({ isComplete: true })
      );

      act(() => {
        result.current.resumeTimer();
      });

      expect(result.current.isRunning).toBe(false);
    });

    it('should not resume if not active', () => {
      const { result } = renderHook(() =>
        useSharedQuizTimer({ isActive: false })
      );

      act(() => {
        result.current.resumeTimer();
      });

      expect(result.current.isRunning).toBe(false);
    });
  });

  describe('dependency reset', () => {
    it('should reset when resetDependency changes', () => {
      let dependency = { id: 1 };

      const { result, rerender } = renderHook(() =>
        useSharedQuizTimer({ resetDependency: dependency })
      );

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(result.current.currentTime).toBe(3);

      dependency = { id: 2 };
      rerender();

      expect(result.current.currentTime).toBe(0);
    });

    it('should not reset if dependency remains the same', () => {
      const dependency = { id: 1 };

      const { result, rerender } = renderHook(() =>
        useSharedQuizTimer({ resetDependency: dependency })
      );

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(result.current.currentTime).toBe(3);

      rerender();

      expect(result.current.currentTime).toBe(3);
    });
  });

  describe('cleanup', () => {
    it('should cleanup timer on unmount', () => {
      const { result, unmount } = renderHook(() => useSharedQuizTimer());

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(result.current.currentTime).toBe(2);

      unmount();

      // Timer should be cleaned up, no more updates
      act(() => {
        vi.advanceTimersByTime(5000);
      });

      // We can't check the time after unmount, but the test ensures
      // no errors are thrown during cleanup
    });
  });

  describe('state transitions', () => {
    it('should handle active state changes correctly', () => {
      const { result, rerender } = renderHook(
        ({ isActive }) => useSharedQuizTimer({ isActive }),
        { initialProps: { isActive: true } }
      );

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(result.current.currentTime).toBe(2);

      // Pause by making inactive
      rerender({ isActive: false });

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(result.current.currentTime).toBe(2);

      // Resume by making active again
      rerender({ isActive: true });

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.currentTime).toBe(3);
    });

    it('should handle multiple state changes in sequence', () => {
      const { result, rerender } = renderHook(
        ({ isActive, isComplete, pauseOnResult }) =>
          useSharedQuizTimer({ isActive, isComplete, pauseOnResult }),
        {
          initialProps: {
            isActive: true,
            isComplete: false,
            pauseOnResult: false,
          },
        }
      );

      // Timer should be running
      expect(result.current.isRunning).toBe(true);

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.currentTime).toBe(1);

      // Pause on result
      rerender({ isActive: true, isComplete: false, pauseOnResult: true });

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.currentTime).toBe(1);

      // Complete quiz
      rerender({ isActive: true, isComplete: true, pauseOnResult: false });

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.currentTime).toBe(1);

      // Make inactive
      rerender({ isActive: false, isComplete: false, pauseOnResult: false });

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.currentTime).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle rapid state changes', () => {
      const { result, rerender } = renderHook(
        ({ isActive }) => useSharedQuizTimer({ isActive }),
        { initialProps: { isActive: true } }
      );

      // Rapid state changes
      for (let i = 0; i < 10; i++) {
        rerender({ isActive: i % 2 === 0 });
      }

      // Should not throw errors and should be in a consistent state
      expect(typeof result.current.currentTime).toBe('number');
      expect(typeof result.current.isRunning).toBe('boolean');
    });

    it('should handle setCurrentTime correctly', () => {
      const { result } = renderHook(() => useSharedQuizTimer());

      act(() => {
        result.current.setCurrentTime(10);
      });

      expect(result.current.currentTime).toBe(10);

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(result.current.currentTime).toBe(12);
    });
  });
});
