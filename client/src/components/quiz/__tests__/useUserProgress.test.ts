import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  getUserProgressLocal,
  updateUserProgressLocal,
} from '../../../../src/lib/storage';
import { useUserProgress } from '../useUserProgress';

// Mock the storage module
vi.mock('@/lib/storage', () => ({
  getUserProgressLocal: vi.fn(),
  updateUserProgressLocal: vi.fn(),
}));

describe('useUserProgress', () => {
  const userId = 'test-user-123';
  const initialProgress = [
    {
      letter: 'A',
      correctCount: 5,
      incorrectCount: 2,
      lastReview: '2023-05-01',
      nextReview: '2023-05-10',
      difficulty: 0.3,
    },
    {
      letter: 'B',
      correctCount: 3,
      incorrectCount: 1,
      lastReview: '2023-05-02',
      nextReview: '2023-05-09',
      difficulty: 0.4,
    },
  ];

  beforeEach(() => {
    vi.resetAllMocks();
    (getUserProgressLocal as any).mockReturnValue(initialProgress);
  });

  it('loads user progress on init', () => {
    const { result } = renderHook(() => useUserProgress(userId));
    expect(getUserProgressLocal).toHaveBeenCalled();
    expect(result.current.userProgress.length).toBe(2);
    expect(result.current.userProgress[0].letter).toBe('A');
    expect(result.current.userProgress[1].letter).toBe('B');
  });

  it('updates user progress', () => {
    const updatedA = {
      letter: 'A',
      correctCount: 6,
      incorrectCount: 2,
      lastReview: '2023-05-03',
      nextReview: '2023-05-12',
      difficulty: 0.25,
    };

    const updatedB = {
      letter: 'B',
      correctCount: 3,
      incorrectCount: 2,
      lastReview: '2023-05-03',
      nextReview: '2023-05-08',
      difficulty: 0.45,
    };

    (updateUserProgressLocal as any)
      .mockReturnValueOnce(updatedA)
      .mockReturnValueOnce(updatedB);

    const { result } = renderHook(() => useUserProgress(userId));

    act(() => {
      result.current.updateProgress('A', true);
    });

    expect(updateUserProgressLocal).toHaveBeenCalledWith('A', true);

    act(() => {
      result.current.updateProgress('B', false);
    });

    expect(updateUserProgressLocal).toHaveBeenCalledWith('B', false);
  });

  it('adds new letter if not found', () => {
    const newLetter = {
      letter: 'C',
      correctCount: 1,
      incorrectCount: 0,
      lastReview: '2023-05-03',
      nextReview: '2023-05-13',
      difficulty: 0.3,
    };

    (updateUserProgressLocal as any).mockReturnValue(newLetter);

    const { result } = renderHook(() => useUserProgress(userId));

    act(() => {
      result.current.updateProgress('C', true);
    });

    expect(updateUserProgressLocal).toHaveBeenCalledWith('C', true);
  });
});
