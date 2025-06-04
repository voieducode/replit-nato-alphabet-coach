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
  onspeechstart?: () => void;
  onspeechend?: () => void;
  onaudiostart?: () => void;
  onaudioend?: () => void;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

interface SpeechRecognitionConfig {
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
  language?: string;
  confidenceThreshold?: number;
  autoRestart?: boolean;
  debugMode?: boolean;
}

interface SpeechRecognitionHookResult {
  isListening: boolean;
  isProcessing: boolean;
  speechSupported: boolean;
  currentTranscript: string;
  interimTranscript: string;
  audioLevel: number;
  error: string | null;
  startListening: () => void;
  stopListening: () => void;
  testMicrophone: () => Promise<boolean>;
  clearError: () => void;
}

// Detect browser language with fallback
function detectLanguage(): string {
  const browserLang = navigator.language || navigator.languages?.[0] || 'en-US';

  // Map common language codes to speech recognition supported languages
  const langMap: Record<string, string> = {
    en: 'en-US',
    'en-GB': 'en-GB',
    'en-AU': 'en-AU',
    'en-CA': 'en-CA',
    es: 'es-ES',
    'es-MX': 'es-MX',
    'es-US': 'es-US',
    fr: 'fr-FR',
    'fr-CA': 'fr-CA',
    de: 'de-DE',
    it: 'it-IT',
    pt: 'pt-BR',
    zh: 'zh-CN',
    ja: 'ja-JP',
    ko: 'ko-KR',
    ru: 'ru-RU',
    ar: 'ar-SA',
    hi: 'hi-IN',
  };

  const exactMatch = langMap[browserLang];
  if (exactMatch) {
    return exactMatch;
  }

  const languageOnly = browserLang.split('-')[0];
  const fallbackMatch = langMap[languageOnly];
  if (fallbackMatch) {
    return fallbackMatch;
  }

  return 'en-US'; // Ultimate fallback
}

/**
 * Enhanced custom hook for speech recognition functionality
 *
 * @param onTranscriptReceived Callback function that receives the final transcript text
 * @param config Optional configuration object
 * @returns Object containing speech recognition state and control functions
 */
export function useSpeechRecognition(
  onTranscriptReceived: (transcript: string) => void,
  config: SpeechRecognitionConfig = {}
): SpeechRecognitionHookResult {
  const {
    continuous = true,
    interimResults = true,
    maxAlternatives = 3,
    language = detectLanguage(),
    confidenceThreshold = 0.7,
    autoRestart = true,
    debugMode = false,
  } = config;

  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [currentTranscript, setCurrentTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const isInitializedRef = useRef(false);
  const onTranscriptReceivedRef = useRef(onTranscriptReceived);
  const shouldRestartRef = useRef(false);
  const restartTimeoutRef = useRef<number | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const { toast } = useToast();

  // Debug logging
  const debugLog = useCallback(
    (message: string, ...args: any[]) => {
      if (debugMode) {
        console.warn(`[SpeechRecognition] ${message}`, ...args);
      }
    },
    [debugMode]
  );

  // Keep callback ref updated
  useEffect(() => {
    onTranscriptReceivedRef.current = onTranscriptReceived;
  }, [onTranscriptReceived]);

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Safe state setters to avoid direct state updates in useEffect
  const setSpeechSupportedSafely = useCallback((supported: boolean) => {
    setSpeechSupported(supported);
  }, []);

  const setErrorSafely = useCallback((errorMessage: string | null) => {
    setError(errorMessage);
  }, []);

  // Audio level monitoring
  const startAudioMonitoring = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;

      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;

      const microphone = audioContext.createMediaStreamSource(stream);
      microphoneRef.current = microphone;
      microphone.connect(analyser);

      const dataArray = new Uint8Array(analyser.frequencyBinCount);

      const updateAudioLevel = () => {
        if (analyser && isListening) {
          analyser.getByteFrequencyData(dataArray);
          const sum = dataArray.reduce((a, b) => a + b, 0);
          const average = sum / dataArray.length;
          setAudioLevel(Math.round((average / 255) * 100));
          requestAnimationFrame(updateAudioLevel);
        }
      };

      updateAudioLevel();
      debugLog('Audio monitoring started');
      return true;
    } catch (error) {
      debugLog('Failed to start audio monitoring:', error);
      return false;
    }
  }, [isListening, debugLog]);

  // Stop audio monitoring
  const stopAudioMonitoring = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    microphoneRef.current = null;
    analyserRef.current = null;
    setAudioLevel(0);
    debugLog('Audio monitoring stopped');
  }, [debugLog]);

  // Test microphone access
  const testMicrophone = useCallback(async (): Promise<boolean> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());
      debugLog('Microphone test successful');
      return true;
    } catch (error) {
      debugLog('Microphone test failed:', error);
      setError('Microphone access denied or not available');
      return false;
    }
  }, [debugLog]);

  // Enhanced event handlers
  const handleStart = useCallback(() => {
    debugLog('Speech recognition started');
    setIsListening(true);
    setIsProcessing(false);
    setError(null);
    startAudioMonitoring();
  }, [debugLog, startAudioMonitoring]);

  const handleResult = useCallback(
    (event: any) => {
      try {
        debugLog('Speech recognition result event:', event);

        if (!event.results || event.results.length === 0) {
          debugLog('No results in event');
          return;
        }

        let finalTranscript = '';
        let interim = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript;
          const confidence = result[0].confidence;

          debugLog(
            `Result ${i}: "${transcript}" (confidence: ${confidence}, final: ${result.isFinal})`
          );

          if (result.isFinal) {
            // Only accept results above confidence threshold
            if (confidence >= confidenceThreshold) {
              finalTranscript += transcript;
            } else {
              debugLog(
                `Rejecting low confidence result: ${confidence} < ${confidenceThreshold}`
              );
            }
          } else {
            interim += transcript;
          }
        }

        if (interim) {
          setInterimTranscript(interim.toLowerCase().trim());
          debugLog('Interim transcript:', interim);
        }

        if (finalTranscript) {
          const cleanTranscript = finalTranscript.toLowerCase().trim();
          setCurrentTranscript(cleanTranscript);
          setInterimTranscript('');
          debugLog('Final transcript:', cleanTranscript);

          if (cleanTranscript) {
            onTranscriptReceivedRef.current(cleanTranscript);
          }
        }
      } catch (error) {
        debugLog('Error processing speech result:', error);
        setError('Error processing speech result');
      }
    },
    [confidenceThreshold, debugLog]
  );

  const handleEnd = useCallback(() => {
    debugLog(
      'Speech recognition ended, autoRestart:',
      autoRestart,
      'shouldRestart:',
      shouldRestartRef.current
    );
    setIsListening(false);
    setIsProcessing(false);
    setInterimTranscript('');
    stopAudioMonitoring();

    // Auto-restart if configured and we should restart
    if (autoRestart && shouldRestartRef.current && recognitionRef.current) {
      debugLog('Auto-restarting speech recognition in 500ms');
      restartTimeoutRef.current = window.setTimeout(() => {
        if (shouldRestartRef.current && recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch (error) {
            debugLog('Error restarting speech recognition:', error);
            setError('Failed to restart speech recognition');
          }
        }
      }, 500);
    }
  }, [autoRestart, debugLog, stopAudioMonitoring]);

  const handleError = useCallback(
    (event: any) => {
      debugLog('Speech recognition error:', event.error, event);
      setIsListening(false);
      setIsProcessing(false);
      setInterimTranscript('');
      stopAudioMonitoring();

      // Handle different error types
      switch (event.error) {
        case 'language-not-supported':
          setError(`Language "${language}" not supported`);
          toast({
            title: 'Language Not Supported',
            description: `Try switching to a supported language. Currently using: ${language}`,
            variant: 'destructive',
          });
          break;
        case 'not-allowed':
          setError('Microphone access denied');
          toast({
            title: 'Microphone Access Denied',
            description:
              'Please allow microphone access in browser settings and refresh the page.',
            variant: 'destructive',
          });
          break;
        case 'network':
          setError('Network error - speech recognition requires internet');
          toast({
            title: 'Network Error',
            description: 'Speech recognition requires an internet connection.',
            variant: 'destructive',
          });
          break;
        case 'no-speech':
          debugLog('No speech detected - this is normal');
          // Don't show error for no-speech, it's common
          break;
        case 'aborted':
          debugLog('Speech recognition aborted - this is normal when stopping');
          // Don't show error for aborted, it's expected when stopping
          break;
        case 'service-not-allowed':
          setError('Speech recognition service not allowed');
          toast({
            title: 'Service Not Allowed',
            description:
              'Speech recognition service is not allowed on this page.',
            variant: 'destructive',
          });
          break;
        default:
          setError(`Speech recognition error: ${event.error}`);
          debugLog('Unknown error:', event.error);
      }
    },
    [language, toast, debugLog, stopAudioMonitoring]
  );

  const handleSpeechStart = useCallback(() => {
    debugLog('Speech started');
    setIsProcessing(true);
  }, [debugLog]);

  const handleSpeechEnd = useCallback(() => {
    debugLog('Speech ended');
    setIsProcessing(false);
  }, [debugLog]);

  // Initialize speech recognition
  const initializeSpeechRecognition = useCallback(() => {
    if (isInitializedRef.current) {
      return speechSupported;
    }

    debugLog('Initializing speech recognition...');

    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      debugLog('Speech Recognition API not supported');
      isInitializedRef.current = true;
      setSpeechSupportedSafely(false);
      setErrorSafely('Speech recognition not supported in this browser');
      return false;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = continuous;
      recognition.interimResults = interimResults;
      recognition.maxAlternatives = maxAlternatives;
      recognition.lang = language;

      recognition.onstart = handleStart;
      recognition.onresult = handleResult;
      recognition.onerror = handleError;
      recognition.onend = handleEnd;

      // Additional events for better feedback
      if (recognition.onspeechstart !== undefined) {
        recognition.onspeechstart = handleSpeechStart;
      }
      if (recognition.onspeechend !== undefined) {
        recognition.onspeechend = handleSpeechEnd;
      }

      recognitionRef.current = recognition;
      isInitializedRef.current = true;
      setSpeechSupportedSafely(true);

      debugLog('Speech recognition initialized successfully', {
        continuous,
        interimResults,
        maxAlternatives,
        language,
        confidenceThreshold,
      });

      return true;
    } catch (error) {
      debugLog('Failed to initialize speech recognition:', error);
      setErrorSafely('Failed to initialize speech recognition');
      toast({
        title: 'Speech Recognition Error',
        description: 'Failed to initialize speech recognition.',
        variant: 'destructive',
      });
      isInitializedRef.current = true;
      setSpeechSupportedSafely(false);
      return false;
    }
  }, [
    speechSupported,
    continuous,
    interimResults,
    maxAlternatives,
    language,
    confidenceThreshold,
    handleStart,
    handleResult,
    handleError,
    handleEnd,
    handleSpeechStart,
    handleSpeechEnd,
    toast,
    debugLog,
    setSpeechSupportedSafely,
    setErrorSafely,
  ]);

  // Initialize once on mount
  useEffect(() => {
    initializeSpeechRecognition();

    return () => {
      debugLog('Cleaning up speech recognition');
      shouldRestartRef.current = false;

      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = null;
      }

      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (error) {
          debugLog('Error stopping speech recognition:', error);
        }
        recognitionRef.current = null;
      }

      stopAudioMonitoring();
      isInitializedRef.current = false;
    };
  }, [debugLog, initializeSpeechRecognition, stopAudioMonitoring]);

  const startListening = useCallback(() => {
    debugLog('startListening called', {
      speechSupported,
      isListening,
      recognitionRef: !!recognitionRef.current,
    });

    if (!speechSupported) {
      debugLog('Speech recognition not supported');
      setError('Speech recognition not supported in this browser');
      return;
    }

    if (!recognitionRef.current) {
      debugLog('Speech recognition not initialized');
      setError('Speech recognition not initialized');
      return;
    }

    if (isListening) {
      debugLog('Already listening');
      return;
    }

    // Clear any previous timeouts
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }

    shouldRestartRef.current = true;
    setError(null);
    setCurrentTranscript('');
    setInterimTranscript('');

    try {
      debugLog('Starting speech recognition...');
      recognitionRef.current.start();
    } catch (error) {
      debugLog('Error starting speech recognition:', error);
      setIsListening(false);
      setError('Failed to start speech recognition');
    }
  }, [speechSupported, isListening, debugLog]);

  const stopListening = useCallback(() => {
    debugLog('stopListening called');
    shouldRestartRef.current = false;

    // Clear any restart timeouts
    if (restartTimeoutRef.current) {
      clearTimeout(restartTimeoutRef.current);
      restartTimeoutRef.current = null;
    }

    if (recognitionRef.current && isListening) {
      try {
        debugLog('Stopping speech recognition...');
        recognitionRef.current.stop();
      } catch (error) {
        debugLog('Error stopping speech recognition:', error);
        setIsListening(false);
        setIsProcessing(false);
        stopAudioMonitoring();
      }
    }

    setInterimTranscript('');
  }, [isListening, debugLog, stopAudioMonitoring]);

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
