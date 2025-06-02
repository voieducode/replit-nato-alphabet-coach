import type { QuizQuestion } from '@/lib/spaced-repetition';
import React, { useEffect, useState } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { useQuizContext } from '@/hooks/use-quiz-context';
import { useToast } from '@/hooks/use-toast';
import { addQuizTime, getUserStats } from '@/lib/storage';
import { QuizCard } from './quiz/quiz-card';
// Import subcomponents
import { QuizHeader } from './quiz/quiz-header';
import { ResultsReview } from './quiz/results-review';
import { SpacedRepetitionInfo } from './quiz/spaced-repetition-info';
import { StatsDisplay } from './quiz/stats-display';
import { StudyStatsFooter } from './quiz/study-stats-footer';
import { useHintTimer } from './quiz/useHintTimer';
import { useQuizAnswer } from './quiz/useQuizAnswer';
import { quizStats } from './quiz/useQuizStats';
import { useQuizTimer } from './quiz/useQuizTimer';
import { useUserProgress } from './quiz/useUserProgress';

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
  const { userProgress, updateProgress } = useUserProgress(userId);

  const [userAnswer, setUserAnswer] = useState('');
  const [showStats, setShowStats] = useState(false);
  const { toast } = useToast();
  const { translations } = useLanguage();

  const {
    showHint,
    setShowHint,
    hintTimer: _hintTimer,
    setHintTimer,
  } = useHintTimer(isActive, showResult);

  const { currentTime } = useQuizTimer(
    isActive,
    isQuizComplete,
    showResult,
    currentQuizSet
  );

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
  useEffect(() => {
    if (isQuizComplete) {
      if (currentTime > 0) {
        const score = sessionResults.filter((r) => r.isCorrect).length;
        const totalQuestions = currentQuizSet?.questions.length || 10;
        addQuizTime(currentTime, score, totalQuestions);
      }
    }
    // Only run when quiz completes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isQuizComplete]);

  const { handleSubmitAnswer, handleSkipQuestion } = useQuizAnswer({
    getCurrentQuestion,
    addSessionResult,
    updateProgress,
    toast,
    translations,
    advanceQuiz,
    setUserAnswer,
    setShowHint,
    setHintTimer,
  });

  const {
    totalSessions,
    averageScore,
    letterProgress,
    progressStats,
    correctAnswersCount,
  } = quizStats(userProgress, localStats, sessionResults);

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
    return (
      <ResultsReview
        sessionResults={sessionResults}
        onFinish={finishQuizSet}
        translations={translations}
      />
    );
  }

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
          onSubmitAnswer={() => handleSubmitAnswer(userAnswer)}
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
