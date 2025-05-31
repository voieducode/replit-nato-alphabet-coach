import type { UserProgress } from '@shared/schema';
import type { QuizQuestion } from '@/lib/spaced-repetition';
import {
  Brain,
  CheckCircle,
  Lightbulb,
  Mic,
  MicOff,
  Target,
  Trophy,
  XCircle,
} from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { useLanguage } from '@/hooks/use-language';
import { useQuizSession } from '@/hooks/use-quiz-session';
import { useToast } from '@/hooks/use-toast';
import { checkAnswerVariants, getHintForLetter } from '@/lib/spaced-repetition';
import { getUserProgressLocal, updateUserProgressLocal } from '@/lib/storage';

interface QuizSectionProps {
  userId: string;
}

export default function QuizSection({ userId }: QuizSectionProps) {
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
  } = useQuizSession(userId);

  const [userAnswer, setUserAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [_hintTimer, setHintTimer] = useState(0);
  const [showStats, setShowStats] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  // TypeScript doesn't have built-in types for SpeechRecognition
  interface SpeechRecognitionInstance {
    continuous: boolean;
    interimResults: boolean;
    maxAlternatives: number;
    lang: string;
    onstart: () => void;
    onresult: (event: any) => void;
    onerror: (event: any) => void;
    onend: () => void;
    start: () => void;
    stop: () => void;
  }

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
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

  // Speech recognition event handlers
  const handleStart = useCallback(() => {
    setIsListening(true);
  }, [setIsListening]);

  const handleResult = useCallback(
    (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase().trim();
      setUserAnswer(transcript);
      setIsListening(false);
    },
    [setUserAnswer, setIsListening]
  );

  const handleEnd = useCallback(() => {
    setIsListening(false);
  }, [setIsListening]);

  const handleError = useCallback(
    (event: any) => {
      setIsListening(false);

      // Provide error messages
      if (event.error === 'language-not-supported') {
        toast({
          title: 'Language Not Supported',
          description: 'Try switching to English system language.',
          variant: 'destructive',
        });
      } else if (event.error === 'not-allowed') {
        toast({
          title: 'Microphone Access Denied',
          description: 'Please allow microphone access in browser settings.',
          variant: 'destructive',
        });
      } else if (event.error === 'no-speech') {
        toast({
          title: 'No Speech Detected',
          description: 'Please speak clearly and try again.',
        });
      } else if (event.error === 'network') {
        toast({
          title: 'Network Error',
          description: 'Speech recognition requires internet connection.',
          variant: 'destructive',
        });
      }
    },
    [setIsListening, toast]
  );

  // Initialize speech recognition with browser-specific handling
  const initializeSpeechRecognition = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return false;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.lang = 'en-US';

      recognition.onstart = handleStart;
      recognition.onresult = handleResult;
      recognition.onerror = handleError;
      recognition.onend = handleEnd;

      recognitionRef.current = recognition;
      return true;
    } catch {
      toast({
        title: 'Speech Recognition Error',
        description: 'Failed to initialize speech recognition.',
        variant: 'destructive',
      });
      return false;
    }
  }, [handleStart, handleResult, handleError, handleEnd, toast]);

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

  // Handle speech recognition initialization result
  useEffect(() => {
    // Initialize speech recognition and get support status
    const isSupported = initializeSpeechRecognition();

    // Use a setTimeout with 0ms delay to move setState out of the immediate useEffect execution
    const timer = setTimeout(() => {
      setSpeechSupported(isSupported);
    }, 0);

    return () => {
      clearTimeout(timer);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [initializeSpeechRecognition]);

  // Focus input helper
  const focusInput = () => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // Initialize first quiz set
  useEffect(() => {
    if (userProgress.length >= 0 && !currentQuizSet) {
      startNewQuizSet();
    }
  }, [userProgress, currentQuizSet, startNewQuizSet]);

  // Focus input when component mounts or becomes active
  useEffect(() => {
    if (!showResult && !isQuizComplete && currentQuizSet) {
      focusInput();
    }
  }, [showResult, isQuizComplete, currentQuizSet]);

  const getCurrentQuestion = (): QuizQuestion | null => {
    if (
      !currentQuizSet ||
      currentQuestionIndex >= currentQuizSet.questions.length
    ) {
      return null;
    }
    return currentQuizSet.questions[currentQuestionIndex];
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
      focusInput();
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
    focusInput();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !showResult && userAnswer.trim()) {
      handleSubmitAnswer();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Allow Tab and Shift+Tab for accessibility
    if (e.key === 'Tab') {
      return;
    }
    // Skip with Escape key for better accessibility
    if (e.key === 'Escape' && !showResult) {
      e.preventDefault();
      handleSkipQuestion();
    }
  };

  const startListening = () => {
    if (recognitionRef.current && speechSupported && !showResult) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  // Calculate stats
  const totalSessions = localStats.totalSessions;
  const averageScore =
    localStats.totalAnswers > 0
      ? Math.round((localStats.correctAnswers / localStats.totalAnswers) * 100)
      : 0;

  const progressStats = userProgress.reduce(
    (acc, progress) => {
      const total = progress.correctCount + progress.incorrectCount;
      if (total === 0) {
        return acc;
      }

      const accuracy = progress.correctCount / total;
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
    const score = sessionResults.filter((r) => r.isCorrect).length;
    const accuracy = Math.round((score / sessionResults.length) * 100);

    return (
      <div className="p-4 space-y-6">
        {/* Quiz Complete Header */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200">
          <CardContent className="p-6 text-center">
            <div className="mb-4">
              {accuracy >= 80 ? (
                <Trophy className="h-12 w-12 text-yellow-500 mx-auto" />
              ) : accuracy >= 60 ? (
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto" />
              ) : (
                <Target className="h-12 w-12 text-blue-500 mx-auto" />
              )}
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              {translations.sessionComplete}
            </h2>
            <p className="text-lg text-gray-600 mb-4">
              {translations.score}:{score} /{sessionResults.length} ({accuracy}
              %)
            </p>
            <Button
              onClick={finishQuizSet}
              className="px-8"
              autoFocus
              aria-label="Start a new quiz set of 10 questions"
            >
              {translations.startQuiz}
            </Button>
          </CardContent>
        </Card>

        {/* Results Review */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-lg mb-4">Review Your Answers</h3>
            <div className="space-y-3">
              {sessionResults.map((result) => (
                <div
                  key={`${result.question.letter}-${result.userAnswer}`}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    result.isCorrect
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-lg font-bold w-8">
                      {result.question.letter}
                    </span>
                    <div>
                      <p className="font-medium">
                        {result.question.correctAnswer}
                      </p>
                      {!result.isCorrect && (
                        <p className="text-sm text-gray-600">
                          <span>
                            {translations.yourAnswer}
                            {': '}
                            {result.userAnswer}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                  <div>
                    {result.isCorrect && (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                    {!result.isCorrect && (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Progress Header - Clickable to show stats */}
      <Card
        className="bg-white shadow-material border border-gray-100 cursor-pointer hover:shadow-lg transition-shadow"
        onClick={() => setShowStats(!showStats)}
      >
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-lg">{translations.quiz}</h2>
            <span className="text-sm text-gray-400">
              {new Date().toLocaleDateString()}
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">
                {translations.learningProgress}
              </span>
              <span className="font-medium">
                {currentQuestionIndex + 1} of{' '}
                {currentQuizSet?.questions.length || 10}
              </span>
            </div>
            <Progress
              value={
                ((currentQuestionIndex + (showResult ? 1 : 0)) /
                  (currentQuizSet?.questions.length || 10)) *
                100
              }
              className="w-full h-2"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>
                {sessionResults.filter((r) => r.isCorrect).length}{' '}
                {translations.correct.toLowerCase()}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                {translations.adaptiveLearning}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Section - Shows when header is clicked */}
      {showStats && (
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-white shadow-material border border-gray-100">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary mb-1">
                {totalSessions}
              </div>
              <div className="text-sm text-gray-400">
                {translations.totalSessions}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-material border border-gray-100">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">
                {averageScore}%
              </div>
              <div className="text-sm text-gray-400">
                {translations.accuracy}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-material border border-gray-100 col-span-2">
            <CardContent className="p-4">
              <h4 className="font-semibold text-gray-800 mb-3">
                {translations.learningProgress}
              </h4>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>
                    {translations.learning}:{progressStats.learning}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>
                    {translations.review}:{progressStats.review}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>
                    {translations.mastered}:{progressStats.mastered}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Quiz Card */}
      <Card className="bg-white shadow-material border border-gray-100 overflow-hidden">
        <div className="bg-primary text-primary-foreground p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">
              Question {currentQuestionIndex + 1}
            </h3>
            <div className="text-sm">
              {currentQuestionIndex + 1} of{' '}
              {currentQuizSet?.questions.length || 10}
            </div>
          </div>
        </div>

        <CardContent className="p-6">
          {/* Question Display */}
          <div className="text-center mb-8">
            <p className="text-gray-600 mb-4">{translations.natoAlphabet}:</p>
            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <span className="text-4xl font-mono font-bold text-primary">
                {currentQuestion?.letter}
              </span>
            </div>
          </div>

          {/* Text Input */}
          <div className="space-y-4">
            <div>
              <label
                htmlFor="answer-input"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {translations.enterText}:
              </label>
              <div
                id="answer-instructions"
                className="text-xs text-gray-500 mb-2"
              >
                {translations.pressEnterToSubmit} •{' '}
                {translations.pressEscapeToSkip} •{translations.exampleAnswers}
              </div>
              <div className="relative">
                <Input
                  ref={inputRef}
                  id="answer-input"
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value.toLowerCase())}
                  onKeyPress={handleKeyPress}
                  onKeyDown={handleKeyDown}
                  placeholder={translations.placeholder}
                  className="w-full p-4 text-lg text-center pr-12"
                  disabled={showResult}
                  autoFocus
                  aria-label={`Type the NATO word for letter ${currentQuestion?.letter}`}
                  aria-describedby="answer-instructions"
                />
                {speechSupported && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className={`absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 ${
                      isListening ? 'text-red-500 bg-red-50' : 'text-gray-500'
                    }`}
                    onClick={isListening ? stopListening : startListening}
                    disabled={showResult}
                    aria-label={
                      isListening ? 'Stop voice input' : 'Start voice input'
                    }
                  >
                    {isListening ? (
                      <MicOff className="h-4 w-4" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                  </Button>
                )}
              </div>
            </div>

            {/* Hint Display */}
            {showHint && !showResult && currentQuestion && (
              <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800">
                <div className="flex items-center space-x-2">
                  <Lightbulb className="h-4 w-4" />
                  <p className="text-sm font-medium">
                    {translations.hint}:{' '}
                    {getHintForLetter(
                      currentQuestion.letter,
                      translations.natoHints
                    )}
                  </p>
                </div>
              </div>
            )}

            {showResult && (
              <div
                className={`p-4 rounded-lg border ${
                  checkAnswerVariants(
                    userAnswer,
                    currentQuestion?.correctAnswer || ''
                  )
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}
              >
                <p className="font-medium">
                  {checkAnswerVariants(
                    userAnswer,
                    currentQuestion?.correctAnswer || ''
                  )
                    ? translations.correct
                    : `${translations.correctAnswer}: ${currentQuestion?.correctAnswer}`}
                </p>
              </div>
            )}
          </div>

          {/* Quiz Actions */}
          <div className="mt-6 flex space-x-3">
            <Button
              variant="outline"
              className="flex-1"
              onClick={handleSkipQuestion}
              disabled={showResult}
            >
              {translations.skipQuestion}
            </Button>
            <Button
              className="flex-1"
              onClick={handleSubmitAnswer}
              disabled={!userAnswer.trim() || showResult}
            >
              {translations.submitAnswer}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Spaced Repetition Info */}
      <Card className="bg-green-50 border border-green-100">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Brain className="text-green-600 mt-1 h-5 w-5" />
            <div>
              <h4 className="font-semibold text-green-800 mb-1">
                {translations.adaptiveLearning}
              </h4>
              <p className="text-sm text-green-700 mb-2">
                {translations.spacedRepetitionDescription}
              </p>
              <div className="flex items-center space-x-4 text-xs">
                <Badge variant="secondary" className="bg-red-100 text-red-700">
                  {translations.learning}
                  &nbsp;(
                  {progressStats.learning})
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-yellow-100 text-yellow-700"
                >
                  {translations.review}
                  &nbsp;(
                  {progressStats.review})
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-700"
                >
                  {translations.mastered}
                  &nbsp;(
                  {progressStats.mastered})
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Study Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-white shadow-material border border-gray-100">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary mb-1">
              {totalSessions}
            </div>
            <div className="text-sm text-gray-600">
              {translations.totalSessions}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-material border border-gray-100">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {averageScore}%
            </div>
            <div className="text-sm text-gray-600">{translations.accuracy}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
