import type { SpeechTranslations } from '../types';
import { vi } from 'vitest';

/**
 * Mock speech recognition hook result factory
 */
export function createMockSpeechRecognition(overrides = {}) {
  return {
    isListening: false,
    isProcessing: false,
    speechSupported: true,
    interimTranscript: '',
    audioLevel: 0,
    error: null,
    startListening: vi.fn(),
    stopListening: vi.fn(),
    clearError: vi.fn(),
    ...overrides,
  };
}

/**
 * Default translations for testing
 */
export const mockTranslations: SpeechTranslations = {
  startVoiceInput: 'Start Voice Input',
  stopVoiceInput: 'Stop Voice Input',
  natoInputListening: 'Listening for NATO words...',
};

/**
 * Helper to create props for SpeechInputButton
 */
export function createSpeechInputButtonProps(overrides = {}) {
  return {
    isListening: false,
    isProcessing: false,
    speechSupported: true,
    audioLevel: 0,
    onToggle: vi.fn(),
    disabled: false,
    translations: mockTranslations,
    ...overrides,
  };
}

/**
 * Helper to create props for SpeechStatusDisplay
 */
export function createSpeechStatusDisplayProps(overrides = {}) {
  return {
    isListening: false,
    isProcessing: false,
    error: null,
    interimTranscript: '',
    onClearError: vi.fn(),
    translations: mockTranslations,
    showInterimText: true,
    ...overrides,
  };
}

/**
 * Helper to create props for AudioLevelDisplay
 */
export function createAudioLevelDisplayProps(overrides = {}) {
  return {
    audioLevel: 0,
    isListening: false,
    ...overrides,
  };
}

/**
 * Mock the useSpeechRecognition hook for testing
 */
export function mockUseSpeechRecognition() {
  vi.mock('@/hooks/use-speech-recognition', () => ({
    useSpeechRecognition: vi.fn(() => createMockSpeechRecognition()),
  }));
}
