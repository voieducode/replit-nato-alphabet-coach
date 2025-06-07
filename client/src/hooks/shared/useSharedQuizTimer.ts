import { useEffect, useRef, useState } from 'react';

export interface QuizTimerOptions {
  /**
   * Whether the timer should be active
   */
  isActive?: boolean;
  /**
   * Whether the quiz is complete (stops timer)
   */
  isComplete?: boolean;
  /**
   * Whether to pause timer when showing results
   */
  pauseOnResult?: boolean;
  /**
   * Auto-reset when dependencies change
   */
  resetDependency?: unknown;
  /**
   * Callback when timer updates
   */
  onTick?: (time: number) => void;
  /**
   * Callback when timer resets
   */
  onReset?: () => void;
}

/**
 * Shared quiz timer hook that provides consistent timer functionality
 * across different quiz components
 */
export function useSharedQuizTimer(options: QuizTimerOptions = {}) {
  const {
    isActive = true,
    isComplete = false,
    pauseOnResult = false,
    resetDependency,
    onTick,
    onReset,
  } = options;

  const [currentTime, setCurrentTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const prevResetDependencyRef = useRef(resetDependency);
  const manuallyPausedRef = useRef(false);

  // Main timer effect
  useEffect(() => {
    const shouldRun =
      isActive && !isComplete && !pauseOnResult && !manuallyPausedRef.current;

    if (shouldRun && !timerRef.current) {
      timerRef.current = setInterval(() => {
        setCurrentTime((prevTime) => {
          const newTime = prevTime + 1;
          onTick?.(newTime);
          return newTime;
        });
      }, 1000);
      setIsRunning(true);
    } else if (!shouldRun && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      setIsRunning(false);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive, isComplete, pauseOnResult, onTick]);

  // Reset timer when dependency changes
  useEffect(() => {
    if (prevResetDependencyRef.current !== resetDependency) {
      prevResetDependencyRef.current = resetDependency;
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      setCurrentTime(0);
      setIsRunning(false);
      manuallyPausedRef.current = false;
      onReset?.();
    }
  }, [resetDependency, onReset]);

  // Manual reset function
  const resetTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setCurrentTime(0);
    setIsRunning(false);
    manuallyPausedRef.current = false;
    onReset?.();
  };

  // Pause function
  const pauseTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setIsRunning(false);
    manuallyPausedRef.current = true;
  };

  // Resume function (only if conditions allow)
  const resumeTimer = () => {
    if (isActive && !isComplete && !pauseOnResult) {
      manuallyPausedRef.current = false;
      if (!timerRef.current) {
        timerRef.current = setInterval(() => {
          setCurrentTime((prevTime) => {
            const newTime = prevTime + 1;
            onTick?.(newTime);
            return newTime;
          });
        }, 1000);
        setIsRunning(true);
      }
    }
  };

  // Initialize timer on mount if conditions are met
  useEffect(() => {
    const shouldRun = isActive && !isComplete && !pauseOnResult;
    if (shouldRun) {
      setIsRunning(true);
    }
  }, []); // Only run on mount

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  return {
    currentTime,
    resetTimer,
    pauseTimer,
    resumeTimer,
    setCurrentTime,
    isRunning,
  };
}
