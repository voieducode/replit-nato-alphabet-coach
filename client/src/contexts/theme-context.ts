
import type { ThemeContextType } from './theme-context-types';
import { createContext, useContext } from 'react';

export const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export { ThemeProvider } from './ThemeProvider';
export type { Theme, ThemeContextType } from './theme-context-types';
