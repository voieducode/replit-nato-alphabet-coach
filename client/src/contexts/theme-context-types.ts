export type Theme = 'light' | 'dark' | 'rainbow' | 'nato' | 'system';

export interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  actualTheme: 'light' | 'dark' | 'rainbow' | 'nato'; // The resolved theme (system becomes light/dark)
}
