import type { QuizContextType } from '@/contexts/quiz-context-types';
import { useContext } from 'react';
import { QuizContext } from '@/contexts/quiz-context';

export function useQuizContext(): QuizContextType {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error('useQuizContext must be used within a QuizProvider');
  }
  return context;
}
