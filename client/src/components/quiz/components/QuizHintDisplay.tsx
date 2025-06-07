import type { Translations } from '@/lib/i18n';
import { Lightbulb } from 'lucide-react';
import { getHintForLetter } from '@/lib/spaced-repetition';

interface QuizHintDisplayProps {
  letter: string;
  showHint: boolean;
  showResult: boolean;
  translations: Translations;
}

export function QuizHintDisplay({
  letter,
  showHint,
  showResult,
  translations,
}: QuizHintDisplayProps) {
  if (!showHint || showResult) {
    return null;
  }

  return (
    <div className="p-3 rounded-lg bg-info border border-yellow-200 text-info-foreground">
      <div className="flex items-center space-x-2">
        <Lightbulb className="h-4 w-4" />
        <p className="text-sm font-medium">
          {translations.hint}:{' '}
          {getHintForLetter(letter, translations.natoHints)}
        </p>
      </div>
    </div>
  );
}
