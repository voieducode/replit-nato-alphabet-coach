/**
 * Speech recognition and related utilities
 * This module exports types and utilities that have been extracted from use-speech-recognition.ts
 */

// Re-export from the original module for backward compatibility
export { default as useSpeechRecognition } from '../use-speech-recognition';

export * from './audio-monitoring';

// Export utility functions
export * from './platform-detection';
// Export types from the types module
export * from './speech-recognition-types';
export * from './speech-recognition-utils';
