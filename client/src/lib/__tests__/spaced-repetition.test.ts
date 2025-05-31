import { beforeEach, describe, expect, it } from 'vitest';
import {
  calculateNextReviewDate,
  checkAnswerVariants,
  generateQuizQuestion,
  generateQuizSet,
  getHintForLetter,
  getProgressStats,
  selectLetterForReview,
  updateDifficulty,
} from '../spaced-repetition';
// Mock UserProgress type for testing
interface UserProgress {
  id: number;
  userId: string;
  letter: string;
  correctCount: number;
  incorrectCount: number;
  lastReviewed: Date;
  nextReview: Date;
  difficulty: number;
  createdAt: Date;
  updatedAt: Date;
}

describe('spaced Repetition Functions', () => {
  describe('calculateNextReviewDate', () => {
    it('should increase interval for correct answers', () => {
      const now = new Date();
      const nextReview = calculateNextReviewDate(1, true);
      expect(nextReview.getTime()).toBeGreaterThan(now.getTime());
    });

    it('should decrease interval for incorrect answers', () => {
      const nextReview = calculateNextReviewDate(5, false);
      const shortInterval = calculateNextReviewDate(1, false);
      expect(nextReview.getTime()).toBeLessThan(
        shortInterval.getTime() + 24 * 60 * 60 * 1000
      );
    });

    it('should handle minimum difficulty correctly', () => {
      const nextReview = calculateNextReviewDate(1, false);
      expect(nextReview).toBeInstanceOf(Date);
    });

    it('should handle maximum difficulty correctly', () => {
      const nextReview = calculateNextReviewDate(10, true);
      expect(nextReview).toBeInstanceOf(Date);
    });
  });

  describe('updateDifficulty', () => {
    it('should increase difficulty for correct answers', () => {
      expect(updateDifficulty(3, true)).toBeGreaterThan(3);
    });

    it('should decrease difficulty for incorrect answers', () => {
      expect(updateDifficulty(3, false)).toBeLessThan(3);
    });

    it('should not go below minimum difficulty', () => {
      expect(updateDifficulty(1, false)).toBeGreaterThanOrEqual(1);
    });

    it('should not exceed maximum difficulty', () => {
      expect(updateDifficulty(10, true)).toBeLessThanOrEqual(10);
    });

    it('should handle edge cases', () => {
      expect(updateDifficulty(1, true)).toBeGreaterThan(1);
      expect(updateDifficulty(10, false)).toBeLessThan(10);
    });
  });

  describe('selectLetterForReview', () => {
    let mockProgress: UserProgress[];

    beforeEach(() => {
      mockProgress = [
        {
          id: 1,
          userId: 'test',
          letter: 'A',
          correctCount: 5,
          incorrectCount: 1,
          lastReviewed: new Date('2024-01-01'),
          nextReview: new Date('2024-01-02'),
          difficulty: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          userId: 'test',
          letter: 'B',
          correctCount: 2,
          incorrectCount: 3,
          lastReviewed: new Date('2024-01-01'),
          nextReview: new Date('2024-01-03'),
          difficulty: 2,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
    });

    it('should return a valid letter', () => {
      const letter = selectLetterForReview(mockProgress);
      expect(letter).toMatch(/[A-Z]/);
      expect(letter).toHaveLength(1);
    });

    it('should prioritize letters due for review', () => {
      const pastDue = {
        id: 3,
        userId: 'test',
        letter: 'C',
        correctCount: 0,
        incorrectCount: 5,
        lastReviewed: new Date('2024-01-01'),
        nextReview: new Date('2023-12-31'), // Past due
        difficulty: 5, // Higher difficulty to ensure priority
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      mockProgress.push(pastDue);

      // Should often select the past due letter
      const selections = new Set();
      for (let i = 0; i < 10; i++) {
        selections.add(selectLetterForReview(mockProgress));
      }
      expect(selections.has('C')).toBe(true);
    });

    it('should handle empty progress array', () => {
      const letter = selectLetterForReview([]);
      expect(letter).toMatch(/[A-Z]/);
    });
  });

  describe('checkAnswerVariants', () => {
    it('should accept exact matches', () => {
      expect(checkAnswerVariants('alpha', 'Alpha')).toBe(true);
      expect(checkAnswerVariants('Alpha', 'Alpha')).toBe(true);
    });

    it('should be case insensitive', () => {
      expect(checkAnswerVariants('ALPHA', 'Alpha')).toBe(true);
      expect(checkAnswerVariants('alpha', 'ALPHA')).toBe(true);
    });

    it('should accept common variants', () => {
      expect(checkAnswerVariants('whisky', 'Whiskey')).toBe(true);
      expect(checkAnswerVariants('whiskey', 'Whiskey')).toBe(true);
    });

    it('should reject incorrect answers', () => {
      expect(checkAnswerVariants('bravo', 'Alpha')).toBe(false);
      expect(checkAnswerVariants('wrong', 'Charlie')).toBe(false);
    });

    it('should handle partial matches', () => {
      expect(checkAnswerVariants('alph', 'Alpha')).toBe(false);
      expect(checkAnswerVariants('al', 'Alpha')).toBe(false);
    });

    it('should handle empty strings', () => {
      expect(checkAnswerVariants('', 'Alpha')).toBe(false);
      expect(checkAnswerVariants('alpha', '')).toBe(false);
    });
  });

  describe('getHintForLetter', () => {
    it('should return hints for valid letters', () => {
      const hint = getHintForLetter('A');
      expect(hint).toBeTruthy();
      expect(typeof hint).toBe('string');
    });

    it('should use custom hints when provided', () => {
      const customHints = { A: 'Custom hint for A' };
      const hint = getHintForLetter('A', customHints);
      expect(hint).toBe('Custom hint for A');
    });

    it('should fallback to default hints', () => {
      const hint = getHintForLetter('A', {});
      expect(hint).toBeTruthy();
      expect(hint).not.toBe('Custom hint for A');
    });

    it('should handle lowercase letters', () => {
      const hint = getHintForLetter('a');
      expect(hint).toBeTruthy();
    });

    it('should handle invalid letters gracefully', () => {
      const hint = getHintForLetter('1');
      expect(hint).toBeTruthy(); // Should return some default
    });
  });

  describe('generateQuizQuestion', () => {
    let mockProgress: UserProgress[];

    beforeEach(() => {
      mockProgress = [
        {
          id: 1,
          userId: 'test',
          letter: 'A',
          correctCount: 5,
          incorrectCount: 1,
          lastReviewed: new Date('2024-01-01'),
          nextReview: new Date('2024-01-02'),
          difficulty: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
    });

    it('should generate a valid question', () => {
      const question = generateQuizQuestion(mockProgress);
      expect(question.letter).toMatch(/[A-Z]/);
      expect(question.correctAnswer).toBeTruthy();
      expect(typeof question.correctAnswer).toBe('string');
    });

    it('should have matching letter and answer', () => {
      const question = generateQuizQuestion(mockProgress);
      const expectedAnswer = {
        A: 'Alpha',
        B: 'Bravo',
        C: 'Charlie',
        D: 'Delta',
        E: 'Echo',
        F: 'Foxtrot',
        G: 'Golf',
        H: 'Hotel',
      }[question.letter];

      if (expectedAnswer) {
        expect(question.correctAnswer).toBe(expectedAnswer);
      }
    });
  });

  describe('generateQuizSet', () => {
    let mockProgress: UserProgress[];

    beforeEach(() => {
      mockProgress = Array.from({ length: 5 }, (_, i) => ({
        id: i + 1,
        userId: 'test',
        letter: String.fromCharCode(65 + i), // A, B, C, D, E
        correctCount: 3,
        incorrectCount: 1,
        lastReviewed: new Date('2024-01-01'),
        nextReview: new Date('2024-01-02'),
        difficulty: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
    });

    it('should generate default number of questions', () => {
      const quizSet = generateQuizSet(mockProgress);
      expect(quizSet.questions).toHaveLength(10);
    });

    it('should generate custom number of questions', () => {
      const quizSet = generateQuizSet(mockProgress, 5);
      expect(quizSet.questions).toHaveLength(5);
    });

    it('should have unique ID', () => {
      const set1 = generateQuizSet(mockProgress);
      const set2 = generateQuizSet(mockProgress);
      expect(set1.id).not.toBe(set2.id);
    });

    it('should have valid questions', () => {
      const quizSet = generateQuizSet(mockProgress);
      quizSet.questions.forEach((question) => {
        expect(question.letter).toMatch(/[A-Z]/);
        expect(question.correctAnswer).toBeTruthy();
      });
    });

    it('should handle empty progress', () => {
      const quizSet = generateQuizSet([]);
      expect(quizSet.questions).toHaveLength(10);
    });
  });

  describe('getProgressStats', () => {
    let mockProgress: UserProgress[];

    beforeEach(() => {
      mockProgress = [
        // High accuracy letter
        {
          id: 1,
          userId: 'test',
          letter: 'A',
          correctCount: 9,
          incorrectCount: 1,
          lastReviewed: new Date(),
          nextReview: new Date(),
          difficulty: 5,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        // Medium accuracy letter
        {
          id: 2,
          userId: 'test',
          letter: 'B',
          correctCount: 6,
          incorrectCount: 4,
          lastReviewed: new Date(),
          nextReview: new Date(),
          difficulty: 3,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        // Low accuracy letter
        {
          id: 3,
          userId: 'test',
          letter: 'C',
          correctCount: 2,
          incorrectCount: 8,
          lastReviewed: new Date(),
          nextReview: new Date(),
          difficulty: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        // No attempts letter
        {
          id: 4,
          userId: 'test',
          letter: 'D',
          correctCount: 0,
          incorrectCount: 0,
          lastReviewed: new Date(),
          nextReview: new Date(),
          difficulty: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
    });

    it('should calculate correct statistics', () => {
      const stats = getProgressStats(mockProgress);
      expect(stats.totalAnswers).toBe(30); // 10 + 10 + 10 + 0
      expect(stats.correctAnswers).toBe(17); // 9 + 6 + 2 + 0
    });

    it('should calculate accuracy correctly', () => {
      const stats = getProgressStats(mockProgress);
      const expectedAccuracy = Math.round((17 / 30) * 100);
      expect(stats.accuracy).toBe(expectedAccuracy);
    });

    it('should handle empty progress', () => {
      const stats = getProgressStats([]);
      expect(stats.totalAnswers).toBe(0);
      expect(stats.correctAnswers).toBe(0);
      expect(stats.accuracy).toBe(0);
    });

    it('should handle zero total answers', () => {
      const emptyProgress = [
        {
          id: 1,
          userId: 'test',
          letter: 'A',
          correctCount: 0,
          incorrectCount: 0,
          lastReviewed: new Date(),
          nextReview: new Date(),
          difficulty: 1,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];
      const stats = getProgressStats(emptyProgress);
      expect(stats.accuracy).toBe(0);
    });
  });
});
