import type { WordEntry } from '@/lib/word-dictionary';
import type { WordMatchResult } from '@/lib/word-matching';
import { Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/hooks/use-language';
import { useSpeechSynthesis } from '@/hooks/use-speech-synthesis';
import { cn } from '@/lib/utils';
import { formatExpectedNATO } from '@/lib/word-matching';

interface QuizResultsProps {
  showResult: boolean;
  matchResult: WordMatchResult | null;
  isCompleted: boolean;
  currentWord: WordEntry;
}

export function QuizResults({
  showResult,
  matchResult,
  isCompleted,
  currentWord,
}: QuizResultsProps) {
  const { speak } = useSpeechSynthesis();
  const { translations } = useLanguage();

  const speakExpectedNATO = () => {
    const expectedNATO = formatExpectedNATO(currentWord.word);
    speak(`NATO alphabet for this word is: ${expectedNATO}`);
  };

  if (!showResult || !matchResult) {
    return null;
  }

  return (
    <Card
      className={cn(
        'border-2',
        isCompleted
          ? 'border-green-200 bg-green-50'
          : 'border-yellow-200 bg-yellow-50'
      )}
    >
      <CardHeader className="pb-3">
        <CardTitle
          className={cn(
            'text-center',
            isCompleted ? 'text-green-700' : 'text-yellow-700'
          )}
        >
          {isCompleted
            ? `🎉 ${translations.perfect}`
            : `📊 ${translations.results}`}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-3xl font-bold mb-2">
            {matchResult.percentage}%
          </div>
          <div className="text-sm text-gray-600">
            {matchResult.correctCount} of {matchResult.totalCount}{' '}
            {translations.correct}
          </div>
        </div>

        {/* Expected Answer */}
        <div className="bg-white p-3 rounded border">
          <div className="text-sm font-medium text-gray-700 mb-1">
            {translations.expectedNato}
          </div>
          <div className="font-mono text-sm">
            {formatExpectedNATO(currentWord.word)}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={speakExpectedNATO}
            className="mt-2"
          >
            <Volume2 className="h-3 w-3 mr-1" />
            {translations.play}
          </Button>
        </div>

        {/* Detailed Breakdown */}
        <div className="bg-white p-3 rounded border">
          <div className="text-sm font-medium text-gray-700 mb-2">
            {translations.letterByLetter}
          </div>
          <div className="grid grid-cols-1 gap-1 text-sm font-mono">
            {matchResult.matches.map((match, index) => (
              <div
                // eslint-disable-next-line react/no-array-index-key
                key={`${match.originalLetter}-${index}`}
                className={cn(
                  'flex justify-between items-center p-1 rounded',
                  match.isCorrect
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                )}
              >
                <span className="font-bold">{match.originalLetter}:</span>
                <span>{match.expectedNato}</span>
                <span
                  className={
                    match.isCorrect ? 'text-green-600' : 'text-red-600'
                  }
                >
                  {match.isCorrect ? '✓' : '✗'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
