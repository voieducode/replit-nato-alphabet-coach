import type { UserProgress } from '@shared/schema';
import type { ReactNode } from 'react';
import type { QuizSessionResult, QuizSessionState } from './quiz-context-types';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { generateQuizSet } from '@/lib/spaced-repetition';
import {
  getStoredQuizSession,
  getUserProgressLocal,
  getUserStats,
  updateStoredQuizSession,
  updateUserStats,
} from '@/lib/storage';
import { QuizContext } from './quiz-context';

// Provider component
export function QuizProvider({
  children,
  userId,
}: {
  children: ReactNode;
  userId: string;
}) {
  const [sessionState, setSessionState] = useState<QuizSessionState>(() => {
    const storedSession = getStoredQuizSession();
    return (
      storedSession || {
        currentQuizSet: null,
        currentQuestionIndex: 0,
        sessionResults: [],
        isQuizComplete: false,
        showResult: false,
        isActive: false,
        showReviewDialog: false,
      }
    );
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
      showReviewDialog: false,
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
    // First, clear the stored session to prevent state conflicts
    updateStoredQuizSession(null);

    // Then update stats
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

    // Reset state and start a new quiz set
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
      showReviewDialog: false,
    });
  }, [localStats, sessionState.sessionResults, userId]);

  // Set review dialog visibility state
  const setShowReviewDialog = useCallback((show: boolean) => {
    setSessionState((prev) => ({
      ...prev,
      showReviewDialog: show,
    }));
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      sessionState,
      userId,
      localStats,
      startNewQuizSet,
      addSessionResult,
      advanceQuiz,
      finishQuizSet,
      setShowReviewDialog,
    }),
    [
      sessionState,
      userId,
      localStats,
      startNewQuizSet,
      addSessionResult,
      advanceQuiz,
      finishQuizSet,
      setShowReviewDialog,
    ]
  );

  // Persist session state changes
  useEffect(() => {
    // Only persist non-completed sessions
    if (!sessionState.isQuizComplete && sessionState.currentQuizSet) {
      updateStoredQuizSession(sessionState);
    }
  }, [sessionState]);

  return (
    <QuizContext.Provider value={contextValue}>{children}</QuizContext.Provider>
  );
}
