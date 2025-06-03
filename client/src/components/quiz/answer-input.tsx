import type { Translations } from '@/lib/i18n';
import { AlertCircle, Lightbulb, Mic, MicOff, Volume2 } from 'lucide-react';
import React, { memo, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { useSpeechSynthesis } from '@/hooks/use-speech-synthesis';
import { useToast } from '@/hooks/use-toast';
import { checkAnswerVariants, getHintForLetter } from '@/lib/spaced-repetition';
import { cn } from '@/lib/utils';

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

    // Use our enhanced speech recognition hook with debug mode enabled
    const {
      isListening,
      isProcessing,
      speechSupported,
      currentTranscript,
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
            {speechSupported && (
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                {/* Audio level indicator */}
                {isListening && audioLevel > 0 && (
                  <div className="flex items-center space-x-1">
                    <div
                      className={cn(
                        'w-1 h-3 bg-green-400 rounded-full transition-all duration-100',
                        audioLevel > 10 ? 'opacity-100' : 'opacity-30'
                      )}
                    />
                    <div
                      className={cn(
                        'w-1 h-4 bg-green-400 rounded-full transition-all duration-100',
                        audioLevel > 30 ? 'opacity-100' : 'opacity-30'
                      )}
                    />
                    <div
                      className={cn(
                        'w-1 h-5 bg-yellow-400 rounded-full transition-all duration-100',
                        audioLevel > 50 ? 'opacity-100' : 'opacity-30'
                      )}
                    />
                    <div
                      className={cn(
                        'w-1 h-6 bg-red-400 rounded-full transition-all duration-100',
                        audioLevel > 70 ? 'opacity-100' : 'opacity-30'
                      )}
                    />
                  </div>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className={cn(
                    'h-8 w-8 p-0',
                    isListening
                      ? 'text-red-600 bg-red-100 hover:bg-red-200'
                      : isProcessing
                        ? 'text-yellow-600 bg-yellow-100'
                        : 'text-gray-500 hover:text-gray-700'
                  )}
                  onClick={isListening ? stopListening : startListening}
                  disabled={showResult}
                  aria-label={
                    isListening
                      ? translations.stopVoiceInput
                      : translations.startVoiceInput
                  }
                >
                  {isListening ? (
                    <MicOff className="h-4 w-4" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>
              </div>
            )}
          </div>

          {/* Speech Recognition Status */}
          {speechSupported && (isListening || isProcessing || error) && (
            <div className="mt-2 text-sm">
              {error && (
                <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-2 rounded border border-red-200">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <span className="flex-1">{error}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearError}
                    className="h-6 w-6 p-0 text-red-600 hover:text-red-800"
                  >
                    ×
                  </Button>
                </div>
              )}

              {!error && isListening && (
                <div className="flex items-center space-x-2 text-blue-600 bg-blue-50 p-2 rounded border border-blue-200">
                  <div className="flex space-x-1">
                    <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" />
                    <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse delay-75" />
                    <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse delay-150" />
                  </div>
                  <span>
                    {isProcessing
                      ? 'Processing speech...'
                      : `Listening... (Language: ${
                          navigator.language || 'en-US'
                        })`}
                  </span>
                </div>
              )}

              {!error && interimTranscript && (
                <div className="text-gray-500 italic">
                  Hearing: "{interimTranscript}"
                </div>
              )}
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

        {showResult && (
          <div
            className={cn(
              'p-4 rounded-lg border bg-info',
              checkAnswerVariants(userAnswer, correctAnswer)
                ? 'border-green-200 text-info-foreground-green'
                : 'border-red-200 text-info-foreground-red'
            )}
          >
            <p className="font-medium">
              {checkAnswerVariants(userAnswer, correctAnswer)
                ? translations.correct
                : `${translations.correctAnswer}: ${correctAnswer}`}
            </p>
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
