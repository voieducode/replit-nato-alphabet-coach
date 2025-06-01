import type { QuizContextType } from './quiz-context-types';
import { createContext } from 'react';

export const QuizContext = createContext<QuizContextType | undefined>(
  undefined
);
