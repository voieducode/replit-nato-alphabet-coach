import type { SpeechInputButtonProps } from './types';
import { Mic, MicOff } from 'lucide-react';
import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { AudioLevelDisplay } from './AudioLevelDisplay';

/**
 * Speech input button with integrated audio level visualization
 * Combines microphone toggle button with real-time audio level feedback
 */
export const SpeechInputButton = memo(
  ({
    isListening,
    isProcessing,
    speechSupported,
    audioLevel,
    onToggle,
    disabled = false,
    translations,
    className,
  }: SpeechInputButtonProps) => {
    if (!speechSupported) {
      return null;
    }

    return (
      <div
        className={cn(
          'absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1',
          className
        )}
        role="presentation"
        data-testid="speech-input-button-container"
      >
        {/* Audio level indicator */}
        <AudioLevelDisplay
          audioLevel={audioLevel}
          isListening={isListening}
          data-testid="audio-level-display"
        />
        {/* Microphone button */}
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
          onClick={onToggle}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
              e.preventDefault();
              onToggle?.();
            }
          }}
          disabled={disabled}
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
    );
  }
);

SpeechInputButton.displayName = 'SpeechInputButton';
