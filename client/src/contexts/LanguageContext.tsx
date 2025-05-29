import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getTranslations, getCurrentLanguage, setCurrentLanguage, Translations } from '@/lib/i18n';

interface LanguageContextType {
  language: string;
  translations: Translations;
  setLanguage: (lang: string) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState(getCurrentLanguage);
  const [translations, setTranslations] = useState(getTranslations(language));

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    setCurrentLanguage(lang);
    setTranslations(getTranslations(lang));
  };

  useEffect(() => {
    setTranslations(getTranslations(language));
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, translations, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}