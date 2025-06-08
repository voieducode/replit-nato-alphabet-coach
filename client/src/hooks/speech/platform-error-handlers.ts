import type { Toast } from '../use-toast';

type ToastType = Toast;

// Platform-specific error handlers for speech recognition
export function handleIOSError(
  errorMessage: string,
  setError: (msg: string) => void,
  toast: (toast: ToastType) => void
) {
  if (errorMessage.includes('not-allowed') || errorMessage.includes('denied')) {
    setError(
      'Microphone permission denied. Please enable microphone access in browser settings.'
    );
    toast({
      title: 'Microphone Permission Required',
      description:
        'Go to Safari settings and allow microphone access for this site.',
      variant: 'destructive',
    });
  } else if (
    errorMessage.includes('network') ||
    errorMessage.includes('offline')
  ) {
    setError('Network connection required for speech recognition on iOS');
    toast({
      title: 'Network Required',
      description: 'Speech recognition requires an active internet connection.',
      variant: 'destructive',
    });
  } else {
    setError(`iOS speech recognition error: ${errorMessage}`);
  }
}

export function handleAndroidError(
  errorMessage: string,
  setError: (msg: string) => void,
  toast: (toast: ToastType) => void
) {
  if (errorMessage.includes('not-allowed') || errorMessage.includes('denied')) {
    setError(
      'Microphone permission denied. Please enable microphone access in browser settings.'
    );
    toast({
      title: 'Microphone Permission Required',
      description:
        'Go to browser settings and allow microphone access for this site.',
      variant: 'destructive',
    });
  } else if (
    errorMessage.includes('network') ||
    errorMessage.includes('offline')
  ) {
    setError('Network connection required for speech recognition on Android');
    toast({
      title: 'Network Required',
      description: 'Speech recognition requires an active internet connection.',
      variant: 'destructive',
    });
  } else {
    setError(`Android microphone error: ${errorMessage}`);
  }
}

export function handleGenericError(
  errorMessage: string,
  setError: (msg: string) => void
) {
  if (
    errorMessage.includes('not-allowed') ||
    errorMessage.includes('permission')
  ) {
    setError(
      'Microphone permission denied. Please check your browser settings.'
    );
  } else if (
    errorMessage.includes('network') ||
    errorMessage.includes('offline')
  ) {
    setError('Network connection required for speech recognition');
  } else if (errorMessage.includes('audio')) {
    setError('Audio capture error. Please check your microphone connection.');
  } else if (errorMessage.includes('aborted')) {
    setError('Speech recognition was aborted');
  } else {
    setError(`Speech recognition error: ${errorMessage}`);
  }
}
