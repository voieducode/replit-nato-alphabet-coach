import { act, render } from '@testing-library/react';
import React, { useContext, useEffect } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { generateQuizSet } from '@/lib/spaced-repetition';
import {
  getStoredQuizSession,
  getUserProgressLocal,
  getUserStats,
  updateStoredQuizSession,
  updateUserStats,
} from '@/lib/storage';
import { QuizContext } from '../quiz-context';
import { QuizProvider } from '../quiz-provider';

// Mock dependencies
vi.mock('@/lib/storage');
vi.mock('@/lib/spaced-repetition');

// Mock dependencies and set up context access
vi.mock('@/hooks/use-quiz-context', () => ({
  useQuizContext: () => useContext(QuizContext),
}));

// Helper component to access context in tests
function TestComponent({
  onMount,
}: {
  onMount: (context: any) => void;
}): JSX.Element {
  const context = useContext(QuizContext);
  useEffect(() => {
    onMount(context);
  }, [context, onMount]);
  return <></>;
}

describe('quizProvider', () => {
  const mockUserId = 'test-user';
  let onMount: (context: any) => void;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();

    // Reset mock functions
    (getUserStats as any).mockReturnValue({
      currentStreak: 0,
      totalSessions: 0,
      correctAnswers: 0,
      totalAnswers: 0,
      quizTimer: {
        bestTime: Infinity,
        lastFiveTimes: [],
      },
    });

    (getUserProgressLocal as any).mockReturnValue([
      {
        letter: 'A',
        correctCount: 5,
        incorrectCount: 1,
        lastReview: new Date().toISOString(),
        nextReview: new Date().toISOString(),
        difficulty: 3,
      },
    ]);

    (generateQuizSet as any).mockReturnValue({
      id: 'test-quiz-set',
      questions: [
        { letter: 'A', correctAnswer: 'Alpha' },
        { letter: 'B', correctAnswer: 'Bravo' },
      ],
      startedAt: new Date(),
    });

    // Default to no stored session
    (getStoredQuizSession as any).mockReturnValue(null);
    (updateStoredQuizSession as any).mockImplementation(() => {});
    (updateUserStats as any).mockReturnValue({
      currentStreak: 0,
      totalSessions: 1,
      correctAnswers: 1,
      totalAnswers: 2,
      quizTimer: {
        bestTime: Infinity,
        lastFiveTimes: [],
      },
    });

    onMount = vi.fn();
  });

  describe('finishQuizSet', () => {
    beforeEach(() => {
      (getStoredQuizSession as any).mockReturnValue({
        currentQuizSet: {
          questions: [
            { letter: 'A', correctAnswer: 'Alpha' },
            { letter: 'B', correctAnswer: 'Bravo' },
          ],
        },
        currentQuestionIndex: 2,
        sessionResults: [
          {
            question: { letter: 'A', correctAnswer: 'Alpha' },
            userAnswer: 'Alpha',
            isCorrect: true,
          },
          {
            question: { letter: 'B', correctAnswer: 'Bravo' },
            userAnswer: 'Charlie',
            isCorrect: false,
          },
        ],
        isQuizComplete: true,
        showResult: true,
        isActive: false,
        showReviewDialog: false,
      });
    });

    it('should clear stored session and update stats', async () => {
      render(
        <QuizProvider userId={mockUserId}>
          <TestComponent onMount={onMount} />
        </QuizProvider>
      );

      // Get context from the latest render
      const context = (onMount as any).mock.calls.at(-1)[0];

      // Execute finishQuizSet
      await act(async () => {
        context.finishQuizSet();
      });

      // Verify stored session is cleared
      expect(updateStoredQuizSession).toHaveBeenCalledWith(null);

      // Verify stats are updated
      expect(updateUserStats).toHaveBeenCalled();
      const updateStatsCall = (updateUserStats as any).mock.calls[0][0];
      expect(updateStatsCall.totalSessions).toBe(1);
      expect(updateStatsCall.correctAnswers).toBe(1);
      expect(updateStatsCall.totalAnswers).toBe(2);
    });

    it('should reset session state before starting new quiz', async () => {
      render(
        <QuizProvider userId={mockUserId}>
          <TestComponent onMount={onMount} />
        </QuizProvider>
      );

      let context = (onMount as any).mock.calls.at(-1)[0];

      await act(async () => {
        context.finishQuizSet();
      });

      // Get the updated context after the state change
      context = (onMount as any).mock.calls.at(-1)[0];

      // Verify state is reset before new quiz
      expect(context.sessionState).toMatchObject({
        currentQuizSet: expect.any(Object), // New quiz set
        currentQuestionIndex: 0,
        sessionResults: [],
        isQuizComplete: false,
        showResult: false,
        isActive: true,
        showReviewDialog: false,
      });
    });
  });

  describe('startNewQuizSet', () => {
    it('should generate new quiz set with correct parameters', async () => {
      render(
        <QuizProvider userId={mockUserId}>
          <TestComponent onMount={onMount} />
        </QuizProvider>
      );

      const context = (onMount as any).mock.calls.at(-1)[0];

      await act(async () => {
        context.startNewQuizSet();
      });

      // Verify quiz set generation
      expect(generateQuizSet).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            userId: mockUserId,
            letter: 'A',
          }),
        ]),
        10
      );
    });

    it('should properly initialize quiz state', async () => {
      render(
        <QuizProvider userId={mockUserId}>
          <TestComponent onMount={onMount} />
        </QuizProvider>
      );

      let context = (onMount as any).mock.calls.at(-1)[0];

      await act(async () => {
        context.startNewQuizSet();
      });

      // Get the updated context after the state change
      context = (onMount as any).mock.calls.at(-1)[0];

      // Verify state initialization
      expect(context.sessionState).toMatchObject({
        currentQuizSet: expect.any(Object),
        currentQuestionIndex: 0,
        sessionResults: [],
        isQuizComplete: false,
        showResult: false,
        isActive: true,
        showReviewDialog: false,
      });
    });

    it('should handle empty user progress', async () => {
      (getUserProgressLocal as any).mockReturnValue([]);

      render(
        <QuizProvider userId={mockUserId}>
          <TestComponent onMount={onMount} />
        </QuizProvider>
      );

      let context = (onMount as any).mock.calls.at(-1)[0];

      await act(async () => {
        context.startNewQuizSet();
      });

      // Get the updated context after the state change
      context = (onMount as any).mock.calls.at(-1)[0];

      // Verify quiz set is generated even with empty progress
      expect(generateQuizSet).toHaveBeenCalledWith([], 10);
      expect(context.sessionState.currentQuizSet).toBeTruthy();
    });
  });

  describe('integration', () => {
    it('should properly handle full quiz cycle', async () => {
      render(
        <QuizProvider userId={mockUserId}>
          <TestComponent onMount={onMount} />
        </QuizProvider>
      );

      let context = (onMount as any).mock.calls.at(-1)[0];

      // Complete a quiz
      await act(async () => {
        const result = {
          question: { letter: 'A', correctAnswer: 'Alpha' },
          userAnswer: 'Alpha',
          isCorrect: true,
        };
        context.addSessionResult(result);
        context.advanceQuiz();
      });

      // Finish quiz and start new one
      await act(async () => {
        context.finishQuizSet();
      });

      // Get the updated context after the state changes
      context = (onMount as any).mock.calls.at(-1)[0];

      // Verify the cycle completed correctly
      expect(updateStoredQuizSession).toHaveBeenCalledWith(null);
      expect(updateUserStats).toHaveBeenCalled();
      expect(generateQuizSet).toHaveBeenCalled();
      expect(context.sessionState).toMatchObject({
        currentQuizSet: expect.any(Object),
        currentQuestionIndex: 0,
        sessionResults: [],
        isQuizComplete: false,
        showResult: false,
        isActive: true,
        showReviewDialog: false,
      });
    });

    it('should maintain state consistency through operations', async () => {
      render(
        <QuizProvider userId={mockUserId}>
          <TestComponent onMount={onMount} />
        </QuizProvider>
      );

      let context = (onMount as any).mock.calls.at(-1)[0];
      const states: any[] = [];

      // Initialize quiz
      await act(() => {
        context.startNewQuizSet();
      });

      // Get updated context and record initial state
      context = (onMount as any).mock.calls.at(-1)[0];
      states.push({ ...context.sessionState });

      // Add result
      await act(() => {
        context.addSessionResult({
          question: { letter: 'A', correctAnswer: 'Alpha' },
          userAnswer: 'Alpha',
          isCorrect: true,
        });
      });

      // Get updated context and record state after result
      context = (onMount as any).mock.calls.at(-1)[0];
      states.push({ ...context.sessionState });

      // Finish quiz
      await act(() => {
        context.finishQuizSet();
      });

      // Get updated context and record final state
      context = (onMount as any).mock.calls.at(-1)[0];
      states.push({ ...context.sessionState });

      // Verify state transitions
      expect(states[0].sessionResults).toHaveLength(0);
      expect(states[1].sessionResults).toHaveLength(1);
      expect(states[2].sessionResults).toHaveLength(0);

      // Verify final state is clean
      expect(context.sessionState).toMatchObject({
        currentQuizSet: expect.any(Object),
        currentQuestionIndex: 0,
        sessionResults: [],
        isQuizComplete: false,
        showResult: false,
        isActive: true,
        showReviewDialog: false,
      });
    });
  });
});
