import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { 
  getTranslations, 
  getCurrentLanguage, 
  setCurrentLanguage 
} from '../i18n'

describe('Internationalization Functions', () => {
  let originalLanguage: string

  beforeEach(() => {
    originalLanguage = getCurrentLanguage()
  })

  afterEach(() => {
    setCurrentLanguage(originalLanguage)
    localStorage.clear()
  })

  describe('getTranslations', () => {
    it('should return English translations for "en"', () => {
      const translations = getTranslations('en')
      expect(translations.appName).toBe('NATO Alphabet Trainer')
      expect(translations.converter).toBe('Converter')
      expect(translations.quiz).toBe('Quiz')
      expect(translations.settings).toBe('Settings')
    })

    it('should return French translations for "fr"', () => {
      const translations = getTranslations('fr')
      expect(translations.appName).toBe('Entraîneur Alphabet OTAN')
      expect(translations.converter).toBe('Convertisseur')
      expect(translations.quiz).toBe('Quiz')
      expect(translations.settings).toBe('Paramètres')
    })

    it('should return Spanish translations for "es"', () => {
      const translations = getTranslations('es')
      expect(translations.appName).toBe('Entrenador Alfabeto OTAN')
      expect(translations.converter).toBe('Convertidor')
      expect(translations.quiz).toBe('Quiz')
      expect(translations.settings).toBe('Configuración')
    })

    it('should fallback to English for unsupported languages', () => {
      const translations = getTranslations('unsupported')
      expect(translations.appName).toBe('NATO Alphabet Trainer')
      expect(translations.language).toBe('English')
    })

    it('should have NATO hints for all supported languages', () => {
      const supportedLanguages = ['en', 'fr', 'es', 'de', 'it', 'pt', 'ja']
      
      supportedLanguages.forEach(lang => {
        const translations = getTranslations(lang)
        expect(translations.natoHints).toBeTruthy()
        expect(typeof translations.natoHints).toBe('object')
        expect(translations.natoHints['A']).toBeTruthy()
        expect(translations.natoHints['Z']).toBeTruthy()
      })
    })

    it('should have consistent structure across all languages', () => {
      const supportedLanguages = ['en', 'fr', 'es', 'de', 'it', 'pt', 'ja']
      const englishTranslations = getTranslations('en')
      const englishKeys = Object.keys(englishTranslations)
      
      supportedLanguages.forEach(lang => {
        const translations = getTranslations(lang)
        const translationKeys = Object.keys(translations)
        
        // All languages should have the same keys as English
        expect(translationKeys.sort()).toEqual(englishKeys.sort())
      })
    })

    it('should have all NATO hints for each language', () => {
      const supportedLanguages = ['en', 'fr', 'es', 'de', 'it', 'pt', 'ja']
      const expectedLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
      
      supportedLanguages.forEach(lang => {
        const translations = getTranslations(lang)
        expectedLetters.forEach(letter => {
          expect(translations.natoHints[letter]).toBeTruthy()
          expect(typeof translations.natoHints[letter]).toBe('string')
        })
      })
    })
  })

  describe('getCurrentLanguage', () => {
    it('should return default language when none is set', () => {
      localStorage.clear()
      const language = getCurrentLanguage()
      expect(language).toBe('en')
    })

    it('should return stored language from localStorage', () => {
      localStorage.setItem('language', 'fr')
      const language = getCurrentLanguage()
      expect(language).toBe('fr')
    })

    it('should fallback to English for invalid stored language', () => {
      localStorage.setItem('language', 'invalid')
      const language = getCurrentLanguage()
      expect(language).toBe('en')
    })

    it('should handle corrupted localStorage data', () => {
      // Simulate corrupted data
      Object.defineProperty(localStorage, 'getItem', {
        value: () => { throw new Error('localStorage error') },
        writable: true
      })
      
      const language = getCurrentLanguage()
      expect(language).toBe('en')
    })
  })

  describe('setCurrentLanguage', () => {
    it('should set language in localStorage', () => {
      setCurrentLanguage('es')
      expect(localStorage.getItem('language')).toBe('es')
    })

    it('should allow setting supported languages', () => {
      const supportedLanguages = ['en', 'fr', 'es', 'de', 'it', 'pt', 'ja']
      
      supportedLanguages.forEach(lang => {
        setCurrentLanguage(lang)
        expect(getCurrentLanguage()).toBe(lang)
      })
    })

    it('should handle unsupported languages gracefully', () => {
      setCurrentLanguage('unsupported')
      expect(localStorage.getItem('language')).toBe('unsupported')
      // getCurrentLanguage should still fallback to 'en'
      expect(getCurrentLanguage()).toBe('en')
    })

    it('should handle empty string', () => {
      setCurrentLanguage('')
      expect(localStorage.getItem('language')).toBe('')
      expect(getCurrentLanguage()).toBe('en')
    })

    it('should persist across page reloads', () => {
      setCurrentLanguage('de')
      
      // Simulate getting language after reload
      const persistedLanguage = localStorage.getItem('language')
      expect(persistedLanguage).toBe('de')
    })
  })

  describe('Translation completeness', () => {
    it('should have complete translations for quiz functionality', () => {
      const requiredKeys = [
        'startQuiz', 'nextQuestion', 'submitAnswer', 'correctAnswer', 
        'yourAnswer', 'correct', 'incorrect', 'sessionComplete', 
        'score', 'tryAgain', 'hint'
      ]
      
      const supportedLanguages = ['en', 'fr', 'es', 'de', 'it', 'pt', 'ja']
      
      supportedLanguages.forEach(lang => {
        const translations = getTranslations(lang)
        requiredKeys.forEach(key => {
          expect(translations).toHaveProperty(key)
          expect(translations[key as keyof typeof translations]).toBeTruthy()
        })
      })
    })

    it('should have complete translations for converter functionality', () => {
      const requiredKeys = [
        'converter', 'enterText', 'placeholder', 'natoAlphabet', 
        'playPronunciation', 'stop', 'quickReference', 'copied', 'copyFailed'
      ]
      
      const supportedLanguages = ['en', 'fr', 'es', 'de', 'it', 'pt', 'ja']
      
      supportedLanguages.forEach(lang => {
        const translations = getTranslations(lang)
        requiredKeys.forEach(key => {
          expect(translations).toHaveProperty(key)
          expect(translations[key as keyof typeof translations]).toBeTruthy()
        })
      })
    })

    it('should have complete translations for settings functionality', () => {
      const requiredKeys = [
        'settings', 'voiceSettings', 'textToSpeechVoice', 'testVoice',
        'notifications', 'language', 'interfaceLanguage', 'about',
        'femaleVoice', 'maleVoice', 'robotVoice'
      ]
      
      const supportedLanguages = ['en', 'fr', 'es', 'de', 'it', 'pt', 'ja']
      
      supportedLanguages.forEach(lang => {
        const translations = getTranslations(lang)
        requiredKeys.forEach(key => {
          expect(translations).toHaveProperty(key)
          expect(translations[key as keyof typeof translations]).toBeTruthy()
        })
      })
    })
  })
})