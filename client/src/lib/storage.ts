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
  USER_STATS: 'userStats',
  USER_PROGRESS: 'userProgress',
  SETTINGS: 'appSettings',
  QUIZ_SESSION: 'quizSession',
  CONVERTER_TEXT: 'converterText',
} as const;

export interface StoredQuizSession {
  currentQuizSet: any | null; // Using any since QuizSet from spaced-repetition.ts isn't imported
  currentQuestionIndex: number;
  sessionResults: {
    question: any; // Using any since QuizQuestion isn't imported
    userAnswer: string;
    isCorrect: boolean;
  }[];
  isQuizComplete: boolean;
  showResult: boolean;
  isActive: boolean;
  showReviewDialog: boolean;
}

export function getStoredQuizSession(): StoredQuizSession | null {
  const stored = localStorage.getItem(STORAGE_KEYS.QUIZ_SESSION);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      console.warn('Failed to parse stored quiz session');
    }
  }
  return null;
}

export function updateStoredQuizSession(
  session: StoredQuizSession | null
): void {
  if (session) {
    localStorage.setItem(STORAGE_KEYS.QUIZ_SESSION, JSON.stringify(session));
  } else {
    localStorage.removeItem(STORAGE_KEYS.QUIZ_SESSION);
  }
}

// Stats management
export function getUserStats(): UserStats {
  const stored = localStorage.getItem(STORAGE_KEYS.USER_STATS);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      console.warn('Failed to parse stored stats');
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
    } catch {
      console.warn('Failed to parse stored progress');
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
  ttsVoice: 'female' | 'male' | 'robot';
  notificationsEnabled: boolean;
  language: string;
}

export function getAppSettings(): AppSettings {
  try {
    const stored = localStorage.getItem('appSettings');
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        ttsVoice: parsed.ttsVoice || 'female',
        notificationsEnabled: parsed.notificationsEnabled || false,
        language: parsed.language || 'en',
      };
    }
  } catch {
    // Fall through to defaults
  }

  return {
    ttsVoice: 'female',
    notificationsEnabled: false,
    language: 'en',
  };
}

export function updateAppSettings(settings: Partial<AppSettings>): void {
  try {
    const current = getAppSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem('appSettings', JSON.stringify(updated));
  } catch {
    // Silently fail if localStorage is not available
  }
}

// Converter text management
export function getStoredConverterText(): string {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CONVERTER_TEXT);
    return stored || '';
  } catch {
    return '';
  }
}

export function updateStoredConverterText(text: string): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CONVERTER_TEXT, text);
  } catch {
    // Silently fail if localStorage is not available
  }
}
