import type { ReactNode } from 'react';
import type { LanguageContextType } from './language-context-types';
import { createContext, useCallback, useMemo, useState } from 'react';
import {
  getCurrentLanguage,
  getTranslations,
  setCurrentLanguage,
} from '../lib/i18n';

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
);

export { LanguageContext };

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState(() => getCurrentLanguage());
  const [translations, setTranslations] = useState(() =>
    getTranslations(getCurrentLanguage())
  );

  const setLanguage = useCallback((lang: string) => {
    setLanguageState(lang);
    setCurrentLanguage(lang);
    setTranslations(getTranslations(lang));
  }, []);

  const contextValue = useMemo(
    () => ({ language, translations, setLanguage }),
    [language, translations, setLanguage]
  );

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}
