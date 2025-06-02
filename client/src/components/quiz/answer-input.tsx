import type { Translations } from '@/lib/i18n';
import { Lightbulb, Mic, MicOff, Volume2 } from 'lucide-react';
import React, { memo, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { useSpeechSynthesis } from '@/hooks/use-speech-synthesis';
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

    // Use our custom speech recognition hook
    const { isListening, speechSupported, startListening, stopListening } =
      useSpeechRecognition((transcript) => {
        setUserAnswer(transcript);
      });

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
              placeholder={translations.placeholder}
              className="w-full p-4 text-lg text-center pr-12"
              disabled={showResult}
              autoFocus
              aria-label={translations.typeNatoWordForLetter.replace(
                '{letter}',
                letter
              )}
              aria-describedby="answer-instructions"
            />
            {speechSupported && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={cn(
                  'absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0',
                  isListening
                    ? 'text-info-foreground-red bg-info'
                    : 'text-gray-500'
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
            )}
          </div>
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
