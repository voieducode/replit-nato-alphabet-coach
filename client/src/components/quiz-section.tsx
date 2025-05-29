import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Clock, Trophy, Brain, Target, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { natoAlphabet } from "@/lib/nato-alphabet";
import { generateQuizSet, checkAnswerVariants, type QuizQuestion, type QuizSet } from "@/lib/spaced-repetition";
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
  const [timer, setTimer] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isQuizComplete, setIsQuizComplete] = useState(false);
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

  // Timer effect
  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    if (isActive) {
      intervalId = setInterval(() => setTimer(timer => timer + 1), 1000);
    }
    return () => clearInterval(intervalId);
  }, [isActive]);

  // Start new quiz set
  const startNewQuizSet = () => {
    const newQuizSet = generateQuizSet(userProgress, 10);
    setCurrentQuizSet(newQuizSet);
    setCurrentQuestionIndex(0);
    setUserAnswer("");
    setShowResult(false);
    setSessionResults([]);
    setIsQuizComplete(false);
    setTimer(0);
    setIsActive(true);
  };

  // Initialize first quiz set
  useEffect(() => {
    if (userProgress.length >= 0 && !currentQuizSet) {
      startNewQuizSet();
    }
  }, [userProgress, currentQuizSet]);

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
        setIsActive(true);
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

  return (
    <div className="p-4 space-y-6">
      {/* Progress Header */}
      <Card className="bg-white shadow-material border border-gray-100">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-lg">Daily Practice</h2>
            <span className="text-sm text-gray-600">
              {new Date().toLocaleDateString()}
            </span>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Session Progress</span>
              <span className="font-medium">
                {sessionTotal > 0 ? Math.round((sessionScore / sessionTotal) * 100) : 0}%
              </span>
            </div>
            <Progress 
              value={sessionTotal > 0 ? (sessionScore / sessionTotal) * 100 : 0} 
              className="w-full h-2"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>{sessionScore}/{sessionTotal} correct</span>
              <span>{currentStreak} day streak 🔥</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quiz Card */}
      <Card className="bg-white shadow-material border border-gray-100 overflow-hidden">
        <div className="bg-primary text-primary-foreground p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Question {sessionTotal + 1}</h3>
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4" />
              <span className="text-sm">
                {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>
        
        <CardContent className="p-6">
          {/* Question Display */}
          <div className="text-center mb-8">
            <p className="text-gray-600 mb-4">What NATO word represents:</p>
            <div className="bg-blue-50 rounded-lg p-6 mb-6">
              <span className="text-4xl font-mono font-bold text-primary">
                {currentQuestion.letter}
              </span>
            </div>
          </div>

          {/* Answer Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option) => {
              let buttonClass = "w-full p-4 border-2 border-gray-200 rounded-lg text-left transition-all";
              
              if (showResult) {
                if (option === currentQuestion.correctAnswer) {
                  buttonClass += " border-green-500 bg-green-50 text-green-700";
                } else if (option === selectedAnswer && option !== currentQuestion.correctAnswer) {
                  buttonClass += " border-red-500 bg-red-50 text-red-700";
                } else {
                  buttonClass += " opacity-50";
                }
              } else if (selectedAnswer === option) {
                buttonClass += " border-primary bg-blue-50";
              } else {
                buttonClass += " hover:border-primary/50 hover:bg-blue-50";
              }

              return (
                <button
                  key={option}
                  className={buttonClass}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={showResult}
                >
                  <span className="font-medium">{option}</span>
                </button>
              );
            })}
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
              disabled={!selectedAnswer || showResult}
            >
              Submit
            </Button>
          </div>

          {sessionTotal >= 5 && (
            <Button
              variant="outline"
              className="w-full mt-3"
              onClick={finishSession}
            >
              Finish Session
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Spaced Repetition Info */}
      <Card className="bg-green-50 border border-green-100">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Brain className="text-green-600 mt-1 h-5 w-5" />
            <div>
              <h4 className="font-semibold text-green-800 mb-1">Spaced Repetition</h4>
              <p className="text-sm text-green-700 mb-2">
                Letters you miss will appear more frequently until mastered.
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
            <div className="text-sm text-gray-600">Sessions</div>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-material border border-gray-100">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">{averageScore}%</div>
            <div className="text-sm text-gray-600">Accuracy</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
