import type { Translations } from '@/lib/i18n';
import type { QuizQuestion } from '@/lib/spaced-repetition';
import { History } from 'lucide-react';
import { memo } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useQuizContext } from '@/hooks/use-quiz-context';
import { localizedQuestionCount } from './localised';
import { ResultsReview } from './results-review';

interface QuestionDisplayProps {
  letter: string;
  translations: Translations;
  currentQuestionIndex: number;
  totalQuestions: number;
  sessionResults?: Array<{
    question: QuizQuestion;
    userAnswer: string;
    isCorrect: boolean;
  }>;
}

// Empty array for default session results
const emptySessionResults: Array<{
  question: QuizQuestion;
  userAnswer: string;
  isCorrect: boolean;
}> = [];

export const QuestionDisplay = memo(
  ({
    letter,
    translations,
    currentQuestionIndex,
    totalQuestions,
    sessionResults = emptySessionResults,
  }: QuestionDisplayProps) => {
    const { sessionState, setShowReviewDialog } = useQuizContext();
    const { showReviewDialog } = sessionState;

    return (
      <>
        <div className="bg-primary text-primary-foreground p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">
              {translations.question} {currentQuestionIndex + 1}
            </h3>
            <div className="text-sm flex items-center space-x-2">
              <span>
                {localizedQuestionCount(
                  translations,
                  currentQuestionIndex + 1,
                  totalQuestions
                )}
              </span>
              {sessionResults.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowReviewDialog(true)}
                  className="ml-2 text-primary-foreground hover:text-primary-foreground/80"
                  title={
                    translations.reviewYourAnswers || 'Review Your Answers'
                  }
                >
                  <History className="h-4 w-4" />
                </Button>
              )}

              <Dialog
                open={showReviewDialog}
                onOpenChange={setShowReviewDialog}
              >
                <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>
                      {translations.reviewYourAnswers || 'Review Your Answers'}
                    </DialogTitle>
                  </DialogHeader>
                  <ResultsReview
                    sessionResults={sessionResults}
                    onFinish={() => setShowReviewDialog(false)}
                    translations={translations}
                    showCompletionHeader={false}
                  />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        <div className="text-center p-6">
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
