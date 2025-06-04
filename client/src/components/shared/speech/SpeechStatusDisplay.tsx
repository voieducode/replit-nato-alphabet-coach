import type { SpeechStatusDisplayProps } from './types';
import { AlertCircle } from 'lucide-react';
import { memo } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * Unified speech status display component for errors, listening state, and interim transcript
 */
export const SpeechStatusDisplay = memo(
  ({
    isListening,
    isProcessing,
    error,
    interimTranscript,
    onClearError,
    translations,
    showInterimText = true,
    className,
  }: SpeechStatusDisplayProps) => {
    // Don't render if there's nothing to show
    if (!isListening && !isProcessing && !error && !interimTranscript) {
      return null;
    }

    return (
      <div className={cn('mt-2 text-sm space-y-2', className)}>
        {/* Error Display */}
        {error && (
          <div className="flex items-center space-x-2 text-red-600 bg-red-50 p-2 rounded border border-red-200">
            <AlertCircle
              className="h-4 w-4 flex-shrink-0"
              role="img"
              aria-label="Error icon"
            />
            <span className="flex-1">{error}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearError}
              onKeyDown={(e) => {
                if (
                  (e.key === 'Enter' || e.key === ' ') &&
                  typeof onClearError === 'function'
                ) {
                  e.preventDefault();
                  onClearError();
                }
              }}
              className="h-6 w-6 p-0 text-red-600 hover:text-red-800"
            >
              ×
            </Button>
          </div>
        )}

        {/* Listening State Display */}
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
                : translations.natoInputListening ||
                  `Listening... (Language: ${navigator.language || 'en-US'})`}
            </span>
          </div>
        )}

        {/* Interim Transcript Display */}
        {!error && showInterimText && interimTranscript && (
          <div className="text-gray-500 italic">
            Hearing: "{interimTranscript}"
          </div>
        )}
      </div>
    );
  }
);

SpeechStatusDisplay.displayName = 'SpeechStatusDisplay';
