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
import {
  setupAudioMonitoring,
  startAudioLevelMonitoring,
  stopAudioMonitoring,
} from './speech/audio-monitoring';

// Import platform detection utilities
import {
  getAndroidInfo,
  getBrowserInfo,
  getIOSInfo,
  isSpeechRecognitionSupported,
} from './speech/platform-detection';

// Import speech recognition utilities
import {
  initializeSpeechRecognition,
  testMicrophoneAccess,
} from './speech/speech-recognition-utils';

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

      // Handle recognition start event
      recognition.onstart = () => {
        logDebug('🎙 Speech recognition started');
        setIsListening(true);
        setIsProcessing(true);

        // Setup audio monitoring for visualization
        setupAudioMonitoring(
          true,
          streamRef,
          audioContextRef,
          analyserRef,
          microphoneRef,
          setAudioLevel
        )
          .then(() => {
            // Start monitoring audio levels for visualization
            startAudioLevelMonitoring(
              analyserRef,
              setAudioLevel,
              animationFrameIdRef
            );
          })
          .catch((error) => {
            logDebug(`Audio monitoring setup error: ${String(error)}`);
          });
      };

      // Handle speech start event
      recognition.onspeechstart = () => {
        logDebug('👄 Speech detected');
        setIsProcessing(true);
      };

      // Handle speech end event
      recognition.onspeechend = () => {
        logDebug('🤐 Speech ended');
        setIsProcessing(false);
      };

      // Handle audio start event
      recognition.onaudiostart = () => {
        logDebug('🔊 Audio capturing started');
      };

      // Handle audio end event
      recognition.onaudioend = () => {
        logDebug('🔇 Audio capturing ended');
      };

      // Handle recognition results
      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimResult = '';

        // Process all recognition results
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0]?.transcript || '';

          // High confidence results are considered final
          if (result.isFinal) {
            const confidence = result[0]?.confidence || 0;

            if (confidence >= confidenceThreshold) {
              finalTranscript += transcript;
              logDebug(
                `✅ Final transcript: "${transcript}" (confidence: ${confidence.toFixed(2)})`
              );
            } else {
              logDebug(
                `⚠️ Rejected low confidence transcript: "${transcript}" (confidence: ${confidence.toFixed(2)})`
              );
            }
          } else {
            interimResult += transcript;
            logDebug(`⏳ Interim transcript: "${transcript}"`);
          }
        }

        // Update transcript state if we have results
        if (finalTranscript) {
          setCurrentTranscript((prev) =>
            (prev ? `${prev} ${finalTranscript}` : finalTranscript).trim()
          );
        }

        if (interimResult) {
          setInterimTranscript(interimResult);
        }
      };

      // Handle recognition errors
      recognition.onerror = (event: any) => {
        const errorMessage = event.error || 'Unknown error';
        logDebug(`❌ Speech recognition error: ${errorMessage}`, event);

        // Different error handling based on platform
        if (iosInfo.isIOS) {
          handleIOSError(errorMessage);
        } else if (androidInfo.isAndroid) {
          handleAndroidError(errorMessage);
        } else {
          handleGenericError(errorMessage);
        }

        // Stop audio monitoring on error
        stopAudioMonitoring(
          streamRef,
          audioContextRef,
          microphoneRef,
          analyserRef,
          setAudioLevel
        );

        setIsProcessing(false);
      };

      // Handle recognition end event
      recognition.onend = () => {
        logDebug('🛑 Speech recognition ended');
        setIsListening(false);
        setIsProcessing(false);

        // Stop audio monitoring
        stopAudioMonitoring(
          streamRef,
          audioContextRef,
          microphoneRef,
          analyserRef,
          setAudioLevel
        );

        // Auto-restart if configured and not manually stopped
        if (
          autoRestart &&
          !isManualStopRef.current &&
          shouldRestartRef.current
        ) {
          const restartDelay = calculateRestartDelay();

          logDebug(`🔄 Scheduling recognition restart in ${restartDelay}ms`);

          // Clear any existing timeout
          if (restartTimeoutRef.current) {
            clearTimeout(restartTimeoutRef.current);
          }

          // Set a timeout to restart recognition
          restartTimeoutRef.current = setTimeout(() => {
            if (shouldRestartRef.current) {
              logDebug('🔄 Auto-restarting speech recognition');
              try {
                recognition.start();
              } catch (error) {
                logDebug(`❌ Auto-restart failed: ${String(error)}`);
                setError(`Auto-restart failed: ${String(error)}`);

                // Try one more time after a delay
                setTimeout(() => {
                  if (shouldRestartRef.current) {
                    try {
                      recognition.start();
                    } catch (secondError) {
                      logDebug(
                        `❌ Second auto-restart attempt failed: ${String(secondError)}`
                      );
                      setError(
                        `Speech recognition failed to restart. Please try again.`
                      );
                      shouldRestartRef.current = false;
                    }
                  }
                }, 1000);
              }
            }
          }, restartDelay);
        }
      };
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
   * Calculate delay for auto-restart based on how long recognition was running
   */
  const calculateRestartDelay = () => {
    const now = Date.now();
    const runningTime = now - lastStartTimeRef.current;

    // Use longer delays for very short recognition sessions
    // to avoid rapid cycling when there's an issue
    if (runningTime < 1000) {
      return 2000; // 2 seconds for very short sessions
    } else if (runningTime < 5000) {
      return 1000; // 1 second for short sessions
    } else {
      return 300; // 300ms for normal sessions
    }
  };

  /**
   * Handle iOS-specific recognition errors
   */
  const handleIOSError = (errorMessage: string) => {
    if (
      errorMessage.includes('not-allowed') ||
      errorMessage.includes('denied')
    ) {
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
        description:
          'Speech recognition requires an active internet connection.',
        variant: 'destructive',
      });
    } else {
      setError(`iOS speech recognition error: ${errorMessage}`);
    }
  };

  /**
   * Handle Android-specific recognition errors
   */
  const handleAndroidError = (errorMessage: string) => {
    if (
      errorMessage.includes('not-allowed') ||
      errorMessage.includes('denied')
    ) {
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
        description:
          'Speech recognition requires an active internet connection.',
        variant: 'destructive',
      });
    } else {
      setError(`Android microphone error: ${errorMessage}`);
    }
  };

  /**
   * Handle generic recognition errors
   */
  const handleGenericError = (errorMessage: string) => {
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
  };

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
        handleIOSError(error instanceof Error ? error.message : String(error));
      } else if (androidInfo.isAndroid) {
        handleAndroidError(
          error instanceof Error ? error.message : String(error)
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
