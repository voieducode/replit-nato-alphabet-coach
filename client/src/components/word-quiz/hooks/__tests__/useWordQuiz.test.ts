import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import { useWordQuiz } from '../useWordQuiz';

describe('useWordQuiz', () => {
  beforeEach(() => {
    // Clear any state between tests
  });

  describe('initialization', () => {
    it('should initialize with default state', async () => {
      const { result } = renderHook(() => useWordQuiz());

      // Wait for initialization
      await waitFor(() => {
        expect(result.current.currentWord).toBeTruthy();
      });

      expect(result.current.userNATOInput).toBe('');
      expect(result.current.customWordInput).toBe('');
      expect(result.current.isCustomMode).toBe(false);
      expect(result.current.showResult).toBe(false);
      expect(result.current.isCompleted).toBe(false);
      expect(result.current.matchResult).toBeNull();
    });
  });

  describe('generateNewWord', () => {
    it('should generate a new word and reset state', async () => {
      const { result } = renderHook(() => useWordQuiz());

      // Wait for initialization
      await waitFor(() => {
        expect(result.current.currentWord).toBeTruthy();
      });

      // Set some state to be reset
      act(() => {
        result.current.setUserNATOInput('some input');
        result.current.setIsCustomMode(true);
        result.current.setCustomWordInput('custom');
      });

      // Generate new word
      act(() => {
        result.current.generateNewWord();
      });

      await waitFor(() => {
        expect(result.current.userNATOInput).toBe('');
        expect(result.current.isCustomMode).toBe(false);
        expect(result.current.customWordInput).toBe('');
        expect(result.current.showResult).toBe(false);
        expect(result.current.isCompleted).toBe(false);
        expect(result.current.matchResult).toBeNull();
      });
    });
  });

  describe('useCustomWord', () => {
    it('should handle valid custom word input', async () => {
      const { result } = renderHook(() => useWordQuiz());

      await waitFor(() => {
        expect(result.current.currentWord).toBeTruthy();
      });

      // Set custom word input
      act(() => {
        result.current.setCustomWordInput('HELLO');
      });

      // Use custom word
      act(() => {
        result.current.useCustomWord();
      });

      await waitFor(() => {
        expect(result.current.currentWord?.word).toBe('HELLO');
        expect(result.current.isCustomMode).toBe(true);
        expect(result.current.customWordInput).toBe('');
      });
    });

    it('should handle empty custom word input gracefully', async () => {
      const { result } = renderHook(() => useWordQuiz());

      await waitFor(() => {
        expect(result.current.currentWord).toBeTruthy();
      });

      // Try to use empty custom word - should not crash
      expect(() => {
        act(() => {
          result.current.useCustomWord();
        });
      }).not.toThrow();

      // Should maintain state consistency
      expect(result.current.currentWord).toBeTruthy();
    });

    it('should handle invalid characters in custom word gracefully', async () => {
      const { result } = renderHook(() => useWordQuiz());

      await waitFor(() => {
        expect(result.current.currentWord).toBeTruthy();
      });

      // Set custom word with invalid characters
      act(() => {
        result.current.setCustomWordInput('@#$%');
      });

      // Should not crash when using invalid word
      expect(() => {
        act(() => {
          result.current.useCustomWord();
        });
      }).not.toThrow();

      // Should maintain state consistency
      expect(result.current.currentWord).toBeTruthy();
    });

    it('should set correct difficulty for different word lengths', async () => {
      const { result } = renderHook(() => useWordQuiz());

      await waitFor(() => {
        expect(result.current.currentWord).toBeTruthy();
      });

      // Test easy difficulty (≤5 characters)
      act(() => {
        result.current.setCustomWordInput('CAT');
      });

      act(() => {
        result.current.useCustomWord();
      });

      await waitFor(() => {
        expect(result.current.currentWord?.difficulty).toBe('easy');
      });

      // Test medium difficulty (6-8 characters)
      act(() => {
        result.current.setCustomWordInput('ELEPHANT');
      });

      act(() => {
        result.current.useCustomWord();
      });

      await waitFor(() => {
        expect(result.current.currentWord?.difficulty).toBe('medium');
      });

      // Test hard difficulty (>8 characters)
      act(() => {
        result.current.setCustomWordInput('EXTRAORDINARY');
      });

      act(() => {
        result.current.useCustomWord();
      });

      await waitFor(() => {
        expect(result.current.currentWord?.difficulty).toBe('hard');
      });
    });
  });

  describe('checkAnswer', () => {
    it('should check correct answer successfully', async () => {
      const { result } = renderHook(() => useWordQuiz());

      await waitFor(() => {
        expect(result.current.currentWord).toBeTruthy();
      });

      // Use a simple custom word for predictable testing
      act(() => {
        result.current.setCustomWordInput('CAT');
      });

      act(() => {
        result.current.useCustomWord();
      });

      await waitFor(() => {
        expect(result.current.currentWord?.word).toBe('CAT');
      });

      // Set NATO input
      act(() => {
        result.current.setUserNATOInput('Charlie Alpha Tango');
      });

      let checkResult: any;
      act(() => {
        checkResult = result.current.checkAnswer();
      });

      await waitFor(() => {
        expect(result.current.showResult).toBe(true);
        expect(result.current.matchResult).toBeTruthy();
        expect(checkResult?.percentage).toBeGreaterThan(0);
      });
    });

    it('should handle empty NATO input gracefully', async () => {
      const { result } = renderHook(() => useWordQuiz());

      await waitFor(() => {
        expect(result.current.currentWord).toBeTruthy();
      });

      // Try to check answer with empty input - should not crash
      expect(() => {
        act(() => {
          result.current.checkAnswer();
        });
      }).not.toThrow();

      // State should remain in a valid state
      expect(result.current.showResult).toBe(false);
    });

    it('should handle partial correct answers', async () => {
      const { result } = renderHook(() => useWordQuiz());

      await waitFor(() => {
        expect(result.current.currentWord).toBeTruthy();
      });

      // Use a simple custom word
      act(() => {
        result.current.setCustomWordInput('CAT');
      });

      act(() => {
        result.current.useCustomWord();
      });

      await waitFor(() => {
        expect(result.current.currentWord?.word).toBe('CAT');
      });

      act(() => {
        result.current.setUserNATOInput('Charlie Alpha Wrong');
      });

      act(() => {
        result.current.checkAnswer();
      });

      await waitFor(() => {
        expect(result.current.showResult).toBe(true);
        expect(result.current.matchResult?.percentage).toBeLessThan(100);
      });
    });
  });

  describe('retryCurrentWord', () => {
    it('should reset quiz state for retry', async () => {
      const { result } = renderHook(() => useWordQuiz());

      await waitFor(() => {
        expect(result.current.currentWord).toBeTruthy();
      });

      // Set some state to be reset
      act(() => {
        result.current.setUserNATOInput('some input');
      });

      // Simulate completed quiz
      act(() => {
        result.current.setCustomWordInput('CAT');
      });

      act(() => {
        result.current.useCustomWord();
      });

      await waitFor(() => {
        expect(result.current.currentWord?.word).toBe('CAT');
      });

      act(() => {
        result.current.setUserNATOInput('Charlie Alpha Tango');
      });

      act(() => {
        result.current.checkAnswer();
      });

      await waitFor(() => {
        expect(result.current.showResult).toBe(true);
      });

      // Retry
      act(() => {
        result.current.retryCurrentWord();
      });

      expect(result.current.userNATOInput).toBe('');
      expect(result.current.showResult).toBe(false);
      expect(result.current.isCompleted).toBe(false);
      expect(result.current.matchResult).toBeNull();
    });
  });

  describe('state management', () => {
    it('should maintain consistent state throughout quiz lifecycle', async () => {
      const { result } = renderHook(() => useWordQuiz());

      // Wait for initialization
      await waitFor(() => {
        expect(result.current.currentWord).toBeTruthy();
      });

      // Initial state
      expect(result.current.showResult).toBe(false);
      expect(result.current.isCompleted).toBe(false);
      expect(result.current.matchResult).toBeNull();

      // Use custom word for predictable testing
      act(() => {
        result.current.setCustomWordInput('CAT');
      });

      act(() => {
        result.current.useCustomWord();
      });

      await waitFor(() => {
        expect(result.current.currentWord?.word).toBe('CAT');
      });

      // User input
      act(() => {
        result.current.setUserNATOInput('Charlie Alpha Tango');
      });

      expect(result.current.userNATOInput).toBe('Charlie Alpha Tango');

      // Check answer
      act(() => {
        result.current.checkAnswer();
      });

      await waitFor(() => {
        expect(result.current.showResult).toBe(true);
        expect(result.current.matchResult).toBeTruthy();
      });

      // Retry
      act(() => {
        result.current.retryCurrentWord();
      });

      expect(result.current.showResult).toBe(false);
      expect(result.current.isCompleted).toBe(false);
      expect(result.current.matchResult).toBeNull();
      expect(result.current.userNATOInput).toBe('');
    });
  });

  describe('setter functions', () => {
    it('should properly update state via setters', async () => {
      const { result } = renderHook(() => useWordQuiz());

      await waitFor(() => {
        expect(result.current.currentWord).toBeTruthy();
      });

      // Test setUserNATOInput
      act(() => {
        result.current.setUserNATOInput('Alpha Bravo');
      });
      expect(result.current.userNATOInput).toBe('Alpha Bravo');

      // Test setCustomWordInput
      act(() => {
        result.current.setCustomWordInput('TEST');
      });
      expect(result.current.customWordInput).toBe('TEST');

      // Test setIsCustomMode
      act(() => {
        result.current.setIsCustomMode(true);
      });
      expect(result.current.isCustomMode).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle various word difficulties correctly', async () => {
      const { result } = renderHook(() => useWordQuiz());

      await waitFor(() => {
        expect(result.current.currentWord).toBeTruthy();
      });

      const testCases = [
        { word: 'A', expectedDifficulty: 'easy' },
        { word: 'HELLO', expectedDifficulty: 'easy' },
        { word: 'EXAMPLE', expectedDifficulty: 'medium' },
        { word: 'ELEPHANT', expectedDifficulty: 'medium' },
        { word: 'EXTRAORDINARY', expectedDifficulty: 'hard' },
      ];

      for (const { word, expectedDifficulty } of testCases) {
        act(() => {
          result.current.setCustomWordInput(word);
        });

        act(() => {
          result.current.useCustomWord();
        });

        await waitFor(() => {
          expect(result.current.currentWord?.difficulty).toBe(
            expectedDifficulty
          );
        });
      }
    });

    it('should handle whitespace-only inputs gracefully', async () => {
      const { result } = renderHook(() => useWordQuiz());

      await waitFor(() => {
        expect(result.current.currentWord).toBeTruthy();
      });

      // Try whitespace-only custom input - should not crash
      expect(() => {
        act(() => {
          result.current.setCustomWordInput('   ');
          result.current.useCustomWord();
        });
      }).not.toThrow();

      // Try whitespace-only NATO input - should not crash
      expect(() => {
        act(() => {
          result.current.setUserNATOInput('   ');
          result.current.checkAnswer();
        });
      }).not.toThrow();

      // Should maintain consistent state
      expect(result.current.currentWord).toBeTruthy();
    });

    it('should handle missing current word gracefully', async () => {
      const { result } = renderHook(() => useWordQuiz());

      await waitFor(() => {
        expect(result.current.currentWord).toBeTruthy();
      });

      // Manually set currentWord to null to test edge case
      act(() => {
        (result.current as any).currentWord = null;
        result.current.setUserNATOInput('Alpha Bravo');
      });

      // Should not crash when checking answer without current word
      expect(() => {
        act(() => {
          result.current.checkAnswer();
        });
      }).not.toThrow();
    });
  });

  describe('error resilience', () => {
    it('should handle rapid state changes without issues', async () => {
      const { result } = renderHook(() => useWordQuiz());

      await waitFor(() => {
        expect(result.current.currentWord).toBeTruthy();
      });

      // Rapid state changes should not cause issues
      expect(() => {
        act(() => {
          result.current.setUserNATOInput('Alpha');
          result.current.setUserNATOInput('Alpha Bravo');
          result.current.setUserNATOInput('Alpha Bravo Charlie');
          result.current.setCustomWordInput('TEST');
          result.current.setCustomWordInput('HELLO');
          result.current.setIsCustomMode(true);
          result.current.setIsCustomMode(false);
        });
      }).not.toThrow();
    });

    it('should maintain hook stability across multiple operations', async () => {
      const { result } = renderHook(() => useWordQuiz());

      await waitFor(() => {
        expect(result.current.currentWord).toBeTruthy();
      });

      // Perform multiple operations to ensure stability
      for (let i = 0; i < 3; i++) {
        const testWord = `WORD${i}`;

        act(() => {
          result.current.setCustomWordInput(testWord);
        });

        // Wait for custom word input to be set
        await waitFor(() => {
          expect(result.current.customWordInput).toBe(testWord);
        });

        act(() => {
          result.current.useCustomWord();
        });

        // Wait for custom word to be applied with more specific check
        await waitFor(
          () => {
            expect(result.current.currentWord?.word).toBe(testWord);
            expect(result.current.isCustomMode).toBe(true);
          },
          { timeout: 2000 }
        );

        act(() => {
          result.current.setUserNATOInput('Alpha Bravo Charlie');
        });

        act(() => {
          result.current.checkAnswer();
        });

        await waitFor(() => {
          expect(result.current.showResult).toBe(true);
        });

        act(() => {
          result.current.retryCurrentWord();
        });

        expect(result.current.showResult).toBe(false);
        expect(result.current.userNATOInput).toBe('');
      }
    });
  });
});
