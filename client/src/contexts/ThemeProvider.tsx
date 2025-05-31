import type { Theme } from './theme-context-types';
import React, { useEffect, useState } from 'react';
import { ThemeContext } from './theme-context';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Initialize theme from localStorage
  const initializeTheme = React.useCallback(() => {
    const stored = localStorage.getItem('theme') as Theme;
    if (
      stored &&
      ['light', 'dark', 'rainbow', 'nato', 'system'].includes(stored)
    ) {
      return stored;
    }
    return 'system';
  }, []);

  const [theme, setTheme] = useState<Theme>(initializeTheme);
  const [actualTheme, setActualTheme] = useState<
    'light' | 'dark' | 'rainbow' | 'nato'
  >('light');

  // Save theme to localStorage when changed
  useEffect(() => {
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Determine the resolved theme based on system preference
  const resolveTheme = React.useCallback(
    (currentTheme: Theme): 'light' | 'dark' | 'rainbow' | 'nato' => {
      if (currentTheme === 'system') {
        return window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
      }
      return currentTheme;
    },
    []
  );

  // Handle system theme detection and apply themes
  const updateActualTheme = React.useCallback(
    (resolvedTheme: 'light' | 'dark' | 'rainbow' | 'nato') => {
      setActualTheme(resolvedTheme);
    },
    []
  );

  const applyTheme = React.useCallback(
    (currentTheme: Theme) => {
      const root = document.documentElement;
      // Remove all theme classes
      root.classList.remove('light', 'dark', 'rainbow', 'nato');

      const resolvedTheme = resolveTheme(currentTheme);
      root.classList.add(resolvedTheme);

      // Update state via callback
      updateActualTheme(resolvedTheme);
    },
    [resolveTheme, updateActualTheme]
  );

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleSystemThemeChange = (_e: MediaQueryListEvent) => {
      if (theme === 'system') {
        applyTheme(theme);
      }
    };

    applyTheme(theme);
    mediaQuery.addEventListener('change', handleSystemThemeChange);

    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [theme, applyTheme]);

  const contextValue = React.useMemo(
    () => ({ theme, setTheme, actualTheme }),
    [theme, setTheme, actualTheme]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};
