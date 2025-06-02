import type { Translations } from '../lib/i18n';

export interface LanguageContextType {
  language: string;
  translations: Translations;
  isRTL: boolean;
  direction: 'ltr' | 'rtl';
  setLanguage: (lang: string) => void;
}
