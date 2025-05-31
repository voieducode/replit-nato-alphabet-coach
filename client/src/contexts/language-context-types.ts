import type { Translations } from '../lib/i18n';

export interface LanguageContextType {
  language: string;
  translations: Translations;
  setLanguage: (lang: string) => void;
}
