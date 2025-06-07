import type { Translations } from '@/lib/i18n';
import React, { memo } from 'react';
import { useSpeechRecognition } from '@/hooks/use-speech-recognition';
import { useSpeechSynthesis } from '@/hooks/use-speech-synthesis';
import {
  MicrophoneTestSection,
  QuizActionButtons,
  QuizHintDisplay,
  QuizTextInput,
} from './components';

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
    const { speak } = useSpeechSynthesis();

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
        // Ensure complete overwrite of the input value
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

    const handleSpeak = () => speak(`${letter}... ${correctAnswer}`);

    return (
      <div className="space-y-4">
        <QuizTextInput
          letter={letter}
          correctAnswer={correctAnswer}
          userAnswer={userAnswer}
          setUserAnswer={setUserAnswer}
          showResult={showResult}
          onSubmitAnswer={onSubmitAnswer}
          onSkipQuestion={onSkipQuestion}
          onSpeak={handleSpeak}
          translations={translations}
          isListening={isListening}
          isProcessing={isProcessing}
          speechSupported={speechSupported}
          interimTranscript={interimTranscript}
          audioLevel={audioLevel}
          error={error}
          startListening={startListening}
          stopListening={stopListening}
          clearError={clearError}
        />

        <MicrophoneTestSection
          speechSupported={speechSupported}
          isListening={isListening}
          showResult={showResult}
          error={error}
          testMicrophone={testMicrophone}
          clearError={clearError}
          startListening={startListening}
        />

        <QuizHintDisplay
          letter={letter}
          showHint={showHint}
          showResult={showResult}
          translations={translations}
        />

        <QuizActionButtons
          onSubmitAnswer={onSubmitAnswer}
          onSkipQuestion={onSkipQuestion}
          showResult={showResult}
          userAnswer={userAnswer}
          translations={translations}
        />
      </div>
    );
  }
);

// Add displayName for better debugging
AnswerInput.displayName = 'AnswerInput';
