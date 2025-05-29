import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Trophy, Brain, Target, CheckCircle, XCircle, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { natoAlphabet } from "@/lib/nato-alphabet";
import { generateQuizSet, checkAnswerVariants, getHintForLetter, type QuizQuestion, type QuizSet } from "@/lib/spaced-repetition";
import { getUserStats, updateUserStats, getUserProgressLocal, updateUserProgressLocal } from "@/lib/storage";
import type { UserProgress, QuizSession } from "@shared/schema";

interface QuizSectionProps {
  userId: string;
}

export default function QuizSection({ userId }: QuizSectionProps) {
  const [currentQuizSet, setCurrentQuizSet] = useState<QuizSet | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState("");
  const [showResult, setShowResult] = useState(false);
  const [sessionResults, setSessionResults] = useState<Array<{question: QuizQuestion, userAnswer: string, isCorrect: boolean}>>([]);
  const [isActive, setIsActive] = useState(false);
  const [isQuizComplete, setIsQuizComplete] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hintTimer, setHintTimer] = useState(0);
  const [showStats, setShowStats] = useState(false);
  const [localStats, setLocalStats] = useState(getUserStats());
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Fetch user progress
  const { data: userProgress = [] } = useQuery<UserProgress[]>({
    queryKey: [`/api/progress/${userId}`],
  });

  // Fetch quiz sessions for stats
  const { data: quizSessions = [] } = useQuery<QuizSession[]>({
    queryKey: [`/api/quiz-sessions/${userId}`],
  });

  // Update progress mutation
  const updateProgressMutation = useMutation({
    mutationFn: async ({ letter, isCorrect }: { letter: string; isCorrect: boolean }) => {
      const response = await fetch(`/api/progress/${userId}/${letter}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isCorrect }),
      });
      if (!response.ok) throw new Error("Failed to update progress");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/progress/${userId}`] });
    },
  });

  // Save quiz session mutation
  const saveSessionMutation = useMutation({
    mutationFn: async ({ score, totalQuestions }: { score: number; totalQuestions: number }) => {
      const response = await fetch("/api/quiz-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, score, totalQuestions }),
      });
      if (!response.ok) throw new Error("Failed to save session");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/quiz-sessions/${userId}`] });
    },
  });

  // Hint timer effect - show hint after 5 seconds
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (isActive && !showResult) {
      intervalId = setInterval(() => {
        setHintTimer(timer => {
          if (timer >= 5 && !showHint) {
            setShowHint(true);
          }
          return timer + 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalId);
  }, [isActive, showResult, showHint]);

  // Focus input helper
  const focusInput = () => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // Start new quiz set
  const startNewQuizSet = () => {
    const newQuizSet = generateQuizSet(userProgress, 10);
    setCurrentQuizSet(newQuizSet);
    setCurrentQuestionIndex(0);
    setUserAnswer("");
    setShowResult(false);
    setSessionResults([]);
    setIsQuizComplete(false);
    setShowHint(false);
    setHintTimer(0);
    setIsActive(true);
    focusInput();
  };

  // Initialize first quiz set
  useEffect(() => {
    if (userProgress.length >= 0 && !currentQuizSet) {
      startNewQuizSet();
    }
  }, [userProgress, currentQuizSet]);

  // Focus input when component mounts or becomes active
  useEffect(() => {
    if (!showResult && !isQuizComplete && currentQuizSet) {
      focusInput();
    }
  }, [showResult, isQuizComplete, currentQuizSet]);

  const getCurrentQuestion = (): QuizQuestion | null => {
    if (!currentQuizSet || currentQuestionIndex >= currentQuizSet.questions.length) {
      return null;
    }
    return currentQuizSet.questions[currentQuestionIndex];
  };

  const handleSubmitAnswer = async () => {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion || !userAnswer.trim()) return;

    setIsActive(false);
    setShowResult(true);

    const isCorrect = checkAnswerVariants(userAnswer, currentQuestion.correctAnswer);
    
    // Add to session results
    const newResult = {
      question: currentQuestion,
      userAnswer: userAnswer.trim(),
      isCorrect,
    };
    setSessionResults(prev => [...prev, newResult]);

    if (isCorrect) {
      toast({
        title: "Correct!",
        description: `${currentQuestion.letter} is indeed ${currentQuestion.correctAnswer}`,
      });
    } else {
      toast({
        title: "Incorrect",
        description: `${currentQuestion.letter} is ${currentQuestion.correctAnswer}, not ${userAnswer}`,
        variant: "destructive",
      });
    }

    // Update progress
    await updateProgressMutation.mutateAsync({
      letter: currentQuestion.letter,
      isCorrect,
    });

    // Auto-advance after 2 seconds
    setTimeout(() => {
      if (currentQuestionIndex + 1 >= (currentQuizSet?.questions.length || 0)) {
        // Quiz set complete
        setIsQuizComplete(true);
        setIsActive(false);
      } else {
        // Next question
        setCurrentQuestionIndex(prev => prev + 1);
        setUserAnswer("");
        setShowResult(false);
        setShowHint(false);
        setHintTimer(0);
        setIsActive(true);
        focusInput();
      }
    }, 2000);
  };

  const handleSkipQuestion = () => {
    const currentQuestion = getCurrentQuestion();
    if (!currentQuestion) return;
    
    setIsActive(false);
    updateProgressMutation.mutate({
      letter: currentQuestion.letter,
      isCorrect: false,
    });

    // Add skip to results
    setSessionResults(prev => [...prev, {
      question: currentQuestion,
      userAnswer: "(skipped)",
      isCorrect: false,
    }]);
    
    if (currentQuestionIndex + 1 >= (currentQuizSet?.questions.length || 0)) {
      setIsQuizComplete(true);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
      setUserAnswer("");
      setShowResult(false);
      setShowHint(false);
      setHintTimer(0);
      focusInput();
    }
  };

  const finishQuizSet = () => {
    if (sessionResults.length > 0) {
      const score = sessionResults.filter(r => r.isCorrect).length;
      saveSessionMutation.mutate({
        score,
        totalQuestions: sessionResults.length,
      });
    }
    
    // Start new quiz set
    startNewQuizSet();
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

  // Calculate stats
  const totalSessions = quizSessions.length;
  const averageScore = totalSessions > 0 
    ? Math.round(quizSessions.reduce((sum, session) => sum + (session.score / session.totalQuestions * 100), 0) / totalSessions)
    : 0;

  const progressStats = userProgress.reduce((acc, progress) => {
    const total = progress.correctCount + progress.incorrectCount;
    if (total === 0) return acc;
    
    const accuracy = progress.correctCount / total;
    if (accuracy >= 0.8) acc.mastered++;
    else if (accuracy >= 0.5) acc.review++;
    else acc.learning++;
    
    return acc;
  }, { learning: 0, review: 0, mastered: 0 });

  const currentStreak = Math.min(7, totalSessions); // Simplified streak calculation
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
    const score = sessionResults.filter(r => r.isCorrect).length;
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
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Quiz Set Complete!</h2>
            <p className="text-lg text-gray-600 mb-4">
              You scored {score} out of {sessionResults.length} ({accuracy}%)
            </p>
            <Button 
              onClick={finishQuizSet} 
              className="px-8"
              autoFocus
              aria-label="Start a new quiz set of 10 questions"
            >
              Start New Quiz Set
            </Button>
          </CardContent>
        </Card>

        {/* Results Review */}
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold text-lg mb-4">Review Your Answers</h3>
            <div className="space-y-3">
              {sessionResults.map((result, index) => (
                <div 
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    result.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-mono text-lg font-bold w-8">
                      {result.question.letter}
                    </span>
                    <div>
                      <p className="font-medium">{result.question.correctAnswer}</p>
                      {!result.isCorrect && (
                        <p className="text-sm text-gray-600">
                          Your answer: {result.userAnswer}
                        </p>
                      )}
                    </div>
                  </div>
                  {result.isCorrect ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
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
      <Card className="bg-white shadow-material border border-gray-100 cursor-pointer hover:shadow-lg transition-shadow" onClick={() => setShowStats(!showStats)}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-lg">Quiz Set Practice</h2>
            <span className="text-sm text-gray-600">
              {new Date().toLocaleDateString()}
            </span>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Quiz Progress</span>
              <span className="font-medium">
                {currentQuestionIndex + 1} of {currentQuizSet?.questions.length || 10}
              </span>
            </div>
            <Progress 
              value={((currentQuestionIndex + (showResult ? 1 : 0)) / (currentQuizSet?.questions.length || 10)) * 100} 
              className="w-full h-2"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{sessionResults.filter(r => r.isCorrect).length} correct so far</span>
              <span>{currentStreak} day streak</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Section - Shows when header is clicked */}
      {showStats && (
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-white shadow-material border border-gray-100">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary mb-1">{totalSessions}</div>
              <div className="text-sm text-gray-600">Quiz Sets</div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-material border border-gray-100">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">{averageScore}%</div>
              <div className="text-sm text-gray-600">Average Score</div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-material border border-gray-100 col-span-2">
            <CardContent className="p-4">
              <h4 className="font-semibold text-gray-800 mb-3">Learning Progress</h4>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>Learning: {progressStats.learning}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span>Review: {progressStats.review}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Mastered: {progressStats.mastered}</span>
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
            <h3 className="font-semibold">Question {currentQuestionIndex + 1}</h3>
            <div className="text-sm">
              {currentQuestionIndex + 1} of {currentQuizSet?.questions.length || 10}
            </div>
          </div>
        </div>
        
        <CardContent className="p-6">
          {/* Question Display */}
          <div className="text-center mb-8">
            <p className="text-gray-600 mb-4">What NATO word represents:</p>
            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <span className="text-4xl font-mono font-bold text-primary">
                {currentQuestion?.letter}
              </span>
            </div>
          </div>

          {/* Text Input */}
          <div className="space-y-4">
            <div>
              <label htmlFor="answer-input" className="block text-sm font-medium text-gray-700 mb-2">
                Type your answer:
              </label>
              <div id="answer-instructions" className="text-xs text-gray-500 mb-2">
                Press Enter to submit • Press Escape to skip • Accepts variations like "whisky"
              </div>
              <Input
                ref={inputRef}
                id="answer-input"
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value.toLowerCase())}
                onKeyPress={handleKeyPress}
                onKeyDown={handleKeyDown}
                placeholder="Enter NATO word (e.g., alpha, bravo...)"
                className="w-full p-4 text-lg text-center"
                disabled={showResult}
                autoFocus
                aria-label={`Type the NATO word for letter ${currentQuestion?.letter}`}
                aria-describedby="answer-instructions"
              />
            </div>
            
            {/* Hint Display */}
            {showHint && !showResult && currentQuestion && (
              <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800">
                <div className="flex items-center space-x-2">
                  <Lightbulb className="h-4 w-4" />
                  <p className="text-sm font-medium">
                    Hint: {getHintForLetter(currentQuestion.letter)}
                  </p>
                </div>
              </div>
            )}

            {showResult && (
              <div className={`p-4 rounded-lg border ${
                checkAnswerVariants(userAnswer, currentQuestion?.correctAnswer || '') 
                  ? 'bg-green-50 border-green-200 text-green-800' 
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                <p className="font-medium">
                  {checkAnswerVariants(userAnswer, currentQuestion?.correctAnswer || '') 
                    ? 'Correct!' 
                    : `Correct answer: ${currentQuestion?.correctAnswer}`}
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
              Skip
            </Button>
            <Button
              className="flex-1"
              onClick={handleSubmitAnswer}
              disabled={!userAnswer.trim() || showResult}
            >
              Submit
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
              <h4 className="font-semibold text-green-800 mb-1">Adaptive Learning</h4>
              <p className="text-sm text-green-700 mb-2">
                Each quiz set of 10 questions adapts based on your performance using spaced repetition.
              </p>
              <div className="flex items-center space-x-4 text-xs">
                <Badge variant="secondary" className="bg-red-100 text-red-700">
                  Learning ({progressStats.learning})
                </Badge>
                <Badge variant="secondary" className="bg-yellow-100 text-yellow-700">
                  Review ({progressStats.review})
                </Badge>
                <Badge variant="secondary" className="bg-green-100 text-green-700">
                  Mastered ({progressStats.mastered})
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
            <div className="text-2xl font-bold text-primary mb-1">{totalSessions}</div>
            <div className="text-sm text-gray-600">Quiz Sets</div>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-material border border-gray-100">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">{averageScore}%</div>
            <div className="text-sm text-gray-600">Average Score</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
