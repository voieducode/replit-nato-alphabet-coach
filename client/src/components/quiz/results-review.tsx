import type { Translations } from '@/lib/i18n';
import type { QuizQuestion } from '@/lib/spaced-repetition';
import { CheckCircle, Target, Trophy, XCircle } from 'lucide-react';
import React, { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface SessionResult {
  question: QuizQuestion;
  userAnswer: string;
  isCorrect: boolean;
}

interface ResultsReviewProps {
  sessionResults: SessionResult[];
  onFinish: () => void;
  translations: Translations;
}

export const ResultsReview = memo(
  ({ sessionResults, onFinish, translations }: ResultsReviewProps) => {
    const score = sessionResults.filter((r) => r.isCorrect).length;
    const accuracy = Math.round((score / sessionResults.length) * 100);

    return (
      <div className="p-4 space-y-6">
        {/* Quiz Complete Header */}
        <Card className="bg-linear-to-r from-green-50 to-blue-50 border border-green-200">
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
              onClick={onFinish}
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
            <h3 className="font-semibold text-lg mb-4">
              {translations.reviewYourAnswers}
            </h3>
            <div className="space-y-3 text-primary">
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
);

// Add displayName for better debugging
ResultsReview.displayName = 'ResultsReview';
