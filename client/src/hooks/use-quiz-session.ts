import type { UserProgress } from '@shared/schema';
import type { QuizQuestion, QuizSet } from '@/lib/spaced-repetition';
import { useCallback, useState } from 'react';
import { generateQuizSet } from '@/lib/spaced-repetition';
import {
  getUserProgressLocal,
  getUserStats,
  updateUserStats,
} from '@/lib/storage';

interface QuizSessionResult {
  question: QuizQuestion;
  userAnswer: string;
  isCorrect: boolean;
}

interface QuizSessionState {
  currentQuizSet: QuizSet | null;
  currentQuestionIndex: number;
  sessionResults: QuizSessionResult[];
  isQuizComplete: boolean;
  showResult: boolean;
  isActive: boolean;
}

export function useQuizSession(userId: string) {
  const [sessionState, setSessionState] = useState<QuizSessionState>({
    currentQuizSet: null,
    currentQuestionIndex: 0,
    sessionResults: [],
    isQuizComplete: false,
    showResult: false,
    isActive: false,
  });

  const [localStats, setLocalStats] = useState(() => getUserStats());

  // Initialize a new quiz set
  const startNewQuizSet = useCallback(() => {
    const localProgress = getUserProgressLocal();
    const userProgress: UserProgress[] = localProgress.map((p, index) => ({
      id: index + 1,
      userId,
      letter: p.letter,
      correctCount: p.correctCount,
      incorrectCount: p.incorrectCount,
      lastReviewed: new Date(p.lastReview),
      nextReview: new Date(p.nextReview),
      difficulty: p.difficulty,
    }));

    const newQuizSet = generateQuizSet(userProgress, 10);
    setSessionState({
      currentQuizSet: newQuizSet,
      currentQuestionIndex: 0,
      sessionResults: [],
      isQuizComplete: false,
      showResult: false,
      isActive: true,
    });
  }, [userId]);

  // Add a result to the session
  const addSessionResult = useCallback((result: QuizSessionResult) => {
    setSessionState((prev) => ({
      ...prev,
      sessionResults: [...prev.sessionResults, result],
      showResult: true,
      isActive: false,
    }));
  }, []);

  // Move to next question or complete quiz
  const advanceQuiz = useCallback(() => {
    setSessionState((prev) => {
      if (!prev.currentQuizSet) {
        return prev;
      }

      const nextIndex = prev.currentQuestionIndex + 1;
      if (nextIndex >= prev.currentQuizSet.questions.length) {
        return {
          ...prev,
          isQuizComplete: true,
          isActive: false,
        };
      }

      return {
        ...prev,
        currentQuestionIndex: nextIndex,
        showResult: false,
        isActive: true,
      };
    });
  }, []);

  // Handle quiz completion and save stats
  const finishQuizSet = useCallback(() => {
    const score = sessionState.sessionResults.filter((r) => r.isCorrect).length;
    const accuracy = Math.round(
      (score / sessionState.sessionResults.length) * 100
    );
    const today = new Date().toDateString();
    const lastSession = localStats.lastSessionDate;
    const isNewDay = lastSession !== today;

    const newStats = updateUserStats({
      totalSessions: localStats.totalSessions + 1,
      correctAnswers: localStats.correctAnswers + score,
      totalAnswers:
        localStats.totalAnswers + sessionState.sessionResults.length,
      currentStreak: isNewDay
        ? accuracy >= 70
          ? localStats.currentStreak + 1
          : 0
        : localStats.currentStreak,
      lastSessionDate: today,
    });

    setLocalStats(newStats);
    startNewQuizSet();
  }, [localStats, sessionState.sessionResults, startNewQuizSet]);

  return {
    sessionState,
    localStats,
    startNewQuizSet,
    addSessionResult,
    advanceQuiz,
    finishQuizSet,
  };
}
