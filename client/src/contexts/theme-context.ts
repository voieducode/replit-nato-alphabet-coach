/**
 * Theme Context - Central module for theme-related functionality
 *
 * This file exports:
 * - ThemeContext - React context for themes
 * - useTheme hook - For components to consume theme data
 * - ThemeProvider component - To provide theme to the app
 * - Theme and ThemeContextType types - For TypeScript support
 */
import type { ThemeContextType } from './theme-context-types';
import { createContext, useContext } from 'react';

export const ThemeContext = createContext<ThemeContextType | undefined>(
  undefined
);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

export type { Theme, ThemeContextType } from './theme-context-types';
export { ThemeProvider } from './theme-provider';
