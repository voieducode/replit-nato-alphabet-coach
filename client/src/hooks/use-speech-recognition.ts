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
  abort: () => void;
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
  const isInitializedRef = useRef(false);
  const onTranscriptReceivedRef = useRef(onTranscriptReceived);
  const { toast } = useToast();

  // Keep callback ref updated
  useEffect(() => {
    onTranscriptReceivedRef.current = onTranscriptReceived;
  }, [onTranscriptReceived]);

  // Event handlers - stable references
  const handleStart = useCallback(() => {
    setIsListening(true);
  }, []);

  const handleResult = useCallback((event: any) => {
    try {
      if (event.results && event.results.length > 0) {
        const transcript = event.results[0][0].transcript.toLowerCase().trim();
        if (transcript) {
          onTranscriptReceivedRef.current(transcript);
        }
      }
    } catch (error) {
      console.error('Error processing speech result:', error);
    }
    // Don't set isListening to false here - let handleEnd do it
  }, []);

  const handleEnd = useCallback(() => {
    setIsListening(false);
  }, []);

  const handleError = useCallback(
    (event: any) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);

      // Only show toast for serious errors, not transient ones
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
      } else if (event.error === 'network') {
        toast({
          title: 'Network Error',
          description: 'Speech recognition requires internet connection.',
          variant: 'destructive',
        });
      }
      // Don't show toast for 'no-speech' or 'aborted' errors as they're common
    },
    [toast]
  );

  // Initialize speech recognition once
  const initializeSpeechRecognition = useCallback(() => {
    if (isInitializedRef.current) {
      return speechSupported;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      isInitializedRef.current = true;
      setSpeechSupported(false);
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
      isInitializedRef.current = true;
      setSpeechSupported(true);
      return true;
    } catch (error) {
      console.error('Failed to initialize speech recognition:', error);
      toast({
        title: 'Speech Recognition Error',
        description: 'Failed to initialize speech recognition.',
        variant: 'destructive',
      });
      isInitializedRef.current = true;
      setSpeechSupported(false);
      return false;
    }
  }, [speechSupported, handleStart, handleResult, handleError, handleEnd, toast]);

  // Initialize once on mount
  useEffect(() => {
    initializeSpeechRecognition();

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (error) {
          console.error('Error stopping speech recognition:', error);
        }
        recognitionRef.current = null;
      }
      isInitializedRef.current = false;
    };
  }, []); // Empty dependency array - initialize only once

  const startListening = useCallback(() => {
    if (!speechSupported) {
      console.warn('Speech recognition not supported');
      return;
    }

    if (!recognitionRef.current) {
      console.warn('Speech recognition not initialized');
      return;
    }

    if (isListening) {
      console.warn('Already listening');
      return;
    }

    try {
      recognitionRef.current.start();
    } catch (error) {
      console.error('Error starting speech recognition:', error);
      setIsListening(false);
    }
  }, [speechSupported, isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListening) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.error('Error stopping speech recognition:', error);
        setIsListening(false);
      }
    }
  }, [isListening]);

  return {
    isListening,
    speechSupported,
    startListening,
    stopListening,
  };
}
