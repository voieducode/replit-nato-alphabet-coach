// Local storage utilities for persisting user data

export interface UserStats {
  currentStreak: number;
  totalSessions: number;
  correctAnswers: number;
  totalAnswers: number;
  lastSessionDate?: string;
}

export interface LocalUserProgress {
  letter: string;
  correctCount: number;
  incorrectCount: number;
  lastReview: string;
  nextReview: string;
  difficulty: number;
}

const STORAGE_KEYS = {
  USER_STATS: "userStats",
  USER_PROGRESS: "userProgress",
  SETTINGS: "appSettings",
} as const;

// Stats management
export function getUserStats(): UserStats {
  const stored = localStorage.getItem(STORAGE_KEYS.USER_STATS);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.warn("Failed to parse stored stats");
    }
  }
  return {
    currentStreak: 0,
    totalSessions: 0,
    correctAnswers: 0,
    totalAnswers: 0,
  };
}

export function updateUserStats(stats: Partial<UserStats>): UserStats {
  const current = getUserStats();
  const updated = { ...current, ...stats };
  localStorage.setItem(STORAGE_KEYS.USER_STATS, JSON.stringify(updated));
  return updated;
}

// Progress management
export function getUserProgressLocal(): LocalUserProgress[] {
  const stored = localStorage.getItem(STORAGE_KEYS.USER_PROGRESS);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.warn("Failed to parse stored progress");
    }
  }
  return [];
}

export function updateUserProgressLocal(
  letter: string,
  isCorrect: boolean
): LocalUserProgress {
  const progress = getUserProgressLocal();
  const existing = progress.find((p) => p.letter === letter);

  const now = new Date().toISOString();
  const nextReview = new Date(
    Date.now() + (isCorrect ? 24 * 60 * 60 * 1000 : 4 * 60 * 60 * 1000)
  ).toISOString();

  if (existing) {
    if (isCorrect) {
      existing.correctCount++;
      existing.difficulty = Math.min(5, existing.difficulty + 1);
    } else {
      existing.incorrectCount++;
      existing.difficulty = Math.max(1, existing.difficulty - 1);
    }
    existing.lastReview = now;
    existing.nextReview = nextReview;
  } else {
    progress.push({
      letter,
      correctCount: isCorrect ? 1 : 0,
      incorrectCount: isCorrect ? 0 : 1,
      lastReview: now,
      nextReview,
      difficulty: isCorrect ? 2 : 1,
    });
  }

  localStorage.setItem(STORAGE_KEYS.USER_PROGRESS, JSON.stringify(progress));
  return existing || progress[progress.length - 1];
}

// Settings management
export interface AppSettings {
  ttsVoice: "female" | "male" | "robot";
  notificationsEnabled: boolean;
  language: string;
}

export function getAppSettings(): AppSettings {
  try {
    const stored = localStorage.getItem("appSettings");
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ttsVoice: parsed.ttsVoice || "female",
        notificationsEnabled: parsed.notificationsEnabled || false,
        language: parsed.language || "en",
      };
    }
  } catch (error) {
    // Fall through to defaults
  }
  
  return {
    ttsVoice: "female",
    notificationsEnabled: false,
    language: "en",
  };
}

export function updateAppSettings(settings: Partial<AppSettings>): void {
  try {
    const current = getAppSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem("appSettings", JSON.stringify(updated));
  } catch (error) {
    // Silently fail if localStorage is not available
  }
}
