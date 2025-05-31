import { beforeEach, describe, expect, it } from 'vitest';
import {
  getAppSettings,
  getUserProgressLocal,
  getUserStats,
  updateAppSettings,
  updateUserProgressLocal,
  updateUserStats,
} from '../storage';

describe('storage Functions', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  describe('getUserStats', () => {
    it('should return default stats when none exist', () => {
      const stats = getUserStats();
      expect(stats).toEqual({
        currentStreak: 0,
        totalSessions: 0,
        correctAnswers: 0,
        totalAnswers: 0,
      });
    });

    it('should return stored stats', () => {
      const testStats = {
        currentStreak: 5,
        totalSessions: 10,
        correctAnswers: 80,
        totalAnswers: 100,
        lastSessionDate: '2024-01-01',
      };
      localStorage.setItem('userStats', JSON.stringify(testStats));

      const stats = getUserStats();
      expect(stats).toEqual(testStats);
    });

    it('should handle corrupted data gracefully', () => {
      localStorage.setItem('userStats', 'invalid json');
      const stats = getUserStats();
      expect(stats).toEqual({
        currentStreak: 0,
        totalSessions: 0,
        correctAnswers: 0,
        totalAnswers: 0,
      });
    });
  });

  describe('updateUserStats', () => {
    it('should update existing stats', () => {
      const initialStats = {
        currentStreak: 3,
        totalSessions: 5,
        correctAnswers: 40,
        totalAnswers: 50,
      };
      localStorage.setItem('userStats', JSON.stringify(initialStats));

      const updatedStats = updateUserStats({
        currentStreak: 4,
        correctAnswers: 50,
      });

      expect(updatedStats.currentStreak).toBe(4);
      expect(updatedStats.correctAnswers).toBe(50);
      expect(updatedStats.totalSessions).toBe(5); // Unchanged
      expect(updatedStats.totalAnswers).toBe(50); // Unchanged
    });

    it('should create stats if none exist', () => {
      const updatedStats = updateUserStats({
        currentStreak: 1,
        totalSessions: 1,
      });

      expect(updatedStats.currentStreak).toBe(1);
      expect(updatedStats.totalSessions).toBe(1);
      expect(updatedStats.correctAnswers).toBe(0);
      expect(updatedStats.totalAnswers).toBe(0);
    });

    it('should persist changes to localStorage', () => {
      updateUserStats({ currentStreak: 10 });

      const storedData = localStorage.getItem('userStats');
      expect(storedData).toBeTruthy();

      const parsedData = JSON.parse(storedData!);
      expect(parsedData.currentStreak).toBe(10);
    });
  });

  describe('getUserProgressLocal', () => {
    it('should return empty array when no progress exists', () => {
      const progress = getUserProgressLocal();
      expect(progress).toEqual([]);
    });

    it('should return stored progress', () => {
      const testProgress = [
        {
          letter: 'A',
          correctCount: 5,
          incorrectCount: 1,
          lastReview: '2024-01-01T00:00:00.000Z',
          nextReview: '2024-01-02T00:00:00.000Z',
          difficulty: 3,
        },
      ];
      localStorage.setItem('userProgress', JSON.stringify(testProgress));

      const progress = getUserProgressLocal();
      expect(progress).toEqual(testProgress);
    });

    it('should handle corrupted progress data', () => {
      localStorage.setItem('userProgress', 'invalid json');
      const progress = getUserProgressLocal();
      expect(progress).toEqual([]);
    });
  });

  describe('updateUserProgressLocal', () => {
    it('should create new progress entry for new letter', () => {
      const progress = updateUserProgressLocal('A', true);

      expect(progress.letter).toBe('A');
      expect(progress.correctCount).toBe(1);
      expect(progress.incorrectCount).toBe(0);
      expect(progress.difficulty).toBeGreaterThan(1);
    });

    it('should update existing progress entry', () => {
      // Create initial progress
      updateUserProgressLocal('A', true);

      // Update with incorrect answer
      const updatedProgress = updateUserProgressLocal('A', false);

      expect(updatedProgress.letter).toBe('A');
      expect(updatedProgress.correctCount).toBe(1);
      expect(updatedProgress.incorrectCount).toBe(1);
    });

    it('should update difficulty based on answer correctness', () => {
      const correctProgress = updateUserProgressLocal('A', true);
      const initialDifficulty = correctProgress.difficulty;

      const moreCorrectProgress = updateUserProgressLocal('A', true);
      expect(moreCorrectProgress.difficulty).toBeGreaterThan(initialDifficulty);

      const incorrectProgress = updateUserProgressLocal('A', false);
      expect(incorrectProgress.difficulty).toBeLessThan(
        moreCorrectProgress.difficulty
      );
    });

    it('should update review dates', () => {
      const progress = updateUserProgressLocal('A', true);

      expect(new Date(progress.lastReview)).toBeInstanceOf(Date);
      expect(new Date(progress.nextReview)).toBeInstanceOf(Date);
      expect(new Date(progress.nextReview).getTime()).toBeGreaterThan(
        new Date(progress.lastReview).getTime()
      );
    });

    it('should persist changes to localStorage', () => {
      updateUserProgressLocal('A', true);
      updateUserProgressLocal('B', false);

      const storedData = localStorage.getItem('userProgress');
      expect(storedData).toBeTruthy();

      const parsedData = JSON.parse(storedData!);
      expect(parsedData).toHaveLength(2);
      expect(parsedData.find((p: any) => p.letter === 'A')).toBeTruthy();
      expect(parsedData.find((p: any) => p.letter === 'B')).toBeTruthy();
    });
  });

  describe('getAppSettings', () => {
    it('should return default settings when none exist', () => {
      const settings = getAppSettings();
      expect(settings).toEqual({
        ttsVoice: 'female',
        notificationsEnabled: false,
        language: 'en',
      });
    });

    it('should return stored settings', () => {
      const testSettings = {
        ttsVoice: 'male' as const,
        notificationsEnabled: true,
        language: 'es',
      };
      localStorage.setItem('appSettings', JSON.stringify(testSettings));

      const settings = getAppSettings();
      expect(settings).toEqual(testSettings);
    });

    it('should handle corrupted settings data', () => {
      localStorage.setItem('appSettings', 'invalid json');
      const settings = getAppSettings();
      expect(settings).toEqual({
        ttsVoice: 'female',
        notificationsEnabled: false,
        language: 'en',
      });
    });

    it('should handle partial settings', () => {
      const partialSettings = { ttsVoice: 'robot' };
      localStorage.setItem('appSettings', JSON.stringify(partialSettings));

      const settings = getAppSettings();
      expect(settings.ttsVoice).toBe('robot');
      expect(settings.notificationsEnabled).toBe(false); // Default
      expect(settings.language).toBe('en'); // Default
    });
  });

  describe('updateAppSettings', () => {
    it('should update specific settings', () => {
      updateAppSettings({ ttsVoice: 'male' });

      const settings = getAppSettings();
      expect(settings.ttsVoice).toBe('male');
      expect(settings.notificationsEnabled).toBe(false); // Default unchanged
      expect(settings.language).toBe('en'); // Default unchanged
    });

    it('should update multiple settings', () => {
      updateAppSettings({
        ttsVoice: 'robot',
        notificationsEnabled: true,
        language: 'fr',
      });

      const settings = getAppSettings();
      expect(settings.ttsVoice).toBe('robot');
      expect(settings.notificationsEnabled).toBe(true);
      expect(settings.language).toBe('fr');
    });

    it('should preserve existing settings when updating partial', () => {
      // Set initial settings
      updateAppSettings({
        ttsVoice: 'male',
        notificationsEnabled: true,
        language: 'es',
      });

      // Update only one setting
      updateAppSettings({ language: 'fr' });

      const settings = getAppSettings();
      expect(settings.ttsVoice).toBe('male'); // Preserved
      expect(settings.notificationsEnabled).toBe(true); // Preserved
      expect(settings.language).toBe('fr'); // Updated
    });

    it('should persist changes to localStorage', () => {
      updateAppSettings({ ttsVoice: 'robot' });

      const storedData = localStorage.getItem('appSettings');
      expect(storedData).toBeTruthy();

      const parsedData = JSON.parse(storedData!);
      expect(parsedData.ttsVoice).toBe('robot');
    });
  });
});
