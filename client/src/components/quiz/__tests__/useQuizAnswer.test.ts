import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useQuizAnswer } from '../useQuizAnswer';

describe('useQuizAnswer', () => {
  it('handles correct answer', async () => {
    const addSessionResult = vi.fn();
    const updateProgress = vi.fn();
    const toast = vi.fn();
    const advanceQuiz = vi.fn();
    const setUserAnswer = vi.fn();
    const setShowHint = vi.fn();
    const setHintTimer = vi.fn();
    const translations = { correct: 'Correct', incorrect: 'Incorrect' };
    const getCurrentQuestion = () => ({ letter: 'A', correctAnswer: 'Alpha' });
    const { result } = renderHook(() =>
      useQuizAnswer({
        getCurrentQuestion,
        addSessionResult,
        updateProgress,
        toast,
        translations,
        advanceQuiz,
        setUserAnswer,
        setShowHint,
        setHintTimer,
      })
    );
    await act(async () => {
      await result.current.handleSubmitAnswer('Alpha');
    });
    expect(addSessionResult).toHaveBeenCalledWith({
      question: { letter: 'A', correctAnswer: 'Alpha' },
      userAnswer: 'Alpha',
      isCorrect: true,
    });
    expect(updateProgress).toHaveBeenCalledWith('A', true);
    expect(toast).toHaveBeenCalledWith({
      title: 'Correct',
      description: 'A is indeed Alpha',
    });
  });

  it('handles incorrect answer', async () => {
    const addSessionResult = vi.fn();
    const updateProgress = vi.fn();
    const toast = vi.fn();
    const advanceQuiz = vi.fn();
    const setUserAnswer = vi.fn();
    const setShowHint = vi.fn();
    const setHintTimer = vi.fn();
    const translations = { correct: 'Correct', incorrect: 'Incorrect' };
    const getCurrentQuestion = () => ({ letter: 'A', correctAnswer: 'Alpha' });
    const { result } = renderHook(() =>
      useQuizAnswer({
        getCurrentQuestion,
        addSessionResult,
        updateProgress,
        toast,
        translations,
        advanceQuiz,
        setUserAnswer,
        setShowHint,
        setHintTimer,
      })
    );
    await act(async () => {
      await result.current.handleSubmitAnswer('Bravo');
    });
    expect(addSessionResult).toHaveBeenCalledWith({
      question: { letter: 'A', correctAnswer: 'Alpha' },
      userAnswer: 'Bravo',
      isCorrect: false,
    });
    expect(updateProgress).toHaveBeenCalledWith('A', false);
    expect(toast).toHaveBeenCalledWith({
      title: 'Incorrect',
      description: 'A is Alpha, not Bravo',
      variant: 'destructive',
    });
  });

  it('handles skip', () => {
    const addSessionResult = vi.fn();
    const updateProgress = vi.fn();
    const advanceQuiz = vi.fn();
    const setUserAnswer = vi.fn();
    const setShowHint = vi.fn();
    const setHintTimer = vi.fn();
    const getCurrentQuestion = () => ({ letter: 'B', correctAnswer: 'Bravo' });
    const { result } = renderHook(() =>
      useQuizAnswer({
        getCurrentQuestion,
        addSessionResult,
        updateProgress,
        toast: vi.fn(),
        translations: {},
        advanceQuiz,
        setUserAnswer,
        setShowHint,
        setHintTimer,
      })
    );
    act(() => {
      result.current.handleSkipQuestion();
    });
    expect(addSessionResult).toHaveBeenCalledWith({
      question: { letter: 'B', correctAnswer: 'Bravo' },
      userAnswer: '(skipped)',
      isCorrect: false,
    });
    expect(updateProgress).toHaveBeenCalledWith('B', false);
    expect(advanceQuiz).toHaveBeenCalled();
  });
});
