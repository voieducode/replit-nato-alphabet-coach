import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { addQuizTime, getUserStats, updateUserStats } from '../storage';

describe('quiz timer storage functions', () => {
  beforeEach(() => {
    localStorage.clear();
    // Reset time to a fixed value for consistent date testing
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-01-01T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initialization', () => {
    it('should include quizTimer in default stats', () => {
      const stats = getUserStats();
      expect(stats.quizTimer).toBeDefined();
      expect(stats.quizTimer).toEqual({
        bestTime: Infinity,
        lastFiveTimes: [],
      });
    });

    it('should preserve existing stats when initializing quizTimer', () => {
      // Set up stats without quizTimer
      localStorage.setItem(
        'userStats',
        JSON.stringify({
          currentStreak: 5,
          totalSessions: 10,
          correctAnswers: 80,
          totalAnswers: 100,
        })
      );

      const stats = getUserStats();
      expect(stats.currentStreak).toBe(5);
      expect(stats.quizTimer).toBeDefined();
      expect(stats.quizTimer.lastFiveTimes).toEqual([]);
    });
  });

  describe('addQuizTime', () => {
    it('should add a new quiz time for perfect score', () => {
      const time = 120; // 2 minutes
      addQuizTime(time, 10, 10); // Perfect score

      const stats = getUserStats();
      expect(stats.quizTimer.lastFiveTimes).toHaveLength(1);
      expect(stats.quizTimer.lastFiveTimes[0].time).toBe(time);
      expect(stats.quizTimer.bestTime).toBe(time);
    });

    it('should not add quiz time for imperfect score', () => {
      const time = 120;
      addQuizTime(time, 9, 10); // Imperfect score

      const stats = getUserStats();
      expect(stats.quizTimer.lastFiveTimes).toHaveLength(0);
      expect(stats.quizTimer.bestTime).toBe(Infinity);
    });

    it('should not add quiz time for zero score', () => {
      const time = 120;
      addQuizTime(time, 0, 10); // Zero score

      const stats = getUserStats();
      expect(stats.quizTimer.lastFiveTimes).toHaveLength(0);
      expect(stats.quizTimer.bestTime).toBe(Infinity);
    });

    it('should only store timing for perfect scores (comprehensive test)', () => {
      // Test various imperfect scores - none should be stored
      addQuizTime(100, 9, 10); // 9/10
      addQuizTime(110, 8, 10); // 8/10
      addQuizTime(120, 5, 10); // 5/10
      addQuizTime(130, 1, 10); // 1/10
      addQuizTime(140, 0, 10); // 0/10

      let stats = getUserStats();
      expect(stats.quizTimer.lastFiveTimes).toHaveLength(0);
      expect(stats.quizTimer.bestTime).toBe(Infinity);

      // Now add perfect scores - these should be stored
      addQuizTime(200, 10, 10); // Perfect score
      addQuizTime(150, 10, 10); // Perfect score (better time)

      stats = getUserStats();
      expect(stats.quizTimer.lastFiveTimes).toHaveLength(2);
      expect(stats.quizTimer.bestTime).toBe(150);
      expect(stats.quizTimer.lastFiveTimes[0].time).toBe(200);
      expect(stats.quizTimer.lastFiveTimes[1].time).toBe(150);

      // Add another imperfect score - should not be stored
      addQuizTime(90, 9, 10); // 9/10 (would be best time if stored)

      stats = getUserStats();
      expect(stats.quizTimer.lastFiveTimes).toHaveLength(2); // Still only 2
      expect(stats.quizTimer.bestTime).toBe(150); // Best time unchanged
    });

    it('should update best time when better time is achieved', () => {
      // Add initial time
      addQuizTime(200, 10, 10);
      // Add better time
      addQuizTime(150, 10, 10);

      const stats = getUserStats();
      expect(stats.quizTimer.bestTime).toBe(150);
      expect(stats.quizTimer.lastFiveTimes).toHaveLength(2);
      expect(stats.quizTimer.lastFiveTimes[1].time).toBe(150);
    });

    it('should not update best time when worse time is achieved', () => {
      addQuizTime(100, 10, 10);
      addQuizTime(150, 10, 10);

      const stats = getUserStats();
      expect(stats.quizTimer.bestTime).toBe(100);
    });

    it('should maintain only the last 5 times', () => {
      const times = [100, 120, 130, 140, 150, 160];
      times.forEach((t) => addQuizTime(t, 10, 10));

      const stats = getUserStats();
      expect(stats.quizTimer.lastFiveTimes).toHaveLength(5);
      // First time should be dropped
      expect(stats.quizTimer.lastFiveTimes[0].time).toBe(120);
      expect(stats.quizTimer.lastFiveTimes[4].time).toBe(160);
    });
  });

  describe('timer data persistence', () => {
    it('should store timestamps with times', () => {
      addQuizTime(100, 10, 10);

      const stats = getUserStats();
      const storedTime = stats.quizTimer.lastFiveTimes[0];
      expect(storedTime.date).toBe('2025-01-01T12:00:00.000Z');
      expect(new Date(storedTime.date)).toBeInstanceOf(Date);
    });

    it('should handle missing quizTimer property gracefully', () => {
      // Set up stats without quizTimer
      localStorage.setItem(
        'userStats',
        JSON.stringify({
          currentStreak: 0,
          totalSessions: 0,
          correctAnswers: 0,
          totalAnswers: 0,
        })
      );

      expect(() => addQuizTime(100, 10, 10)).not.toThrow();
      const stats = getUserStats();
      expect(stats.quizTimer.lastFiveTimes).toHaveLength(1);
      expect(stats.quizTimer.bestTime).toBe(100);
    });

    it('should persist timer data in localStorage', () => {
      addQuizTime(100, 10, 10);

      const rawData = localStorage.getItem('userStats');
      expect(rawData).toBeTruthy();

      const parsedData = JSON.parse(rawData!);
      expect(parsedData.quizTimer).toBeDefined();
      expect(parsedData.quizTimer.bestTime).toBe(100);
      expect(parsedData.quizTimer.lastFiveTimes).toHaveLength(1);
    });

    it('should handle direct timer updates through updateUserStats', () => {
      const newTime = { time: 100, date: new Date().toISOString() };
      updateUserStats({
        quizTimer: {
          bestTime: 100,
          lastFiveTimes: [newTime],
        },
      });

      const stats = getUserStats();
      expect(stats.quizTimer.bestTime).toBe(100);
      expect(stats.quizTimer.lastFiveTimes).toHaveLength(1);
      expect(stats.quizTimer.lastFiveTimes[0]).toEqual(newTime);
    });

    it('should merge new timer data with existing data', () => {
      // Add initial time
      addQuizTime(100, 10, 10);

      // Update with new data
      const newTime = { time: 90, date: new Date().toISOString() };
      updateUserStats({
        quizTimer: {
          bestTime: 90,
          lastFiveTimes: [newTime],
        },
      });

      const stats = getUserStats();
      expect(stats.quizTimer.bestTime).toBe(90);
      expect(stats.quizTimer.lastFiveTimes).toHaveLength(2);
      expect(stats.quizTimer.lastFiveTimes[1]).toEqual(newTime);
    });
  });
});
