import type { Translations } from '@/lib/i18n';
import { Button } from '@/components/ui/button';

interface QuizActionButtonsProps {
  onSubmitAnswer: () => void;
  onSkipQuestion: () => void;
  showResult: boolean;
  userAnswer: string;
  translations: Translations;
}

export function QuizActionButtons({
  onSubmitAnswer,
  onSkipQuestion,
  showResult,
  userAnswer,
  translations,
}: QuizActionButtonsProps) {
  return (
    <div className="mt-6 flex space-x-3">
      <Button
        variant="outline"
        className="flex-1"
        onClick={onSkipQuestion}
        disabled={showResult}
      >
        {translations.skipQuestion}
      </Button>
      <Button
        className="flex-1"
        onClick={onSubmitAnswer}
        disabled={!userAnswer.trim() || showResult}
      >
        {translations.submitAnswer}
      </Button>
    </div>
  );
}
