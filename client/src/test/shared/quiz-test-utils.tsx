import type { RenderOptions } from '@testing-library/react';
import type { ReactElement } from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, expect, vi } from 'vitest';

/**
 * Test utilities for quiz components
 */

/**
 * Mock translation data for tests
 */
export const mockTranslations = {
  quiz: 'Quiz',
  question: 'Question',
  checkAnswer: 'Check Answer',
  correct: 'Correct',
  incorrect: 'Incorrect',
  retry: 'Retry',
  skipQuestion: 'Skip Question',
  nextQuestion: 'Next Question',
  restartQuiz: 'Restart Quiz',
  hint: 'Hint',
  learning: 'Learning',
  review: 'Review',
  mastered: 'Mastered',
  learningProgress: 'Learning Progress',
  accuracy: 'Accuracy',
  totalSessions: 'Total Sessions',
  questionCount: 'Question {current} of {total}',
  natoAlphabet: 'NATO Alphabet',
  sessionComplete: 'Session Complete',
  score: 'Score',
  startQuiz: 'Start Quiz',
  reviewYourAnswers: 'Review Your Answers',
  yourAnswer: 'Your answer',
  adaptiveLearning: 'Adaptive Learning',
  spacedRepetitionDescription: 'Questions adapt based on your performance',
  wordQuiz: 'Word Quiz',
  wordQuizInstructions: 'Enter the NATO alphabet for each letter',
  newRandomWord: 'New Random Word',
  customWord: 'Custom Word',
  cancelCustom: 'Cancel Custom',
  quizTimes: 'Quiz Times',
  bestTime: 'Best Time',
  lastFiveTimes: 'Last Five Times',
  noTimesRecorded: 'No times recorded',
};

/**
 * Factory for creating letter progress data
 */
export function createLetterProgress(
  overrides: Partial<{
    letter: string;
    accuracy: number;
  }> = {}
) {
  return {
    letter: 'A',
    accuracy: 0.8,
    ...overrides,
  };
}

/**
 * Factory for creating quiz questions
 */
export function createQuizQuestion(
  overrides: Partial<{
    letter: string;
    correctAnswer: string;
  }> = {}
) {
  return {
    letter: 'A',
    correctAnswer: 'Alpha',
    ...overrides,
  };
}

/**
 * Factory for creating session results
 */
export function createSessionResult(
  overrides: Partial<{
    question: any;
    userAnswer: string;
    isCorrect: boolean;
  }> = {}
) {
  return {
    question: createQuizQuestion(),
    userAnswer: 'Alpha',
    isCorrect: true,
    ...overrides,
  };
}

/**
 * Factory for creating user progress data
 */
export function createUserProgress(
  overrides: Partial<{
    id: number;
    userId: string;
    letter: string;
    correctCount: number;
    incorrectCount: number;
    lastReviewed: Date;
    nextReview: Date;
    difficulty: number;
  }> = {}
) {
  return {
    id: 1,
    userId: 'test-user',
    letter: 'A',
    correctCount: 5,
    incorrectCount: 2,
    lastReviewed: new Date(),
    nextReview: new Date(),
    difficulty: 1.0,
    ...overrides,
  };
}

/**
 * Mock timer functions for testing
 */
export function createMockTimer() {
  const timerMock = {
    currentTime: 0,
    resetTimer: vi.fn(),
    pauseTimer: vi.fn(),
    resumeTimer: vi.fn(),
    setCurrentTime: vi.fn(),
    isRunning: false,
  };

  return timerMock;
}

/**
 * Mock quiz actions for testing
 */
export function createMockQuizActions() {
  return {
    onSubmit: vi.fn(),
    onSkip: vi.fn(),
    onRetry: vi.fn(),
    onNext: vi.fn(),
    onRestart: vi.fn(),
    onHint: vi.fn(),
  };
}

/**
 * Mock speech recognition for testing
 */
export function createMockSpeechRecognition() {
  return {
    isListening: false,
    isProcessing: false,
    speechSupported: true,
    interimTranscript: '',
    audioLevel: 0,
    error: null,
    startListening: vi.fn(),
    stopListening: vi.fn(),
    testMicrophone: vi.fn(),
    clearError: vi.fn(),
  };
}

/**
 * Mock toast for testing
 */
export function createMockToast() {
  return {
    toast: vi.fn(),
  };
}

/**
 * Custom render function with common providers
 */
export function renderWithProviders(
  ui: ReactElement,
  options: RenderOptions & {
    translations?: typeof mockTranslations;
  } = {}
) {
  const { translations = mockTranslations, ...renderOptions } = options;

  // Create a wrapper with providers if needed
  function Wrapper({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

/**
 * Helper to advance timers in tests
 */
export function advanceTimers(ms: number) {
  vi.advanceTimersByTime(ms);
}

/**
 * Helper to wait for component to be ready
 */
export async function waitForComponent() {
  await waitFor(() => {
    expect(screen.getByRole('button', { name: /check/i })).toBeInTheDocument();
  });
}

/**
 * Helper to simulate user typing
 */
export async function typeInInput(input: HTMLElement, text: string) {
  const user = userEvent.setup();
  await user.clear(input);
  await user.type(input, text);
}

/**
 * Helper to simulate button click
 */
export async function clickButton(name: string | RegExp) {
  const user = userEvent.setup();
  const button = screen.getByRole('button', { name });
  await user.click(button);
}

/**
 * Helper to check if element is visible
 */
export function expectVisible(element: HTMLElement) {
  expect(element).toBeInTheDocument();
  expect(element).toBeVisible();
}

/**
 * Helper to check if element is hidden
 */
export function expectHidden(element: HTMLElement | null) {
  if (element) {
    expect(element).not.toBeVisible();
  } else {
    expect(element).not.toBeInTheDocument();
  }
}

/**
 * Helper to create quiz state for testing
 */
export function createQuizState(
  overrides: Partial<{
    currentQuestionIndex: number;
    totalQuestions: number;
    correctAnswers: number;
    showResult: boolean;
    userAnswer: string;
    showHint: boolean;
    isCompleted: boolean;
  }> = {}
) {
  return {
    currentQuestionIndex: 0,
    totalQuestions: 10,
    correctAnswers: 0,
    showResult: false,
    userAnswer: '',
    showHint: false,
    isCompleted: false,
    ...overrides,
  };
}

/**
 * Helper to create progress stats for testing
 */
export function createProgressStats(
  overrides: Partial<{
    learning: number;
    review: number;
    mastered: number;
  }> = {}
) {
  return {
    learning: 5,
    review: 10,
    mastered: 11,
    ...overrides,
  };
}

/**
 * Helper to simulate quiz completion
 */
export async function completeQuiz(questions: number = 10) {
  for (let i = 0; i < questions; i++) {
    const input = screen.getByRole('textbox');
    await typeInInput(input, 'Alpha');
    await clickButton(/check/i);

    if (i < questions - 1) {
      await clickButton(/next/i);
    }
  }
}

/**
 * Mock localStorage for testing
 */
export function mockLocalStorage() {
  const storage: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => storage[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      storage[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete storage[key];
    }),
    clear: vi.fn(() => {
      Object.keys(storage).forEach((key) => delete storage[key]);
    }),
    key: vi.fn((index: number) => Object.keys(storage)[index] || null),
    get length() {
      return Object.keys(storage).length;
    },
  };
}

/**
 * Helper to setup fake timers
 */
export function setupFakeTimers() {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });
}

/**
 * Helper to verify quiz flow
 */
export async function verifyQuizFlow(expectedSteps: string[]) {
  for (const step of expectedSteps) {
    await waitFor(() => {
      expect(screen.getByText(new RegExp(step, 'i'))).toBeInTheDocument();
    });
  }
}
