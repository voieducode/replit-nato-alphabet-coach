import type { WordEntry } from '@/lib/word-dictionary';
import type { WordMatchResult } from '@/lib/word-matching';
import { useEffect } from 'react';
import { getRealTimeMatch } from '@/lib/word-matching';

interface UseRealTimeMatchingProps {
  currentWord: WordEntry | null;
  userNATOInput: string;
  showResult: boolean;
  setMatchResult: (result: WordMatchResult | null) => void;
}

export function useRealTimeMatching({
  currentWord,
  userNATOInput,
  showResult,
  setMatchResult,
}: UseRealTimeMatchingProps) {
  useEffect(() => {
    if (currentWord && userNATOInput && !showResult) {
      const realTimeResult = getRealTimeMatch(currentWord.word, userNATOInput);
      // Update with partial matching for live feedback
      setMatchResult({
        score: realTimeResult.matches.filter((m) => m.isCorrect).length,
        percentage: Math.round(
          (realTimeResult.matches.filter((m) => m.isCorrect).length /
            realTimeResult.matches.length) *
            100
        ),
        correctCount: realTimeResult.matches.filter((m) => m.isCorrect).length,
        totalCount: realTimeResult.matches.length,
        matches: realTimeResult.matches,
      });
    }
  }, [userNATOInput, currentWord, showResult, setMatchResult]);
}
