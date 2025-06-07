import { describe, expect, it } from 'vitest';
import {
  formatAccuracy,
  formatProgress,
  formatQuestionCount,
  formatScore,
  formatTime,
} from '../formatters';

describe('formatters', () => {
  describe('formatTime', () => {
    it('should format seconds to MM:SS format', () => {
      expect(formatTime(0)).toBe('0:00');
      expect(formatTime(30)).toBe('0:30');
      expect(formatTime(60)).toBe('1:00');
      expect(formatTime(90)).toBe('1:30');
      expect(formatTime(3661)).toBe('61:01');
    });

    it('should handle edge cases', () => {
      expect(formatTime(-1)).toBe('-1:59');
      expect(formatTime(59)).toBe('0:59');
      expect(formatTime(3599)).toBe('59:59');
      expect(formatTime(3600)).toBe('60:00');
    });

    it('should pad seconds with leading zero', () => {
      expect(formatTime(5)).toBe('0:05');
      expect(formatTime(65)).toBe('1:05');
      expect(formatTime(125)).toBe('2:05');
    });
  });

  describe('formatQuestionCount', () => {
    it('should replace placeholders with actual values', () => {
      const template = 'Question {current} of {total}';

      expect(formatQuestionCount(1, 10, template)).toBe('Question 1 of 10');
      expect(formatQuestionCount(5, 15, template)).toBe('Question 5 of 15');
      expect(formatQuestionCount(10, 10, template)).toBe('Question 10 of 10');
    });

    it('should handle different template formats', () => {
      expect(formatQuestionCount(3, 8, '{current}/{total}')).toBe('3/8');
      expect(
        formatQuestionCount(2, 5, 'Item {current} from {total} total')
      ).toBe('Item 2 from 5 total');
      expect(formatQuestionCount(1, 1, 'Only {current} of {total}')).toBe(
        'Only 1 of 1'
      );
    });

    it('should handle edge cases', () => {
      expect(formatQuestionCount(0, 10, '{current} of {total}')).toBe(
        '0 of 10'
      );
      expect(formatQuestionCount(10, 0, '{current} of {total}')).toBe(
        '10 of 0'
      );
      expect(formatQuestionCount(-1, 5, '{current} of {total}')).toBe(
        '-1 of 5'
      );
    });

    it('should handle templates without placeholders', () => {
      expect(formatQuestionCount(5, 10, 'Static text')).toBe('Static text');
      expect(formatQuestionCount(1, 1, '')).toBe('');
    });
  });

  describe('formatAccuracy', () => {
    it('should calculate percentage correctly', () => {
      expect(formatAccuracy(8, 10)).toBe(80);
      expect(formatAccuracy(5, 5)).toBe(100);
      expect(formatAccuracy(3, 7)).toBe(43);
      expect(formatAccuracy(1, 3)).toBe(33);
    });

    it('should round to nearest integer', () => {
      expect(formatAccuracy(1, 3)).toBe(33); // 33.333... -> 33
      expect(formatAccuracy(2, 3)).toBe(67); // 66.666... -> 67
      expect(formatAccuracy(5, 6)).toBe(83); // 83.333... -> 83
    });

    it('should handle edge cases', () => {
      expect(formatAccuracy(0, 10)).toBe(0);
      expect(formatAccuracy(10, 10)).toBe(100);
      expect(formatAccuracy(0, 0)).toBe(0);
      expect(formatAccuracy(5, 0)).toBe(0);
    });

    it('should handle negative values gracefully', () => {
      expect(formatAccuracy(-1, 10)).toBe(-10);
      expect(formatAccuracy(5, -10)).toBe(-50);
    });
  });

  describe('formatProgress', () => {
    it('should calculate progress percentage', () => {
      expect(formatProgress(3, 10)).toBe(30);
      expect(formatProgress(0, 10)).toBe(0);
      expect(formatProgress(10, 10)).toBe(100);
      expect(formatProgress(5, 8)).toBe(62.5);
    });

    it('should adjust for showResult when true', () => {
      expect(formatProgress(3, 10, true)).toBe(40);
      expect(formatProgress(9, 10, true)).toBe(100);
      expect(formatProgress(0, 10, true)).toBe(10);
    });

    it('should not adjust when showResult is false', () => {
      expect(formatProgress(3, 10, false)).toBe(30);
      expect(formatProgress(9, 10, false)).toBe(90);
      expect(formatProgress(0, 10, false)).toBe(0);
    });

    it('should handle edge cases', () => {
      expect(formatProgress(0, 0)).toBe(Number.NaN);
      expect(formatProgress(5, 0)).toBe(Infinity);
      expect(formatProgress(-1, 10)).toBe(-10);
    });

    it('should handle decimal results', () => {
      expect(formatProgress(1, 3)).toBeCloseTo(33.333333333333336, 10);
      expect(formatProgress(2, 7)).toBeCloseTo(28.57142857142857, 10);
    });
  });

  describe('formatScore', () => {
    it('should return score string and percentage', () => {
      const result = formatScore(8, 10);

      expect(result.score).toBe('8 / 10');
      expect(result.percentage).toBe(80);
    });

    it('should handle perfect scores', () => {
      const result = formatScore(10, 10);

      expect(result.score).toBe('10 / 10');
      expect(result.percentage).toBe(100);
    });

    it('should handle zero scores', () => {
      const result = formatScore(0, 10);

      expect(result.score).toBe('0 / 10');
      expect(result.percentage).toBe(0);
    });

    it('should handle edge cases', () => {
      const resultZeroTotal = formatScore(5, 0);
      expect(resultZeroTotal.score).toBe('5 / 0');
      expect(resultZeroTotal.percentage).toBe(0);

      const resultNegative = formatScore(-1, 10);
      expect(resultNegative.score).toBe('-1 / 10');
      expect(resultNegative.percentage).toBe(-10);
    });

    it('should maintain consistent format', () => {
      const tests = [
        { correct: 0, total: 1 },
        { correct: 123, total: 456 },
        { correct: 1000, total: 2000 },
      ];

      tests.forEach(({ correct, total }) => {
        const result = formatScore(correct, total);
        expect(result.score).toMatch(/^\d+ \/ \d+$/);
        expect(typeof result.percentage).toBe('number');
      });
    });
  });

  describe('integration scenarios', () => {
    it('should work together for quiz completion scenario', () => {
      const timeSpent = 125; // 2:05
      const currentQuestion = 8;
      const totalQuestions = 10;
      const correctAnswers = 7;
      const template = 'Question {current} of {total}';

      expect(formatTime(timeSpent)).toBe('2:05');
      expect(
        formatQuestionCount(currentQuestion, totalQuestions, template)
      ).toBe('Question 8 of 10');
      expect(formatProgress(currentQuestion, totalQuestions, true)).toBe(90);
      expect(formatAccuracy(correctAnswers, currentQuestion)).toBe(88);

      const scoreResult = formatScore(correctAnswers, currentQuestion);
      expect(scoreResult.score).toBe('7 / 8');
      expect(scoreResult.percentage).toBe(88);
    });

    it('should handle quiz start scenario', () => {
      const timeSpent = 0;
      const currentQuestion = 0;
      const totalQuestions = 15;
      const correctAnswers = 0;

      expect(formatTime(timeSpent)).toBe('0:00');
      expect(formatProgress(currentQuestion, totalQuestions)).toBe(0);
      expect(formatAccuracy(correctAnswers, Math.max(1, currentQuestion))).toBe(
        0
      );
    });

    it('should handle quiz end scenario', () => {
      const timeSpent = 480; // 8:00
      const currentQuestion = 20;
      const totalQuestions = 20;
      const correctAnswers = 18;

      expect(formatTime(timeSpent)).toBe('8:00');
      expect(formatProgress(currentQuestion, totalQuestions)).toBe(100);
      expect(formatAccuracy(correctAnswers, currentQuestion)).toBe(90);

      const scoreResult = formatScore(correctAnswers, totalQuestions);
      expect(scoreResult.score).toBe('18 / 20');
      expect(scoreResult.percentage).toBe(90);
    });
  });

  describe('performance edge cases', () => {
    it('should handle large numbers efficiently', () => {
      const startTime = performance.now();

      for (let i = 0; i < 1000; i++) {
        formatTime(i * 3600 + i * 60 + i);
        formatAccuracy(i, 1000);
        formatProgress(i, 1000);
        formatScore(i, 1000);
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time (adjust threshold as needed)
      expect(duration).toBeLessThan(100);
    });

    it('should handle extreme values without errors', () => {
      expect(() => formatTime(Number.MAX_SAFE_INTEGER)).not.toThrow();
      expect(() => formatAccuracy(Number.MAX_SAFE_INTEGER, 1)).not.toThrow();
      expect(() => formatProgress(1, Number.MAX_SAFE_INTEGER)).not.toThrow();
      expect(() => formatScore(Number.MAX_SAFE_INTEGER, 1)).not.toThrow();
    });
  });
});
