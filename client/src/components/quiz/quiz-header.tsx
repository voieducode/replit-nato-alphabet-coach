import type { Translations } from '@/lib/i18n';
import React, { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { localizedQuestionCount } from './localised';

interface QuizHeaderProps {
  currentQuestionIndex: number;
  totalQuestions: number;
  correctAnswers: number;
  showResult: boolean;
  toggleStats: () => void;
  translations: Translations;
}

export const QuizHeader = memo(
  ({
    currentQuestionIndex,
    totalQuestions,
    correctAnswers,
    showResult,
    toggleStats,
    translations,
  }: QuizHeaderProps) => {
    return (
      <Card
        className="bg-white shadow-material border border-gray-100 cursor-pointer hover:shadow-lg transition-shadow"
        onClick={toggleStats}
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
                {localizedQuestionCount(
                  translations,
                  currentQuestionIndex + 1,
                  totalQuestions
                )}
              </span>
            </div>
            <Progress
              value={
                ((currentQuestionIndex + (showResult ? 1 : 0)) /
                  totalQuestions) *
                100
              }
              className="w-full h-2"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>
                {correctAnswers} {translations.correct.toLowerCase()}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                {translations.adaptiveLearning}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
);

// Add displayName for better debugging
QuizHeader.displayName = 'QuizHeader';
