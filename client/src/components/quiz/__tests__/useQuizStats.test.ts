import { describe, expect, it } from 'vitest';
import { quizStats } from '../useQuizStats';

describe('quizStats', () => {
  it('calculates stats and progress correctly', () => {
    const userProgress = [
      { letter: 'A', correctCount: 8, incorrectCount: 2 },
      { letter: 'B', correctCount: 2, incorrectCount: 8 },
      { letter: 'C', correctCount: 5, incorrectCount: 5 },
    ];
    const localStats = {
      totalSessions: 3,
      totalAnswers: 20,
      correctAnswers: 15,
    };
    const sessionResults = [
      { isCorrect: true },
      { isCorrect: false },
      { isCorrect: true },
    ];
    const result = quizStats(userProgress, localStats, sessionResults);
    expect(result.totalSessions).toBe(3);
    expect(result.averageScore).toBe(75);
    expect(result.letterProgress.length).toBe(3);
    expect(result.progressStats).toEqual({
      learning: 1,
      review: 1,
      mastered: 1,
    });
    expect(result.correctAnswersCount).toBe(2);
  });
});
