import type { Translations } from '@/lib/i18n';
import React, { memo, useEffect, useRef } from 'react';
import {
  SpeechInputButton,
  SpeechStatusDisplay,
} from '@/components/shared/speech';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { AudioControlButton } from './AudioControlButton';

interface QuizTextInputProps {
  letter: string;
  correctAnswer: string;
  userAnswer: string;
  setUserAnswer: (value: string) => void;
  showResult: boolean;
  onSubmitAnswer: () => void;
  onSkipQuestion: () => void;
  onSpeak: () => void;
  translations: Translations;
  // Speech recognition props passed from parent
  isListening: boolean;
  isProcessing: boolean;
  speechSupported: boolean;
  interimTranscript: string;
  audioLevel: number;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  clearError: () => void;
}

export const QuizTextInput = memo(
  ({
    letter,
    userAnswer,
    setUserAnswer,
    showResult,
    onSubmitAnswer,
    onSkipQuestion,
    onSpeak,
    translations,
    isListening,
    isProcessing,
    speechSupported,
    interimTranscript,
    audioLevel,
    error,
    startListening,
    stopListening,
    clearError,
  }: QuizTextInputProps) => {
    const inputRef = useRef<HTMLInputElement>(null);

    // Focus input when component mounts
    useEffect(() => {
      if (!showResult) {
        const timer = setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
        return () => clearTimeout(timer);
      }
    }, [showResult]);

    const handleKeyPress = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !showResult && userAnswer.trim()) {
        onSubmitAnswer();
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
      // Allow Tab and Shift+Tab for accessibility
      if (e.key === 'Tab') {
        return;
      }
      // Skip with Escape key for better accessibility
      if (e.key === 'Escape' && !showResult) {
        e.preventDefault();
        onSkipQuestion();
      }
    };

    return (
      <div>
        <div className="flex items-center justify-between mb-2">
          <label
            htmlFor="answer-input"
            className="block text-sm font-medium text-gray-700"
          >
            {translations.enterText}:
          </label>
          <AudioControlButton onSpeak={onSpeak} className="ml-2" />
        </div>
        <div id="answer-instructions" className="text-xs text-gray-500 mb-2">
          {translations.pressEnterToSubmit} • {translations.pressEscapeToSkip} •
          {translations.exampleAnswers}
        </div>
        <div className="relative">
          <Input
            ref={inputRef}
            id="answer-input"
            type="text"
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value.toLowerCase())}
            onKeyPress={handleKeyPress}
            onKeyDown={handleKeyDown}
            placeholder={
              isListening
                ? interimTranscript || 'Listening...'
                : translations.placeholder
            }
            className={cn(
              'w-full p-4 text-lg text-center pr-12',
              isListening && 'border-blue-300 bg-blue-50',
              isProcessing && 'border-yellow-300 bg-yellow-50'
            )}
            disabled={showResult}
            autoFocus
            aria-label={translations.typeNatoWordForLetter.replace(
              '{letter}',
              letter
            )}
            aria-describedby="answer-instructions"
          />
          <SpeechInputButton
            isListening={isListening}
            isProcessing={isProcessing}
            speechSupported={speechSupported}
            audioLevel={audioLevel}
            onToggle={() => {
              clearError();
              if (isListening) {
                stopListening();
              } else {
                // Clear the input when starting speech recognition to indicate overwrite behavior
                setUserAnswer('');
                startListening();
              }
            }}
            disabled={showResult}
            translations={{
              startVoiceInput: translations.startVoiceInput,
              stopVoiceInput: translations.stopVoiceInput,
            }}
          />
        </div>

        <SpeechStatusDisplay
          isListening={isListening}
          isProcessing={isProcessing}
          error={error}
          interimTranscript={interimTranscript}
          onClearError={() => {
            clearError();
            stopListening();
          }}
          translations={{
            startVoiceInput: translations.startVoiceInput,
            stopVoiceInput: translations.stopVoiceInput,
          }}
        />
      </div>
    );
  }
);

// Add displayName for better debugging
QuizTextInput.displayName = 'QuizTextInput';
