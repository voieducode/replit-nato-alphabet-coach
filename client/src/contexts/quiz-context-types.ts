import type { QuizQuestion, QuizSet } from '@/lib/spaced-repetition';
import type { UserStats } from '@/lib/storage';

export interface QuizSessionResult {
  question: QuizQuestion;
  userAnswer: string;
  isCorrect: boolean;
}

export interface QuizSessionState {
  currentQuizSet: QuizSet | null;
  currentQuestionIndex: number;
  sessionResults: QuizSessionResult[];
  isQuizComplete: boolean;
  showResult: boolean;
  isActive: boolean;
  showReviewDialog: boolean;
}

export interface QuizContextType {
  sessionState: QuizSessionState;
  userId: string;
  localStats: UserStats;
  startNewQuizSet: () => void;
  addSessionResult: (result: QuizSessionResult) => void;
  advanceQuiz: () => void;
  finishQuizSet: () => void;
  setShowReviewDialog: (show: boolean) => void;
}
