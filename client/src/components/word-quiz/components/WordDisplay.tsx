import type { WordEntry } from '@/lib/word-dictionary';
import type { WordMatchResult } from '@/lib/word-matching';
import { Volume2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useLanguage } from '@/hooks/use-language';
import { useSpeechSynthesis } from '@/hooks/use-speech-synthesis';
import { cn } from '@/lib/utils';

interface WordDisplayProps {
  currentWord: WordEntry;
  isCustomMode: boolean;
  matchResult?: WordMatchResult | null;
  showResult?: boolean;
}

export function WordDisplay({
  currentWord,
  isCustomMode,
  matchResult,
  showResult,
}: WordDisplayProps) {
  const { speak } = useSpeechSynthesis();
  const { translations } = useLanguage();

  const speakCurrentWord = () => {
    const letters = currentWord.word.split('').join(' ');
    const phrase = translations.currentWordSpeech.replace('{word}', letters);
    speak(phrase);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-center flex items-center justify-center gap-2">
          {translations.currentWordLabel}
          <Button
            variant="ghost"
            size="sm"
            onClick={speakCurrentWord}
            className="h-8 w-8 p-0"
          >
            <Volume2 className="h-4 w-4" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center">
          <div className="text-4xl font-bold tracking-wider mb-2 font-mono bg-gray-50 p-4 rounded-lg">
            {currentWord.word.split('').map((letter, index) => {
              // Get the color for this letter based on match results
              let letterColor = 'text-gray-800'; // default color

              if (matchResult && !showResult) {
                const match = matchResult.matches[index];
                if (match) {
                  if (match.isCorrect) {
                    letterColor = 'text-green-600';
                  } else if (match.userNato) {
                    letterColor = 'text-red-600';
                  } else {
                    letterColor = 'text-gray-400';
                  }
                }
              }

              return (
                <span
                  // eslint-disable-next-line react/no-array-index-key
                  key={`${letter}-${index}`}
                  className={cn('transition-colors duration-200', letterColor)}
                >
                  {letter}
                </span>
              );
            })}
          </div>
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Badge variant="outline" className="capitalize">
              {translations.difficultyLabels[currentWord.difficulty] ||
                currentWord.difficulty}
            </Badge>
            {currentWord.category && (
              <Badge variant="secondary" className="capitalize">
                {translations.categoryLabels[currentWord.category] ||
                  currentWord.category}
              </Badge>
            )}
            {isCustomMode && (
              <Badge variant="secondary">{translations.customWordLabel}</Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
