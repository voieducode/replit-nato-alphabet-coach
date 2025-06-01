import type { Translations } from '@/lib/i18n';
import type { QuizQuestion } from '@/lib/spaced-repetition';
import React, { memo } from 'react';
import { Card } from '@/components/ui/card';
import { AnswerInput } from './answer-input';
import { QuestionDisplay } from './question-display';

interface QuizCardProps {
  currentQuestion: QuizQuestion;
  currentQuestionIndex: number;
  totalQuestions: number;
  userAnswer: string;
  setUserAnswer: (answer: string) => void;
  showResult: boolean;
  showHint: boolean;
  onSubmitAnswer: () => void;
  onSkipQuestion: () => void;
  translations: Translations;
}

export const QuizCard = memo(
  ({
    currentQuestion,
    currentQuestionIndex,
    totalQuestions,
    userAnswer,
    setUserAnswer,
    showResult,
    showHint,
    onSubmitAnswer,
    onSkipQuestion,
    translations,
  }: QuizCardProps) => {
    return (
      <Card className="bg-white shadow-material border border-gray-100 overflow-hidden">
        <QuestionDisplay
          letter={currentQuestion.letter}
          translations={translations}
          currentQuestionIndex={currentQuestionIndex}
          totalQuestions={totalQuestions}
        />

        <div className="p-6">
          <AnswerInput
            letter={currentQuestion.letter}
            correctAnswer={currentQuestion.correctAnswer}
            userAnswer={userAnswer}
            setUserAnswer={setUserAnswer}
            showResult={showResult}
            showHint={showHint}
            onSubmitAnswer={onSubmitAnswer}
            onSkipQuestion={onSkipQuestion}
            translations={translations}
          />
        </div>
      </Card>
    );
  }
);

// Add displayName for better debugging
QuizCard.displayName = 'QuizCard';
