import type { WordEntry } from '@/lib/word-dictionary';
import type { WordMatchResult } from '@/lib/word-matching';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  getRandomWord,
  isValidWordInput,
  normalizeWordInput,
} from '@/lib/word-dictionary';
import { matchWordToNATO } from '@/lib/word-matching';

export function useWordQuiz() {
  const [currentWord, setCurrentWord] = useState<WordEntry | null>(() =>
    getRandomWord()
  );
  const [customWordInput, setCustomWordInput] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [userNATOInput, setUserNATOInput] = useState('');
  const [matchResult, setMatchResult] = useState<WordMatchResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const { toast } = useToast();

  const generateNewWord = () => {
    const newWord = getRandomWord();
    setCurrentWord(newWord);
    setUserNATOInput('');
    setMatchResult(null);
    setShowResult(false);
    setIsCompleted(false);
    setIsCustomMode(false);
    setCustomWordInput('');
  };

  const handleCustomWord = () => {
    if (!customWordInput.trim()) {
      toast({
        title: 'Invalid Input',
        description: 'Please enter a word or phrase.',
        variant: 'destructive',
      });
      return;
    }

    if (!isValidWordInput(customWordInput)) {
      toast({
        title: 'Invalid Characters',
        description: 'Please use only letters, numbers, and spaces.',
        variant: 'destructive',
      });
      return;
    }

    const normalizedWord = normalizeWordInput(customWordInput);
    const customWordEntry: WordEntry = {
      word: normalizedWord,
      difficulty:
        normalizedWord.length <= 5
          ? 'easy'
          : normalizedWord.length <= 8
            ? 'medium'
            : 'hard',
    };

    setCurrentWord(customWordEntry);
    setUserNATOInput('');
    setMatchResult(null);
    setShowResult(false);
    setIsCompleted(false);
    setIsCustomMode(true);
    setCustomWordInput('');
  };

  const checkAnswer = () => {
    if (!currentWord || !userNATOInput.trim()) {
      toast({
        title: 'No Input',
        description:
          'Please enter the NATO alphabet words for the current word.',
        variant: 'destructive',
      });
      return;
    }

    const result = matchWordToNATO(currentWord.word, userNATOInput);
    setMatchResult(result);
    setShowResult(true);
    setIsCompleted(result.percentage === 100);

    return result;
  };

  const retryCurrentWord = () => {
    setUserNATOInput('');
    setMatchResult(null);
    setShowResult(false);
    setIsCompleted(false);
  };

  return {
    // State
    currentWord,
    customWordInput,
    isCustomMode,
    userNATOInput,
    matchResult,
    showResult,
    isCompleted,

    // Actions
    generateNewWord,
    handleCustomWord,
    checkAnswer,
    retryCurrentWord,
    setCustomWordInput,
    setUserNATOInput,
    setIsCustomMode,
    setMatchResult,
  };
}
