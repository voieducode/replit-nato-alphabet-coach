/* eslint-disable react-hooks-extra/no-direct-set-state-in-use-effect */
// Import types from our types module
import type {
  SpeechRecognitionConfig,
  SpeechRecognitionHookResult,
  SpeechRecognitionInstance,
} from './speech/speech-recognition-types';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';

import { logDebug } from '../lib/debug-logger';

// Import audio monitoring utilities
import { stopAudioMonitoring } from './speech/audio-monitoring';

// Import platform detection utilities
import {
  getAndroidInfo,
  getBrowserInfo,
  getIOSInfo,
  isSpeechRecognitionSupported,
} from './speech/platform-detection';

// Import error handlers
import {
  handleAndroidError,
  handleIOSError,
} from './speech/platform-error-handlers';

// Import recognition event handlers
import { createRecognitionHandlers } from './speech/recognition-handlers';

// Import speech recognition utilities
import {
  initializeSpeechRecognition,
  testMicrophoneAccess,
} from './speech/speech-recognition-utils';

// Import restart delay utility

/**
 * React hook for speech recognition functionality
 * @param config Configuration options for speech recognition
 * @returns Speech recognition state and control functions
 */
export function useSpeechRecognition(
  config: SpeechRecognitionConfig = {}
): SpeechRecognitionHookResult {
  const { toast } = useToast();

  // Configuration with defaults
  const {
    continuous = true,
    interimResults = true,
    maxAlternatives = 3,
    language = 'en-US',
    confidenceThreshold = 0.5,
    autoRestart = true,
    debugMode = false,
  } = config;

  // State management
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);

  // Refs for persistence across renders
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const restartTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastStartTimeRef = useRef<number>(0);
  const isManualStopRef = useRef<boolean>(false);
  const shouldRestartRef = useRef<boolean>(true);

  // Audio monitoring refs
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  // Get platform information for enhanced diagnostics
  const androidInfo = getAndroidInfo();
  const iosInfo = getIOSInfo();
  const browserInfo = getBrowserInfo();

  // Initialize speech recognition on component mount
  useEffect(() => {
    // Check if speech recognition is supported
    const supported = isSpeechRecognitionSupported();
    setSpeechSupported(supported);

    if (supported) {
      // Initialize the speech recognition instance
      recognitionRef.current = initializeSpeechRecognition(
        continuous,
        interimResults,
        maxAlternatives,
        language,
        () => {}, // handleStart - will be overridden below
        () => {}, // handleResult - will be overridden below
        () => {}, // handleError - will be overridden below
        () => {}, // handleEnd - will be overridden below
        () => {}, // handleSpeechStart - will be overridden below
        () => {} // handleSpeechEnd - will be overridden below
      );

      if (!recognitionRef.current) {
        setSpeechSupported(false);
        setError('Failed to initialize speech recognition');
        return;
      }

      // Configure event handlers for the recognition instance
      const recognition = recognitionRef.current;
      const stopAudioMonitoringFn = () =>
        stopAudioMonitoring(
          streamRef,
          audioContextRef,
          microphoneRef,
          analyserRef,
          setAudioLevel
        );
      const handlers = createRecognitionHandlers({
        setIsListening,
        setIsProcessing,
        setCurrentTranscript,
        setInterimTranscript,
        setAudioLevel,
        setError,
        streamRef,
        audioContextRef,
        analyserRef,
        microphoneRef,
        animationFrameIdRef,
        iosInfo,
        androidInfo,
        toast,
        confidenceThreshold,
        stopAudioMonitoringFn,
      });
      recognition.onstart = handlers.onstart;
      recognition.onspeechstart = handlers.onspeechstart;
      recognition.onspeechend = handlers.onspeechend;
      recognition.onaudiostart = handlers.onaudiostart;
      recognition.onaudioend = handlers.onaudioend;
      recognition.onresult = handlers.onresult;
      recognition.onerror = handlers.onerror;
      recognition.onend = handlers.onend;
    } else {
      setError('Speech recognition is not supported in this browser');

      // Suggest alternatives based on platform
      if (iosInfo.isIOS && !iosInfo.isSafari) {
        toast({
          title: 'Browser Not Supported',
          description: 'Please use Safari on iOS for speech recognition',
          variant: 'destructive',
        });
      } else if (androidInfo.isAndroid && androidInfo.browser === 'Other') {
        toast({
          title: 'Browser Not Supported',
          description: 'Please use Chrome on Android for speech recognition',
          variant: 'destructive',
        });
      }
    }

    // Cleanup function
    return () => {
      shouldRestartRef.current = false;

      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = null;
      }

      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (error) {
          logDebug(
            `Error stopping speech recognition during cleanup: ${String(error)}`
          );
        }
      }

      stopAudioMonitoring(
        streamRef,
        audioContextRef,
        microphoneRef,
        analyserRef,
        setAudioLevel
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Clear current error state
   */
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  /**
   * Test microphone access with diagnostics
   */
  const testMicrophone = useCallback(async () => {
    return await testMicrophoneAccess(toast);
  }, [toast]);

  /**
   * Start speech recognition
   */
  const startListening = useCallback(() => {
    // Don't start if already listening
    if (isListening || !speechSupported) {
      return;
    }

    // Clear any previous timeouts
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }

    // Reset manual stop flag and update timing
    isManualStopRef.current = false;
    lastStartTimeRef.current = Date.now();
    shouldRestartRef.current = true;
    setError(null);
    setCurrentTranscript('');
    setInterimTranscript('');

    try {
      logDebug('Starting speech recognition...');
      if (recognitionRef.current) {
        recognitionRef.current.start();
      } else {
        throw new Error('Speech recognition instance is null');
      }
    } catch (error) {
      logDebug(`Error starting speech recognition: ${String(error)}`);
      setIsListening(false);

      // Handle errors based on platform
      if (iosInfo.isIOS) {
        handleIOSError(
          error instanceof Error ? error.message : String(error),
          setError,
          toast
        );
      } else if (androidInfo.isAndroid) {
        handleAndroidError(
          error instanceof Error ? error.message : String(error),
          setError,
          toast
        );
      } else {
        setError('Failed to start speech recognition');
      }
    }
  }, [speechSupported, isListening, androidInfo, iosInfo]);

  /**
   * Stop speech recognition
   */
  const stopListening = useCallback(() => {
    logDebug('stopListening called');

    // Mark this as a manual stop to prevent auto-restart
    isManualStopRef.current = true;
    shouldRestartRef.current = false;

    // Clear any restart timeouts
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }

    if (recognitionRef.current && isListening) {
      try {
        logDebug('Stopping speech recognition...');
        recognitionRef.current.stop();
      } catch (error) {
        logDebug(`Error stopping speech recognition: ${String(error)}`);
        setIsListening(false);
        setIsProcessing(false);

        // Stop audio monitoring on error
        stopAudioMonitoring(
          streamRef,
          audioContextRef,
          microphoneRef,
          analyserRef,
          setAudioLevel
        );
      }
    }

    setInterimTranscript('');
  }, [isListening]);

  // Return the hook result
  return {
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
  };
}

// Export the hook as default
export default useSpeechRecognition;

// Re-export all types for convenience
export type {
  SpeechRecognitionConfig,
  SpeechRecognitionHookResult,
  SpeechRecognitionInstance,
};
