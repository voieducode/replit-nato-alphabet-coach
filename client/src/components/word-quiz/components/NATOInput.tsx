import type { WordMatchResult } from '@/lib/word-matching';
import React, { useEffect } from 'react';
import {
  SpeechInputButton,
  SpeechStatusDisplay,
} from '@/components/shared/speech';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useLanguage } from '@/hooks/use-language';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { cn } from '@/lib/utils';
import { useAutoResizeTextarea } from '../hooks/useAutoResizeTextarea';

interface NATOInputProps {
  userNATOInput: string;
  setUserNATOInput: (value: string) => void;
  showResult: boolean;
  isCompleted: boolean;
  matchResult: WordMatchResult | null;
  isCustomMode: boolean;
}

export function NATOInput({
  userNATOInput,
  setUserNATOInput,
  showResult,
  isCompleted,
  matchResult,
  isCustomMode,
}: NATOInputProps) {
  const { translations } = useLanguage();
  const textareaRef = useAutoResizeTextarea(userNATOInput);

  // Focus textarea when component mounts, when results are hidden, or after retry
  // but not when custom mode is active (to avoid conflicting with custom word input)
  useEffect(() => {
    if (!showResult && !isCustomMode) {
      const timer = setTimeout(() => {
        textareaRef.current?.focus();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [showResult, userNATOInput, isCustomMode, textareaRef]);

  // Speech recognition for NATO input
  const {
    isListening,
    isProcessing,
    speechSupported,
    interimTranscript,
    audioLevel,
    error,
    startListening,
    stopListening,
    clearError,
  } = useSpeechRecognition({
    continuous: true,
    interimResults: true,
    autoRestart: true,
    confidenceThreshold: 0.5,
  });

  // Add effect to watch for transcript changes
  useEffect(() => {
    if (interimTranscript) {
      // Add a space between existing content and new dictated text if needed
      const needsSpace =
        userNATOInput.length > 0 && !userNATOInput.endsWith(' ');
      const separator = needsSpace ? ' ' : '';
      setUserNATOInput(userNATOInput + separator + interimTranscript);
    }
  }, [interimTranscript, userNATOInput, setUserNATOInput]);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">
          {translations.natoInputTitle}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative">
          <Textarea
            ref={textareaRef}
            value={userNATOInput}
            onChange={(e) => setUserNATOInput(e.target.value)}
            placeholder={translations.natoInputPlaceholder}
            className={cn(
              'text-lg p-4 pr-12 resize-none overflow-hidden',
              isListening && 'border-blue-300 bg-blue-50',
              isProcessing && 'border-yellow-300 bg-yellow-50'
            )}
            style={{ minHeight: '60px', maxHeight: '200px' }}
            disabled={showResult && isCompleted}
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
              natoInputListening: translations.natoInputListening,
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
            natoInputListening: translations.natoInputListening,
          }}
        />

        {/* Real-time Score */}
        {matchResult && userNATOInput && !showResult && (
          <div className="text-sm text-center p-2 bg-gray-50 rounded">
            {translations.natoInputLiveScore}: {matchResult.correctCount}/
            {matchResult.totalCount} ({matchResult.percentage}%)
          </div>
        )}
      </CardContent>
    </Card>
  );
}
