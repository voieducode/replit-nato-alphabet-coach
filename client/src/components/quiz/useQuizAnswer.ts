import { useCallback } from 'react';
import { checkAnswerVariants } from '@/lib/spaced-repetition';

export function useQuizAnswer({
  getCurrentQuestion,
  addSessionResult,
  updateProgress,
  toast,
  translations,
  advanceQuiz,
  setUserAnswer,
  setShowHint,
  setHintTimer,
}: {
  getCurrentQuestion: () => any;
  addSessionResult: (result: any) => void;
  updateProgress: (letter: string, isCorrect: boolean) => void;
  toast: any;
  translations: any;
  advanceQuiz: () => void;
  setUserAnswer: (val: string) => void;
  setShowHint: (val: boolean) => void;
  setHintTimer: (val: number) => void;
}) {
  const handleSubmitAnswer = useCallback(
    async (userAnswer: string) => {
      const currentQuestion = getCurrentQuestion();
      if (!currentQuestion || !userAnswer.trim()) {
        return;
      }
      const isCorrect = checkAnswerVariants(
        userAnswer,
        currentQuestion.correctAnswer
      );
      addSessionResult({
        question: currentQuestion,
        userAnswer: userAnswer.trim(),
        isCorrect,
      });
      if (isCorrect) {
        toast({
          title: translations.correct,
          description: `${currentQuestion.letter} is indeed ${currentQuestion.correctAnswer}`,
        });
      } else {
        toast({
          title: translations.incorrect,
          description: `${currentQuestion.letter} is ${currentQuestion.correctAnswer}, not ${userAnswer}`,
          variant: 'destructive',
        });
      }
      updateProgress(currentQuestion.letter, isCorrect);
      setTimeout(() => {
        setUserAnswer('');
        setShowHint(false);
        setHintTimer(0);
        advanceQuiz();
      }, 2000);
    },
    [
      getCurrentQuestion,
      addSessionResult,
      updateProgress,
      toast,
      translations,
      advanceQuiz,
      setUserAnswer,
      setShowHint,
      setHintTimer,
    ]
  );

  const handleSkipQuestion = useCallback(() => {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) {
      return;
    }
    updateProgress(currentQuestion.letter, false);
    addSessionResult({
      question: currentQuestion,
      userAnswer: '(skipped)',
      isCorrect: false,
    });
    setUserAnswer('');
    setShowHint(false);
    setHintTimer(0);
    advanceQuiz();
  }, [
    getCurrentQuestion,
    updateProgress,
    addSessionResult,
    setUserAnswer,
    setShowHint,
    setHintTimer,
    advanceQuiz,
  ]);

  return { handleSubmitAnswer, handleSkipQuestion };
}
