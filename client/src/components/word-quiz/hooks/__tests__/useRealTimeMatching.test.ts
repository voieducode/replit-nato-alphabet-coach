import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useRealTimeMatching } from '../useRealTimeMatching';

// Mock dependencies
const mockGetRealTimeMatch = vi.fn();
vi.mock('@/lib/word-matching', () => ({
  getRealTimeMatch: mockGetRealTimeMatch,
}));

describe('useRealTimeMatching', () => {
  const mockSetMatchResult = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockSetMatchResult.mockClear();
    mockGetRealTimeMatch.mockReturnValue({
      matches: [
        {
          letter: 'C',
          expected: 'Charlie',
          actual: 'Charlie',
          isCorrect: true,
        },
        { letter: 'A', expected: 'Alpha', actual: 'Alpha', isCorrect: true },
        { letter: 'T', expected: 'Tango', actual: 'Tango', isCorrect: true },
      ],
    });
  });

  describe('real-time matching', () => {
    it('should update match result when user types NATO input', () => {
      const props = {
        currentWord: { word: 'CAT', difficulty: 'easy' as const },
        userNATOInput: 'Charlie Alpha Tango',
        showResult: false,
        setMatchResult: mockSetMatchResult,
      };

      renderHook(() => useRealTimeMatching(props));

      expect(mockGetRealTimeMatch).toHaveBeenCalledWith(
        'CAT',
        'Charlie Alpha Tango'
      );
      expect(mockSetMatchResult).toHaveBeenCalledWith({
        score: 3,
        percentage: 100,
        correctCount: 3,
        totalCount: 3,
        matches: [
          {
            letter: 'C',
            expected: 'Charlie',
            actual: 'Charlie',
            isCorrect: true,
          },
          { letter: 'A', expected: 'Alpha', actual: 'Alpha', isCorrect: true },
          { letter: 'T', expected: 'Tango', actual: 'Tango', isCorrect: true },
        ],
      });
    });

    it('should handle partial matches correctly', () => {
      mockGetRealTimeMatch.mockReturnValue({
        matches: [
          {
            letter: 'C',
            expected: 'Charlie',
            actual: 'Charlie',
            isCorrect: true,
          },
          { letter: 'A', expected: 'Alpha', actual: 'Wrong', isCorrect: false },
          { letter: 'T', expected: 'Tango', actual: '', isCorrect: false },
        ],
      });

      const props = {
        currentWord: { word: 'CAT', difficulty: 'easy' as const },
        userNATOInput: 'Charlie Wrong',
        showResult: false,
        setMatchResult: mockSetMatchResult,
      };

      renderHook(() => useRealTimeMatching(props));

      expect(mockSetMatchResult).toHaveBeenCalledWith({
        score: 1,
        percentage: 33,
        correctCount: 1,
        totalCount: 3,
        matches: [
          {
            letter: 'C',
            expected: 'Charlie',
            actual: 'Charlie',
            isCorrect: true,
          },
          { letter: 'A', expected: 'Alpha', actual: 'Wrong', isCorrect: false },
          { letter: 'T', expected: 'Tango', actual: '', isCorrect: false },
        ],
      });
    });

    it('should not update when showResult is true', () => {
      const props = {
        currentWord: { word: 'CAT', difficulty: 'easy' as const },
        userNATOInput: 'Charlie Alpha Tango',
        showResult: true,
        setMatchResult: mockSetMatchResult,
      };

      renderHook(() => useRealTimeMatching(props));

      expect(mockGetRealTimeMatch).not.toHaveBeenCalled();
      expect(mockSetMatchResult).not.toHaveBeenCalled();
    });

    it('should not update when currentWord is null', () => {
      const props = {
        currentWord: null,
        userNATOInput: 'Charlie Alpha Tango',
        showResult: false,
        setMatchResult: mockSetMatchResult,
      };

      renderHook(() => useRealTimeMatching(props));

      expect(mockGetRealTimeMatch).not.toHaveBeenCalled();
      expect(mockSetMatchResult).not.toHaveBeenCalled();
    });

    it('should not update when userNATOInput is empty', () => {
      const props = {
        currentWord: { word: 'CAT', difficulty: 'easy' as const },
        userNATOInput: '',
        showResult: false,
        setMatchResult: mockSetMatchResult,
      };

      renderHook(() => useRealTimeMatching(props));

      expect(mockGetRealTimeMatch).not.toHaveBeenCalled();
      expect(mockSetMatchResult).not.toHaveBeenCalled();
    });

    it('should update when userNATOInput changes', () => {
      const initialProps = {
        currentWord: { word: 'CAT', difficulty: 'easy' as const },
        userNATOInput: 'Charlie',
        showResult: false,
        setMatchResult: mockSetMatchResult,
      };

      mockGetRealTimeMatch.mockReturnValueOnce({
        matches: [
          {
            letter: 'C',
            expected: 'Charlie',
            actual: 'Charlie',
            isCorrect: true,
          },
          { letter: 'A', expected: 'Alpha', actual: '', isCorrect: false },
          { letter: 'T', expected: 'Tango', actual: '', isCorrect: false },
        ],
      });

      const { rerender } = renderHook((props) => useRealTimeMatching(props), {
        initialProps,
      });

      expect(mockGetRealTimeMatch).toHaveBeenCalledWith('CAT', 'Charlie');
      expect(mockSetMatchResult).toHaveBeenCalledWith({
        score: 1,
        percentage: 33,
        correctCount: 1,
        totalCount: 3,
        matches: [
          {
            letter: 'C',
            expected: 'Charlie',
            actual: 'Charlie',
            isCorrect: true,
          },
          { letter: 'A', expected: 'Alpha', actual: '', isCorrect: false },
          { letter: 'T', expected: 'Tango', actual: '', isCorrect: false },
        ],
      });

      // Clear mocks and update input
      vi.clearAllMocks();
      mockSetMatchResult.mockClear();

      mockGetRealTimeMatch.mockReturnValueOnce({
        matches: [
          {
            letter: 'C',
            expected: 'Charlie',
            actual: 'Charlie',
            isCorrect: true,
          },
          { letter: 'A', expected: 'Alpha', actual: 'Alpha', isCorrect: true },
          { letter: 'T', expected: 'Tango', actual: '', isCorrect: false },
        ],
      });

      rerender({
        ...initialProps,
        userNATOInput: 'Charlie Alpha',
      });

      expect(mockGetRealTimeMatch).toHaveBeenCalledWith('CAT', 'Charlie Alpha');
      expect(mockSetMatchResult).toHaveBeenCalledWith({
        score: 2,
        percentage: 67,
        correctCount: 2,
        totalCount: 3,
        matches: [
          {
            letter: 'C',
            expected: 'Charlie',
            actual: 'Charlie',
            isCorrect: true,
          },
          { letter: 'A', expected: 'Alpha', actual: 'Alpha', isCorrect: true },
          { letter: 'T', expected: 'Tango', actual: '', isCorrect: false },
        ],
      });
    });

    it('should update when currentWord changes', () => {
      const initialProps = {
        currentWord: { word: 'CAT', difficulty: 'easy' as const },
        userNATOInput: 'Charlie Alpha Tango',
        showResult: false,
        setMatchResult: mockSetMatchResult,
      };

      const { rerender } = renderHook((props) => useRealTimeMatching(props), {
        initialProps,
      });

      expect(mockGetRealTimeMatch).toHaveBeenCalledWith(
        'CAT',
        'Charlie Alpha Tango'
      );

      // Clear mocks and change word
      vi.clearAllMocks();
      mockSetMatchResult.mockClear();

      mockGetRealTimeMatch.mockReturnValueOnce({
        matches: [
          {
            letter: 'D',
            expected: 'Delta',
            actual: 'Charlie',
            isCorrect: false,
          },
          { letter: 'O', expected: 'Oscar', actual: 'Alpha', isCorrect: false },
          { letter: 'G', expected: 'Golf', actual: 'Tango', isCorrect: false },
        ],
      });

      rerender({
        ...initialProps,
        currentWord: { word: 'DOG', difficulty: 'easy' as const },
      });

      expect(mockGetRealTimeMatch).toHaveBeenCalledWith(
        'DOG',
        'Charlie Alpha Tango'
      );
      expect(mockSetMatchResult).toHaveBeenCalledWith({
        score: 0,
        percentage: 0,
        correctCount: 0,
        totalCount: 3,
        matches: [
          {
            letter: 'D',
            expected: 'Delta',
            actual: 'Charlie',
            isCorrect: false,
          },
          { letter: 'O', expected: 'Oscar', actual: 'Alpha', isCorrect: false },
          { letter: 'G', expected: 'Golf', actual: 'Tango', isCorrect: false },
        ],
      });
    });

    it('should handle zero matches without errors', () => {
      mockGetRealTimeMatch.mockReturnValue({
        matches: [],
      });

      const props = {
        currentWord: { word: '', difficulty: 'easy' as const },
        userNATOInput: 'Charlie',
        showResult: false,
        setMatchResult: mockSetMatchResult,
      };

      renderHook(() => useRealTimeMatching(props));

      expect(mockSetMatchResult).toHaveBeenCalledWith({
        score: 0,
        percentage: Number.NaN, // 0/0 = NaN, which gets rounded to NaN
        correctCount: 0,
        totalCount: 0,
        matches: [],
      });
    });

    it('should handle percentage calculation correctly for edge cases', () => {
      mockGetRealTimeMatch.mockReturnValue({
        matches: [
          { letter: 'A', expected: 'Alpha', actual: 'Alpha', isCorrect: true },
          { letter: 'B', expected: 'Bravo', actual: 'Wrong', isCorrect: false },
          {
            letter: 'C',
            expected: 'Charlie',
            actual: 'Wrong',
            isCorrect: false,
          },
        ],
      });

      const props = {
        currentWord: { word: 'ABC', difficulty: 'easy' as const },
        userNATOInput: 'Alpha Wrong Wrong',
        showResult: false,
        setMatchResult: mockSetMatchResult,
      };

      renderHook(() => useRealTimeMatching(props));

      expect(mockSetMatchResult).toHaveBeenCalledWith({
        score: 1,
        percentage: 33, // Math.round(1/3 * 100) = 33
        correctCount: 1,
        totalCount: 3,
        matches: [
          { letter: 'A', expected: 'Alpha', actual: 'Alpha', isCorrect: true },
          { letter: 'B', expected: 'Bravo', actual: 'Wrong', isCorrect: false },
          {
            letter: 'C',
            expected: 'Charlie',
            actual: 'Wrong',
            isCorrect: false,
          },
        ],
      });
    });

    it('should not update when transitioning to showResult true', () => {
      const initialProps = {
        currentWord: { word: 'CAT', difficulty: 'easy' as const },
        userNATOInput: 'Charlie Alpha Tango',
        showResult: false,
        setMatchResult: mockSetMatchResult,
      };

      const { rerender } = renderHook((props) => useRealTimeMatching(props), {
        initialProps,
      });

      expect(mockGetRealTimeMatch).toHaveBeenCalledTimes(1);
      expect(mockSetMatchResult).toHaveBeenCalledTimes(1);

      // Clear mocks and set showResult to true
      vi.clearAllMocks();
      mockSetMatchResult.mockClear();

      rerender({
        ...initialProps,
        showResult: true,
      });

      expect(mockGetRealTimeMatch).not.toHaveBeenCalled();
      expect(mockSetMatchResult).not.toHaveBeenCalled();
    });
  });
});
