import type { Translations } from './translations/types';
import { translations } from './translations';

// Re-export the Translations type for convenience
export type { Translations };

export function getTranslations(lang: string): Translations {
  return translations[lang] || translations.en;
}

export function getCurrentLanguage(): string {
  try {
    const storedLang = localStorage.getItem('app-language');
    if (storedLang && translations[storedLang]) {
      return storedLang;
    }
    return 'en';
  } catch {
    return 'en';
  }
}

export function setCurrentLanguage(lang: string): void {
  try {
    localStorage.setItem('app-language', lang);
  } catch {
    // Silently fail if localStorage is not available
  }
}

// RTL language detection
const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'];

export function isRTLLanguage(lang: string): boolean {
  return RTL_LANGUAGES.includes(lang);
}

export function getLanguageDirection(lang: string): 'ltr' | 'rtl' {
  return isRTLLanguage(lang) ? 'rtl' : 'ltr';
}
