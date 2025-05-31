import type { ThemeContextType } from './theme-context-types';
import { createContext } from 'react';

export const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);
