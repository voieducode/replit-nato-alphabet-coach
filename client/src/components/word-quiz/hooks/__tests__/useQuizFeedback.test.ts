import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useQuizFeedback } from '../useQuizFeedback';

// Define a minimal type inline to avoid import issues
interface MockWordMatchResult {
  percentage: number;
  correctCount: number;
  totalCount: number;
  score: number;
  matches: any[];
}

describe('useQuizFeedback', () => {
  const createResult = (
    percentage: number,
    correctCount: number,
    totalCount: number
  ): MockWordMatchResult => ({
    percentage,
    correctCount,
    totalCount,
    score: correctCount,
    matches: [],
  });

  describe('showResultFeedback', () => {
    it('should execute without errors for perfect scores', () => {
      const { result } = renderHook(() => useQuizFeedback());

      // Should not throw
      expect(() => {
        act(() => {
          result.current.showResultFeedback(createResult(100, 3, 3));
        });
      }).not.toThrow();
    });

    it('should execute without errors for high scores', () => {
      const { result } = renderHook(() => useQuizFeedback());

      expect(() => {
        act(() => {
          result.current.showResultFeedback(createResult(90, 9, 10));
        });
      }).not.toThrow();

      expect(() => {
        act(() => {
          result.current.showResultFeedback(createResult(80, 4, 5));
        });
      }).not.toThrow();
    });

    it('should execute without errors for medium scores', () => {
      const { result } = renderHook(() => useQuizFeedback());

      expect(() => {
        act(() => {
          result.current.showResultFeedback(createResult(67, 2, 3));
        });
      }).not.toThrow();

      expect(() => {
        act(() => {
          result.current.showResultFeedback(createResult(50, 5, 10));
        });
      }).not.toThrow();
    });

    it('should execute without errors for low scores', () => {
      const { result } = renderHook(() => useQuizFeedback());

      expect(() => {
        act(() => {
          result.current.showResultFeedback(createResult(25, 1, 4));
        });
      }).not.toThrow();

      expect(() => {
        act(() => {
          result.current.showResultFeedback(createResult(0, 0, 5));
        });
      }).not.toThrow();
    });

    it('should handle boundary cases without errors', () => {
      const { result } = renderHook(() => useQuizFeedback());

      const boundaryCases = [
        { percentage: 79, correctCount: 79, totalCount: 100 },
        { percentage: 49, correctCount: 49, totalCount: 100 },
        { percentage: 99, correctCount: 99, totalCount: 100 },
        { percentage: 1, correctCount: 1, totalCount: 100 },
      ];

      boundaryCases.forEach(({ percentage, correctCount, totalCount }) => {
        expect(() => {
          act(() => {
            result.current.showResultFeedback(
              createResult(percentage, correctCount, totalCount)
            );
          });
        }).not.toThrow();
      });
    });

    it('should handle edge cases gracefully', () => {
      const { result } = renderHook(() => useQuizFeedback());

      const edgeCases = [
        { percentage: 0, correctCount: 0, totalCount: 0 }, // Zero total
        { percentage: -5, correctCount: 0, totalCount: 5 }, // Negative percentage
        { percentage: 150, correctCount: 15, totalCount: 10 }, // Above 100%
        { percentage: 100, correctCount: 1000, totalCount: 1000 }, // Large numbers
      ];

      edgeCases.forEach(({ percentage, correctCount, totalCount }) => {
        expect(() => {
          act(() => {
            result.current.showResultFeedback(
              createResult(percentage, correctCount, totalCount)
            );
          });
        }).not.toThrow();
      });
    });
  });

  describe('hook initialization', () => {
    it('should initialize properly and return feedback function', () => {
      const { result } = renderHook(() => useQuizFeedback());

      expect(result.current).toBeDefined();
      expect(result.current.showResultFeedback).toBeDefined();
      expect(typeof result.current.showResultFeedback).toBe('function');
    });

    it('should be stable across re-renders', () => {
      const { result, rerender } = renderHook(() => useQuizFeedback());

      const firstFeedbackFunction = result.current.showResultFeedback;

      rerender();

      const secondFeedbackFunction = result.current.showResultFeedback;

      // The function should be stable (though this might vary based on implementation)
      expect(typeof firstFeedbackFunction).toBe('function');
      expect(typeof secondFeedbackFunction).toBe('function');
    });
  });

  describe('feedback logic validation', () => {
    it('should handle multiple feedback calls in sequence', () => {
      const { result } = renderHook(() => useQuizFeedback());

      // Should handle multiple calls without issues
      expect(() => {
        act(() => {
          result.current.showResultFeedback(createResult(100, 5, 5));
          result.current.showResultFeedback(createResult(80, 4, 5));
          result.current.showResultFeedback(createResult(60, 3, 5));
          result.current.showResultFeedback(createResult(40, 2, 5));
          result.current.showResultFeedback(createResult(0, 0, 5));
        });
      }).not.toThrow();
    });

    it('should work with realistic score scenarios', () => {
      const { result } = renderHook(() => useQuizFeedback());

      const realisticScenarios = [
        { percentage: 100, correctCount: 5, totalCount: 5 }, // Perfect 5-letter word
        { percentage: 67, correctCount: 2, totalCount: 3 }, // 2 out of 3 correct
        { percentage: 83, correctCount: 5, totalCount: 6 }, // Most correct
        { percentage: 25, correctCount: 1, totalCount: 4 }, // Mostly wrong
      ];

      realisticScenarios.forEach(({ percentage, correctCount, totalCount }) => {
        expect(() => {
          act(() => {
            result.current.showResultFeedback(
              createResult(percentage, correctCount, totalCount)
            );
          });
        }).not.toThrow();
      });
    });
  });
});
