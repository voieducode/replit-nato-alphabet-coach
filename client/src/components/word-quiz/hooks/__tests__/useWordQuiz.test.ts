import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useWordQuiz } from '../useWordQuiz';

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

vi.mock('@/lib/word-dictionary', () => ({
  getRandomWord: vi.fn(() => ({ word: 'CAT', difficulty: 'easy' })),
  isValidWordInput: vi.fn((input: string) => /^[a-z\d\s]+$/i.test(input)),
  normalizeWordInput: vi.fn((input: string) => input.toUpperCase().trim()),
}));

vi.mock('@/lib/word-matching', () => ({
  matchWordToNATO: vi.fn(() => ({
    score: 3,
    percentage: 100,
    correctCount: 3,
    totalCount: 3,
    matches: [
      { letter: 'C', expected: 'Charlie', actual: 'Charlie', isCorrect: true },
      { letter: 'A', expected: 'Alpha', actual: 'Alpha', isCorrect: true },
      { letter: 'T', expected: 'Tango', actual: 'Tango', isCorrect: true },
    ],
  })),
}));

describe('useWordQuiz', () => {
  let mockToast: ReturnType<typeof vi.fn>;
  let mockGetRandomWord: ReturnType<typeof vi.fn>;
  let mockIsValidWordInput: ReturnType<typeof vi.fn>;
  let mockNormalizeWordInput: ReturnType<typeof vi.fn>;
  let mockMatchWordToNATO: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Get the mocked functions
    const { useToast } = await vi.importMock('@/hooks/use-toast');
    const mockUseToast = useToast as () => { toast: ReturnType<typeof vi.fn> };
    mockToast = mockUseToast().toast;

    const { getRandomWord, isValidWordInput, normalizeWordInput } =
      await vi.importMock('@/lib/word-dictionary');
    mockGetRandomWord = getRandomWord as ReturnType<typeof vi.fn>;
    mockIsValidWordInput = isValidWordInput as ReturnType<typeof vi.fn>;
    mockNormalizeWordInput = normalizeWordInput as ReturnType<typeof vi.fn>;

    const { matchWordToNATO } = await vi.importMock('@/lib/word-matching');
    mockMatchWordToNATO = matchWordToNATO as ReturnType<typeof vi.fn>;

    mockToast.mockClear();
    mockGetRandomWord.mockReturnValue({ word: 'CAT', difficulty: 'easy' });
    mockIsValidWordInput.mockImplementation((input: string) =>
      /^[a-z\d\s]+$/i.test(input)
    );
    mockNormalizeWordInput.mockImplementation((input: string) =>
      input.toUpperCase().trim()
    );
    mockMatchWordToNATO.mockReturnValue({
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

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with a random word', async () => {
      const { result } = renderHook(() => useWordQuiz());

      await waitFor(() => {
        expect(result.current.currentWord).toEqual({
          word: 'CAT',
          difficulty: 'easy',
        });
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

      // First let it initialize
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
        expect(result.current.currentWord).toEqual({
          word: 'HELLO',
          difficulty: 'easy',
        });
        expect(result.current.isCustomMode).toBe(true);
        expect(result.current.customWordInput).toBe('');
      });
    });

    it('should handle empty custom word input', async () => {
      const { result } = renderHook(() => useWordQuiz());

      await waitFor(() => {
        expect(result.current.currentWord).toBeTruthy();
      });

      // Try to use empty custom word
      act(() => {
        result.current.useCustomWord();
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Invalid Input',
        description: 'Please enter a word or phrase.',
        variant: 'destructive',
      });
    });

    it('should handle invalid characters in custom word', async () => {
      const { result } = renderHook(() => useWordQuiz());

      await waitFor(() => {
        expect(result.current.currentWord).toBeTruthy();
      });

      // Mock invalid input
      mockIsValidWordInput.mockReturnValueOnce(false);

      act(() => {
        result.current.setCustomWordInput('HELLO@#$');
      });

      act(() => {
        result.current.useCustomWord();
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Invalid Characters',
        description: 'Please use only letters, numbers, and spaces.',
        variant: 'destructive',
      });
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
        expect(result.current.isCompleted).toBe(true);
        expect(result.current.matchResult).toBeTruthy();
        expect(checkResult.percentage).toBe(100);
      });
    });

    it('should handle empty NATO input', async () => {
      const { result } = renderHook(() => useWordQuiz());

      await waitFor(() => {
        expect(result.current.currentWord).toBeTruthy();
      });

      // Try to check answer with empty input
      act(() => {
        result.current.checkAnswer();
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'No Input',
        description:
          'Please enter the NATO alphabet words for the current word.',
        variant: 'destructive',
      });
    });

    it('should handle partial correct answers', async () => {
      // Mock partial correct result
      mockMatchWordToNATO.mockReturnValueOnce({
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
          { letter: 'T', expected: 'Tango', actual: 'Wrong', isCorrect: false },
        ],
      });

      const { result } = renderHook(() => useWordQuiz());

      await waitFor(() => {
        expect(result.current.currentWord).toBeTruthy();
      });

      act(() => {
        result.current.setUserNATOInput('Charlie Alpha Wrong');
      });

      act(() => {
        result.current.checkAnswer();
      });

      await waitFor(() => {
        expect(result.current.showResult).toBe(true);
        expect(result.current.isCompleted).toBe(false); // Not 100% correct
        expect(result.current.matchResult?.percentage).toBe(67);
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

  describe('edge cases', () => {
    it('should handle whitespace-only custom input', async () => {
      const { result } = renderHook(() => useWordQuiz());

      await waitFor(() => {
        expect(result.current.currentWord).toBeTruthy();
      });

      act(() => {
        result.current.setCustomWordInput('   ');
      });

      act(() => {
        result.current.useCustomWord();
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Invalid Input',
        description: 'Please enter a word or phrase.',
        variant: 'destructive',
      });
    });

    it('should handle whitespace-only NATO input', async () => {
      const { result } = renderHook(() => useWordQuiz());

      await waitFor(() => {
        expect(result.current.currentWord).toBeTruthy();
      });

      act(() => {
        result.current.setUserNATOInput('   ');
      });

      act(() => {
        result.current.checkAnswer();
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'No Input',
        description:
          'Please enter the NATO alphabet words for the current word.',
        variant: 'destructive',
      });
    });

    it('should handle missing current word', async () => {
      const { result } = renderHook(() => useWordQuiz());

      // Manually set currentWord to null to test edge case
      act(() => {
        // @ts-expect-error - testing edge case
        result.current.currentWord = null;
        result.current.setUserNATOInput('Alpha Bravo');
      });

      act(() => {
        result.current.checkAnswer();
      });

      expect(mockToast).toHaveBeenCalledWith({
        title: 'No Input',
        description:
          'Please enter the NATO alphabet words for the current word.',
        variant: 'destructive',
      });
    });
  });
});
