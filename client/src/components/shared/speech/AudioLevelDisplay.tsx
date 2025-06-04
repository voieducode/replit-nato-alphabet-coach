import type { AudioLevelDisplayProps } from './types';
import { memo } from 'react';
import { cn } from '@/lib/utils';

/**
 * Audio level visualization component showing 4 bars that respond to microphone input
 */
export const AudioLevelDisplay = memo(
  ({
    audioLevel,
    isListening,
    className,
    ...rest
  }: AudioLevelDisplayProps & { [key: string]: any }) => {
    if (!isListening || audioLevel <= 0) {
      return null;
    }

    return (
      <div className={cn('flex items-center space-x-1', className)} {...rest}>
        <div
          data-testid="audio-bar-0"
          className={cn(
            'w-1 h-3 bg-green-400 rounded-full transition-all duration-100',
            audioLevel > 10 ? 'opacity-100' : 'opacity-30'
          )}
        />
        <div
          data-testid="audio-bar-1"
          className={cn(
            'w-1 h-4 bg-green-400 rounded-full transition-all duration-100',
            audioLevel > 30 ? 'opacity-100' : 'opacity-30'
          )}
        />
        <div
          data-testid="audio-bar-2"
          className={cn(
            'w-1 h-5 bg-yellow-400 rounded-full transition-all duration-100',
            audioLevel > 50 ? 'opacity-100' : 'opacity-30'
          )}
        />
        <div
          data-testid="audio-bar-3"
          className={cn(
            'w-1 h-6 bg-red-400 rounded-full transition-all duration-100',
            audioLevel > 70 ? 'opacity-100' : 'opacity-30'
          )}
        />
      </div>
    );
  }
);

AudioLevelDisplay.displayName = 'AudioLevelDisplay';
