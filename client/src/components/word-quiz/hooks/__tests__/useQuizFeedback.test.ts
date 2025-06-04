import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useQuizFeedback } from '../useQuizFeedback';

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}));

describe('useQuizFeedback', () => {
  let mockToast: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Get the mocked function
    const { useToast } = await vi.importMock('@/hooks/use-toast');
    const mockUseToast = useToast as () => { toast: ReturnType<typeof vi.fn> };
    mockToast = mockUseToast().toast;
    mockToast.mockClear();
  });

  describe('showResultFeedback', () => {
    it('should show perfect feedback for 100% score', () => {
      const { result } = renderHook(() => useQuizFeedback());

      const mockResult = {
        score: 5,
        percentage: 100,
        correctCount: 5,
        totalCount: 5,
        matches: [],
      };

      result.current.showResultFeedback(mockResult);

      expect(mockToast).toHaveBeenCalledWith({
        title: '🎉 Perfect!',
        description: 'All NATO words are correct!',
      });
    });

    it('should show great job feedback for scores 80-99%', () => {
      const { result } = renderHook(() => useQuizFeedback());

      const mockResult = {
        score: 4,
        percentage: 85,
        correctCount: 4,
        totalCount: 5,
        matches: [],
      };

      result.current.showResultFeedback(mockResult);

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Great Job!',
        description: '85% correct. Excellent work!',
      });
    });

    it('should show great job feedback for exactly 80%', () => {
      const { result } = renderHook(() => useQuizFeedback());

      const mockResult = {
        score: 4,
        percentage: 80,
        correctCount: 4,
        totalCount: 5,
        matches: [],
      };

      result.current.showResultFeedback(mockResult);

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Great Job!',
        description: '80% correct. Excellent work!',
      });
    });

    it('should show good effort feedback for scores 50-79%', () => {
      const { result } = renderHook(() => useQuizFeedback());

      const mockResult = {
        score: 3,
        percentage: 65,
        correctCount: 3,
        totalCount: 5,
        matches: [],
      };

      result.current.showResultFeedback(mockResult);

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Good Effort!',
        description: '65% correct. Keep practicing!',
      });
    });

    it('should show good effort feedback for exactly 50%', () => {
      const { result } = renderHook(() => useQuizFeedback());

      const mockResult = {
        score: 2,
        percentage: 50,
        correctCount: 2,
        totalCount: 4,
        matches: [],
      };

      result.current.showResultFeedback(mockResult);

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Good Effort!',
        description: '50% correct. Keep practicing!',
      });
    });

    it('should show keep practicing feedback for scores below 50%', () => {
      const { result } = renderHook(() => useQuizFeedback());

      const mockResult = {
        score: 1,
        percentage: 25,
        correctCount: 1,
        totalCount: 4,
        matches: [],
      };

      result.current.showResultFeedback(mockResult);

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Keep Practicing!',
        description: "25% correct. You'll get better with practice!",
      });
    });

    it('should show keep practicing feedback for 0% score', () => {
      const { result } = renderHook(() => useQuizFeedback());

      const mockResult = {
        score: 0,
        percentage: 0,
        correctCount: 0,
        totalCount: 5,
        matches: [],
      };

      result.current.showResultFeedback(mockResult);

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Keep Practicing!',
        description: "0% correct. You'll get better with practice!",
      });
    });

    it('should handle boundary case just below 80%', () => {
      const { result } = renderHook(() => useQuizFeedback());

      const mockResult = {
        score: 3,
        percentage: 79,
        correctCount: 3,
        totalCount: 4,
        matches: [],
      };

      result.current.showResultFeedback(mockResult);

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Good Effort!',
        description: '79% correct. Keep practicing!',
      });
    });

    it('should handle boundary case just below 50%', () => {
      const { result } = renderHook(() => useQuizFeedback());

      const mockResult = {
        score: 2,
        percentage: 49,
        correctCount: 2,
        totalCount: 5,
        matches: [],
      };

      result.current.showResultFeedback(mockResult);

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Keep Practicing!',
        description: "49% correct. You'll get better with practice!",
      });
    });

    it('should handle edge case with very high percentage just below 100%', () => {
      const { result } = renderHook(() => useQuizFeedback());

      const mockResult = {
        score: 9,
        percentage: 99,
        correctCount: 9,
        totalCount: 10,
        matches: [],
      };

      result.current.showResultFeedback(mockResult);

      expect(mockToast).toHaveBeenCalledWith({
        title: 'Great Job!',
        description: '99% correct. Excellent work!',
      });
    });
  });
});
