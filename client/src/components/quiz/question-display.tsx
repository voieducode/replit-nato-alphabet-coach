import type { Translations } from '@/lib/i18n';
import { memo } from 'react';
import { localizedQuestionCount } from './localised';

interface QuestionDisplayProps {
  letter: string;
  translations: Translations;
  currentQuestionIndex: number;
  totalQuestions: number;
}

export const QuestionDisplay = memo(
  ({
    letter,
    translations,
    currentQuestionIndex,
    totalQuestions,
  }: QuestionDisplayProps) => {
    return (
      <>
        <div className="bg-primary text-primary-foreground p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">
              {translations.question} {currentQuestionIndex + 1}
            </h3>
            <div className="text-sm">
              {localizedQuestionCount(
                translations,
                currentQuestionIndex + 1,
                totalQuestions
              )}
            </div>
          </div>
        </div>

        <div className="text-center mb-8 p-6">
          <p className="text-gray-600 mb-4">{translations.natoAlphabet}:</p>
          <div className="bg-blue-50 rounded-lg p-6 mb-6">
            <span className="text-4xl font-mono font-bold text-primary">
              {letter}
            </span>
          </div>
        </div>
      </>
    );
  }
);

// Add displayName for better debugging
QuestionDisplay.displayName = 'QuestionDisplay';
