import type { UserProgress } from '@shared/schema';
import type { QuizQuestion } from '@/lib/spaced-repetition';
import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { useQuizContext } from '@/hooks/use-quiz-context';
import { useToast } from '@/hooks/use-toast';
import { checkAnswerVariants } from '@/lib/spaced-repetition';
import {
  addQuizTime,
  getUserProgressLocal,
  getUserStats,
  updateUserProgressLocal,
} from '@/lib/storage';

import { QuizCard } from './quiz/quiz-card';
// Import subcomponents
import { QuizHeader } from './quiz/quiz-header';
import { ResultsReview } from './quiz/results-review';
import { SpacedRepetitionInfo } from './quiz/spaced-repetition-info';
import { StatsDisplay } from './quiz/stats-display';
import { StudyStatsFooter } from './quiz/study-stats-footer';

// QuizSection no longer needs userId prop as it's provided by QuizProvider
export default function QuizSection() {
  const {
    sessionState: {
      currentQuizSet,
      currentQuestionIndex,
      sessionResults,
      isQuizComplete,
      showResult,
      isActive,
    },
    localStats,
    startNewQuizSet,
    addSessionResult,
    advanceQuiz,
    finishQuizSet,
  } = useQuizContext();

  // Hard-code userId since it's always the same in this app
  const userId = 'user-1';

  const [userAnswer, setUserAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [_hintTimer, setHintTimer] = useState(0);
  const [showStats, setShowStats] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isTimerActiveRef = useRef(false);
  const prevQuizSetRef = useRef(currentQuizSet);
  const { toast } = useToast();
  const { translations } = useLanguage();

  // Use localStorage for all data persistence with lazy initialization
  const [userProgress, setUserProgress] = useState<UserProgress[]>(() => {
    const localProgress = getUserProgressLocal();
    return localProgress.map((p, index) => ({
      id: index + 1,
      userId,
      letter: p.letter,
      correctCount: p.correctCount,
      incorrectCount: p.incorrectCount,
      lastReviewed: new Date(p.lastReview),
      nextReview: new Date(p.nextReview),
      difficulty: p.difficulty,
    }));
  });

  // Local progress update function
  const updateProgress = (letter: string, isCorrect: boolean) => {
    const localProgress = updateUserProgressLocal(letter, isCorrect);

    // Update state
    setUserProgress((prev) => {
      const existing = prev.find((p) => p.letter === letter);
      if (existing) {
        return prev.map((p) =>
          p.letter === letter
            ? {
                ...p,
                correctCount: localProgress.correctCount,
                incorrectCount: localProgress.incorrectCount,
                lastReviewed: new Date(localProgress.lastReview),
                nextReview: new Date(localProgress.nextReview),
                difficulty: localProgress.difficulty,
              }
            : p
        );
      } else {
        return [
          ...prev,
          {
            id: prev.length + 1,
            userId,
            letter: localProgress.letter,
            correctCount: localProgress.correctCount,
            incorrectCount: localProgress.incorrectCount,
            lastReviewed: new Date(localProgress.lastReview),
            nextReview: new Date(localProgress.nextReview),
            difficulty: localProgress.difficulty,
          },
        ];
      }
    });
  };

  // Timer management - no longer need callback functions

  // Hint timer effect - show hint after 5 seconds
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (isActive && !showResult) {
      intervalId = setInterval(() => {
        setHintTimer((timer) => {
          if (timer >= 5 && !showHint) {
            setShowHint(true);
          }
          return timer + 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [isActive, showResult, showHint]);

  // Timer effect
  useEffect(() => {
    if (isActive && !isQuizComplete && !showResult) {
      isTimerActiveRef.current = true;
      timerRef.current = setInterval(() => {
        setCurrentTime((prev) => prev + 1);
      }, 1000);
    } else {
      isTimerActiveRef.current = false;
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isActive, isQuizComplete, showResult]);

  // Handle timer reset when quiz set changes
  if (prevQuizSetRef.current !== currentQuizSet) {
    prevQuizSetRef.current = currentQuizSet;
    if (!currentQuizSet) {
      // Clear any existing timer and reset time
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      isTimerActiveRef.current = false;
      if (currentTime > 0) {
        setCurrentTime(0);
      }
    }
  }

  // Initialize first quiz set
  useEffect(() => {
    if (userProgress.length >= 0 && !currentQuizSet) {
      startNewQuizSet();
    }
  }, [userProgress, currentQuizSet, startNewQuizSet]);

  const getCurrentQuestion = (): QuizQuestion | null => {
    if (
      !currentQuizSet ||
      currentQuestionIndex >= currentQuizSet.questions.length
    ) {
      return null;
    }
    return currentQuizSet.questions[currentQuestionIndex];
  };

  // Save quiz time on completion
  const handleQuizCompletion = () => {
    if (currentTime > 0) {
      const score = sessionResults.filter((r) => r.isCorrect).length;
      const totalQuestions = currentQuizSet?.questions.length || 10;
      addQuizTime(currentTime, score, totalQuestions);
    }
  };

  const handleSubmitAnswer = async () => {
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

    // Update progress
    updateProgress(currentQuestion.letter, isCorrect);

    // Auto-advance after 2 seconds
    setTimeout(() => {
      setUserAnswer('');
      setShowHint(false);
      setHintTimer(0);
      advanceQuiz();
    }, 2000);
  };

  const handleSkipQuestion = () => {
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
  };

  // Calculate stats
  const totalSessions = localStats.totalSessions;
  const averageScore =
    localStats.totalAnswers > 0
      ? Math.round((localStats.correctAnswers / localStats.totalAnswers) * 100)
      : 0;

  // Calculate letter progress and stats
  const letterProgress = userProgress.map((progress) => {
    const total = progress.correctCount + progress.incorrectCount;
    const accuracy = total > 0 ? progress.correctCount / total : 0;
    return {
      letter: progress.letter,
      accuracy,
    };
  });

  const progressStats = letterProgress.reduce(
    (acc, { accuracy }) => {
      if (accuracy >= 0.8) {
        acc.mastered++;
      } else if (accuracy >= 0.5) {
        acc.review++;
      } else {
        acc.learning++;
      }
      return acc;
    },
    { learning: 0, review: 0, mastered: 0 }
  );

  const currentQuestion = getCurrentQuestion();

  if (!currentQuestion && !isQuizComplete) {
    return (
      <div className="p-4 flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (isQuizComplete) {
    handleQuizCompletion();
    return (
      <ResultsReview
        sessionResults={sessionResults}
        onFinish={finishQuizSet}
        translations={translations}
      />
    );
  }

  const correctAnswersCount = sessionResults.filter(
    (r: { isCorrect: boolean }) => r.isCorrect
  ).length;

  return (
    <div className="p-4 space-y-6">
      {/* Progress Header - Clickable to show stats */}
      <QuizHeader
        currentQuestionIndex={currentQuestionIndex}
        totalQuestions={currentQuizSet?.questions.length || 10}
        correctAnswers={correctAnswersCount}
        showResult={showResult}
        toggleStats={() => setShowStats(!showStats)}
        translations={translations}
        currentTime={currentTime}
      />

      {/* Stats Section - Shows when header is clicked */}
      {showStats && (
        <StatsDisplay
          totalSessions={totalSessions}
          averageScore={averageScore}
          learningStats={progressStats}
          letterProgress={letterProgress}
          translations={translations}
          timerStats={getUserStats().quizTimer}
        />
      )}

      {/* Quiz Card */}
      {currentQuestion && (
        <QuizCard
          currentQuestion={currentQuestion}
          currentQuestionIndex={currentQuestionIndex}
          totalQuestions={currentQuizSet?.questions.length || 10}
          userAnswer={userAnswer}
          setUserAnswer={setUserAnswer}
          showResult={showResult}
          showHint={showHint}
          onSubmitAnswer={handleSubmitAnswer}
          onSkipQuestion={handleSkipQuestion}
          translations={translations}
          sessionResults={sessionResults}
        />
      )}

      {/* Spaced Repetition Info */}
      <SpacedRepetitionInfo
        progressStats={progressStats}
        letterProgress={letterProgress}
        translations={translations}
      />

      {/* Study Stats Footer */}
      <StudyStatsFooter
        totalSessions={totalSessions}
        averageScore={averageScore}
        translations={translations}
      />
    </div>
  );
}
