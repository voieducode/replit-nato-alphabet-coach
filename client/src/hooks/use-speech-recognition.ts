import { useCallback, useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

// TypeScript doesn't have built-in types for SpeechRecognition
interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  maxAlternatives: number;
  lang: string;
  onstart: () => void;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionHookResult {
  isListening: boolean;
  speechSupported: boolean;
  startListening: () => void;
  stopListening: () => void;
}

/**
 * Custom hook for speech recognition functionality
 *
 * @param onTranscriptReceived Callback function that receives the transcript text
 * @returns Object containing speech recognition state and control functions
 */
export function useSpeechRecognition(
  onTranscriptReceived: (transcript: string) => void
): SpeechRecognitionHookResult {
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const { toast } = useToast();

  // Event handlers
  const handleStart = useCallback(() => {
    setIsListening(true);
  }, []);

  const handleResult = useCallback(
    (event: any) => {
      const transcript = event.results[0][0].transcript.toLowerCase().trim();
      onTranscriptReceived(transcript);
      setIsListening(false);
    },
    [onTranscriptReceived]
  );

  const handleEnd = useCallback(() => {
    setIsListening(false);
  }, []);

  const handleError = useCallback(
    (event: any) => {
      setIsListening(false);

      // Provide error messages
      if (event.error === 'language-not-supported') {
        toast({
          title: 'Language Not Supported',
          description: 'Try switching to English system language.',
          variant: 'destructive',
        });
      } else if (event.error === 'not-allowed') {
        toast({
          title: 'Microphone Access Denied',
          description: 'Please allow microphone access in browser settings.',
          variant: 'destructive',
        });
      } else if (event.error === 'no-speech') {
        toast({
          title: 'No Speech Detected',
          description: 'Please speak clearly and try again.',
        });
      } else if (event.error === 'network') {
        toast({
          title: 'Network Error',
          description: 'Speech recognition requires internet connection.',
          variant: 'destructive',
        });
      }
    },
    [toast]
  );

  // Initialize speech recognition
  const initializeSpeechRecognition = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      return false;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      recognition.lang = 'en-US';

      recognition.onstart = handleStart;
      recognition.onresult = handleResult;
      recognition.onerror = handleError;
      recognition.onend = handleEnd;

      recognitionRef.current = recognition;
      return true;
    } catch {
      toast({
        title: 'Speech Recognition Error',
        description: 'Failed to initialize speech recognition.',
        variant: 'destructive',
      });
      return false;
    }
  }, [handleStart, handleResult, handleError, handleEnd, toast]);

  useEffect(() => {
    // Initialize speech recognition and get support status
    const isSupported = initializeSpeechRecognition();

    // Use a setTimeout with 0ms delay to move setState out of the immediate useEffect execution
    const timer = setTimeout(() => {
      setSpeechSupported(isSupported);
    }, 0);

    return () => {
      clearTimeout(timer);
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [initializeSpeechRecognition]);

  const startListening = useCallback(() => {
    if (recognitionRef.current && speechSupported) {
      setIsListening(true);
      recognitionRef.current.start();
    }
  }, [speechSupported]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  }, [isListening]);

  return {
    isListening,
    speechSupported,
    startListening,
    stopListening,
  };
}
