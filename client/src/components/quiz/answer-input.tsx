import type { Translations } from '@/lib/i18n';
import { Lightbulb, Volume2 } from 'lucide-react';
import React, { memo, useEffect, useRef, useState } from 'react';
import {
  AndroidTroubleshoot,
  SpeechInputButton,
  SpeechStatusDisplay,
} from '@/components/shared/speech';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { useSpeechSynthesis } from '@/hooks/use-speech-synthesis';
import { useToast } from '@/hooks/use-toast';
import { getHintForLetter } from '@/lib/spaced-repetition';
import { cn } from '@/lib/utils';

// Helper functions for Android detection
function isAndroid(): boolean {
  return /Android/i.test(navigator.userAgent);
}

function isSecureContext(): boolean {
  return (
    window.isSecureContext ||
    location.protocol === 'https:' ||
    location.hostname === 'localhost'
  );
}

function hasUserGesture(): boolean {
  return (
    document.hasFocus() &&
    Date.now() - (window as any).__lastUserInteraction < 5000
  );
}

interface AnswerInputProps {
  letter: string;
  correctAnswer: string;
  userAnswer: string;
  setUserAnswer: (value: string) => void;
  showResult: boolean;
  showHint: boolean;
  onSubmitAnswer: () => void;
  onSkipQuestion: () => void;
  translations: Translations;
}

export const AnswerInput = memo(
  ({
    letter,
    correctAnswer,
    userAnswer,
    setUserAnswer,
    showResult,
    showHint,
    onSubmitAnswer,
    onSkipQuestion,
    translations,
  }: AnswerInputProps) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const { speak } = useSpeechSynthesis();
    const { toast } = useToast();
    const [showAndroidTroubleshoot, setShowAndroidTroubleshoot] =
      useState(false);

    // Use our enhanced speech recognition hook with debug mode enabled
    const {
      isListening,
      isProcessing,
      speechSupported,
      interimTranscript,
      audioLevel,
      error,
      startListening,
      stopListening,
      testMicrophone,
      clearError,
    } = useSpeechRecognition(
      (transcript) => {
        setUserAnswer(transcript);
      },
      {
        debugMode: true, // Enable debug logging to help troubleshoot
        continuous: true, // Keep listening for better UX
        interimResults: true, // Show real-time feedback
        autoRestart: true, // Auto-restart when speech ends
        confidenceThreshold: 0.6, // Lower threshold for NATO words
      }
    );

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
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="answer-input"
              className="block text-sm font-medium text-gray-700"
            >
              {translations.enterText}:
            </label>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => speak(`${letter}... ${correctAnswer}`)}
              className="ml-2"
            >
              <Volume2 className="h-4 w-4" />
            </Button>
          </div>
          <div id="answer-instructions" className="text-xs text-gray-500 mb-2">
            {translations.pressEnterToSubmit} • {translations.pressEscapeToSkip}{' '}
            •{translations.exampleAnswers}
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

          {/* Android Troubleshoot Component */}
          {(error || showAndroidTroubleshoot) && (
            <div className="mt-3">
              <AndroidTroubleshoot
                isAndroid={isAndroid()}
                isSecureContext={isSecureContext()}
                hasUserGesture={hasUserGesture()}
                onRetry={() => {
                  clearError();
                  setShowAndroidTroubleshoot(false);
                  startListening();
                }}
                onDismiss={() => {
                  setShowAndroidTroubleshoot(false);
                }}
              />
            </div>
          )}

          {/* Microphone Test Button */}
          {speechSupported && !isListening && !showResult && (
            <div className="mt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  const result = await testMicrophone();
                  if (result) {
                    // Microphone test passed, show a success toast
                    toast({
                      title: 'Microphone Test',
                      description:
                        "Microphone test successful! You're ready to use voice input.",
                      variant: 'default',
                    });
                    setShowAndroidTroubleshoot(false);
                  } else {
                    // Microphone test failed, show troubleshoot for Android users
                    if (isAndroid()) {
                      setShowAndroidTroubleshoot(true);
                    }
                  }
                }}
                className="text-xs"
              >
                Test Microphone
              </Button>
            </div>
          )}
        </div>

        {/* Hint Display */}
        {showHint && !showResult && (
          <div className="p-3 rounded-lg bg-info border border-yellow-200 text-info-foreground">
            <div className="flex items-center space-x-2">
              <Lightbulb className="h-4 w-4" />
              <p className="text-sm font-medium">
                {translations.hint}:{' '}
                {getHintForLetter(letter, translations.natoHints)}
              </p>
            </div>
          </div>
        )}

        {/* Quiz Actions */}
        <div className="mt-6 flex space-x-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={onSkipQuestion}
            disabled={showResult}
          >
            {translations.skipQuestion}
          </Button>
          <Button
            className="flex-1"
            onClick={onSubmitAnswer}
            disabled={!userAnswer.trim() || showResult}
          >
            {translations.submitAnswer}
          </Button>
        </div>
      </div>
    );
  }
);

// Add displayName for better debugging
AnswerInput.displayName = 'AnswerInput';
