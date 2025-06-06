import { useCallback, useEffect, useRef, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { logDebug } from '../lib/debug-logger';

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

// Enhanced Android detection with detailed info
function getAndroidInfo(): {
  isAndroid: boolean;
  androidVersion: string | null;
  chromeVersion: string | null;
  isWebView: boolean;
  browser: string;
} {
  const ua = navigator.userAgent;
  const isAndroid = /Android/i.test(ua);

  let androidVersion = null;
  let chromeVersion = null;
  let isWebView = false;
  let browser = 'unknown';

  if (isAndroid) {
    // Extract Android version
    const androidMatch = ua.match(/Android\s+([\d.]+)/i);
    androidVersion = androidMatch ? androidMatch[1] : null;

    // Extract Chrome version
    const chromeMatch = ua.match(/Chrome\/([\d.]+)/i);
    chromeVersion = chromeMatch ? chromeMatch[1] : null;

    // Detect WebView
    isWebView =
      ua.includes('wv') || (ua.includes('Version/') && ua.includes('Chrome'));

    // Determine browser
    if (ua.includes('Chrome/') && !ua.includes('Edg/')) {
      browser = isWebView ? 'WebView' : 'Chrome';
    } else if (ua.includes('Firefox/')) {
      browser = 'Firefox';
    } else if (ua.includes('Opera/') || ua.includes('OPR/')) {
      browser = 'Opera';
    } else if (ua.includes('Samsung')) {
      browser = 'Samsung Internet';
    } else {
      browser = 'Other';
    }
  }

  return {
    isAndroid,
    androidVersion,
    chromeVersion,
    isWebView,
    browser,
  };
}

// Simple Android check for backward compatibility
function isAndroid(): boolean {
  return getAndroidInfo().isAndroid;
}

// Enhanced security context detection
function getSecurityContext(): {
  isSecure: boolean;
  protocol: string;
  hostname: string;
  port: string;
  isLocalhost: boolean;
  details: string[];
} {
  const isSecure =
    window.isSecureContext ||
    location.protocol === 'https:' ||
    location.hostname === 'localhost' ||
    location.hostname === '127.0.0.1';

  const details = [];
  if (window.isSecureContext) {
    details.push('window.isSecureContext=true');
  }
  if (location.protocol === 'https:') {
    details.push('HTTPS protocol');
  }
  if (location.hostname === 'localhost') {
    details.push('localhost hostname');
  }
  if (location.hostname === '127.0.0.1') {
    details.push('127.0.0.1 hostname');
  }

  return {
    isSecure,
    protocol: location.protocol,
    hostname: location.hostname,
    port: location.port || 'default',
    isLocalhost:
      location.hostname === 'localhost' || location.hostname === '127.0.0.1',
    details,
  };
}

// Detect if we're on HTTPS (required for microphone on Android)
function isSecureContext(): boolean {
  return getSecurityContext().isSecure;
}

// Enhanced user gesture detection with timing info
function getUserGestureInfo(): {
  hasGesture: boolean;
  lastInteraction: number;
  timeSinceInteraction: number;
  documentHasFocus: boolean;
  gestureDetails: string[];
} {
  const now = Date.now();
  const lastInteraction = (window as any).__lastUserInteraction || 0;
  const timeSinceInteraction = now - lastInteraction;
  const documentHasFocus = document.hasFocus();
  const hasGesture = documentHasFocus && timeSinceInteraction < 5000;

  const gestureDetails = [];
  if (documentHasFocus) {
    gestureDetails.push('document has focus');
  }
  if (lastInteraction > 0) {
    gestureDetails.push(`last interaction: ${timeSinceInteraction}ms ago`);
  }
  if (hasGesture) {
    gestureDetails.push('valid user gesture');
  }

  return {
    hasGesture,
    lastInteraction,
    timeSinceInteraction,
    documentHasFocus,
    gestureDetails,
  };
}

// Check if we have user gesture (required for microphone access on Android)
function hasUserGesture(): boolean {
  return getUserGestureInfo().hasGesture;
}

// Get network connection info
function getNetworkInfo(): {
  online: boolean;
  connectionType: string;
  effectiveType: string;
  downlink: number | null;
  rtt: number | null;
} {
  const connection =
    (navigator as any).connection ||
    (navigator as any).mozConnection ||
    (navigator as any).webkitConnection;

  return {
    online: navigator.onLine,
    connectionType: connection?.type || 'unknown',
    effectiveType: connection?.effectiveType || 'unknown',
    downlink: connection?.downlink || null,
    rtt: connection?.rtt || null,
  };
}

// Get media devices info
async function getMediaDevicesInfo(): Promise<{
  available: boolean;
  audioInputDevices: number;
  permissions: {
    microphone: string;
  };
}> {
  try {
    if (!navigator.mediaDevices) {
      return {
        available: false,
        audioInputDevices: 0,
        permissions: { microphone: 'unavailable' },
      };
    }

    const devices = await navigator.mediaDevices.enumerateDevices();
    const audioInputDevices = devices.filter(
      (d) => d.kind === 'audioinput'
    ).length;

    let micPermission = 'unknown';
    try {
      if (navigator.permissions) {
        const permission = await navigator.permissions.query({
          name: 'microphone' as PermissionName,
        });
        micPermission = permission.state;
      }
    } catch (e) {
      micPermission = 'query-failed';
    }

    return {
      available: true,
      audioInputDevices,
      permissions: { microphone: micPermission },
    };
  } catch (error) {
    return {
      available: false,
      audioInputDevices: 0,
      permissions: { microphone: 'error' },
    };
  }
}

// Track user interactions for gesture detection
function trackUserGesture() {
  (window as any).__lastUserInteraction = Date.now();
}

// Initialize gesture tracking
if (typeof window !== 'undefined') {
  ['click', 'touchstart', 'keydown'].forEach((event) => {
    document.addEventListener(event, trackUserGesture, { passive: true });
  });
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
  const isManualStopRef = useRef(false);
  const lastStartTimeRef = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const micDeniedToastShownRef = useRef(false);
  const langNotSupportedToastShownRef = useRef(false);
  const networkErrorToastShownRef = useRef(false);
  const serviceNotAllowedToastShownRef = useRef(false);

  const { toast } = useToast();

  // Debug logging
  // Use shared logDebug for all debug logs

  // Keep callback ref updated
  useEffect(() => {
    onTranscriptReceivedRef.current = onTranscriptReceived;
  }, [onTranscriptReceived]);

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
    micDeniedToastShownRef.current = false;
    langNotSupportedToastShownRef.current = false;
    networkErrorToastShownRef.current = false;
    serviceNotAllowedToastShownRef.current = false;
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
      logDebug('Audio monitoring started');
      return true;
    } catch (error) {
      logDebug(`Failed to start audio monitoring: ${String(error)}`);
      return false;
    }
  }, [isListening]);

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
    logDebug('Audio monitoring stopped');
  }, []);

  // Test microphone access
  const testMicrophone = useCallback(async (): Promise<boolean> => {
    const androidInfo = getAndroidInfo();
    const securityContext = getSecurityContext();
    const gestureInfo = getUserGestureInfo();
    const networkInfo = getNetworkInfo();

    logDebug('🎤 Starting comprehensive microphone test', {
      environment: {
        userAgent: navigator.userAgent,
        ...androidInfo,
        ...securityContext,
        ...gestureInfo,
        ...networkInfo,
      },
    });

    // Get media devices info
    const mediaDevicesInfo = await getMediaDevicesInfo();
    logDebug('📱 Media devices information', mediaDevicesInfo);

    // Android-specific checks before attempting microphone access
    if (androidInfo.isAndroid) {
      logDebug('🤖 Android device detected - performing additional checks', {
        androidVersion: androidInfo.androidVersion,
        browser: androidInfo.browser,
        chromeVersion: androidInfo.chromeVersion,
        isWebView: androidInfo.isWebView,
      });

      if (!securityContext.isSecure) {
        logDebug('❌ Android microphone test failed: HTTPS required', {
          protocol: securityContext.protocol,
          hostname: securityContext.hostname,
          port: securityContext.port,
          securityDetails: securityContext.details,
        });
        setError('HTTPS is required for microphone access on Android devices');
        toast({
          title: 'HTTPS Required',
          description:
            'Microphone access requires a secure connection on Android devices.',
          variant: 'destructive',
        });
        return false;
      }

      if (!gestureInfo.hasGesture) {
        logDebug('❌ Android microphone test failed: User gesture required', {
          documentHasFocus: gestureInfo.documentHasFocus,
          lastInteraction: gestureInfo.lastInteraction,
          timeSinceInteraction: gestureInfo.timeSinceInteraction,
          gestureDetails: gestureInfo.gestureDetails,
        });
        setError('User interaction required before testing microphone');
        toast({
          title: 'User Interaction Required',
          description:
            'Please interact with the page before testing microphone.',
          variant: 'destructive',
        });
        return false;
      }

      logDebug('✅ Android pre-checks passed', {
        secureContext: true,
        userGesture: true,
        networkOnline: networkInfo.online,
      });
    }

    try {
      const audioConstraints = {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
        // Android-specific optimizations
        ...(androidInfo.isAndroid && {
          sampleRate: 16000,
          channelCount: 1,
        }),
      };

      logDebug('🎵 Requesting microphone access with constraints', {
        constraints: audioConstraints,
        mediaDevicesAvailable: !!navigator.mediaDevices,
        getUserMediaAvailable: !!navigator.mediaDevices?.getUserMedia,
      });

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: audioConstraints,
      });

      logDebug('✅ Microphone stream obtained', {
        streamId: stream.id,
        tracks: stream.getTracks().map((track) => ({
          id: track.id,
          kind: track.kind,
          label: track.label,
          enabled: track.enabled,
          muted: track.muted,
          readyState: track.readyState,
          settings: track.getSettings?.() || 'not available',
        })),
      });

      // Test that we actually get audio data
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();

      logDebug('🔊 Testing audio context', {
        audioContextState: audioContext.state,
        sampleRate: audioContext.sampleRate,
        baseLatency: audioContext.baseLatency,
        outputLatency: audioContext.outputLatency,
      });

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      source.connect(analyser);

      // Quick test to see if audio data is flowing
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(dataArray);
      const audioDataSum = dataArray.reduce((a, b) => a + b, 0);

      logDebug('📊 Audio data test', {
        frequencyBinCount: analyser.frequencyBinCount,
        fftSize: analyser.fftSize,
        audioDataSum,
        hasAudioData: audioDataSum > 0,
      });

      // Clean up
      stream.getTracks().forEach((track) => track.stop());
      audioContext.close();

      logDebug('✅ Microphone test successful - all systems operational');
      return true;
    } catch (error) {
      const errorInfo = {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        androidInfo,
        securityContext,
        gestureInfo,
        networkInfo,
        mediaDevicesInfo,
      };

      logDebug('❌ Microphone test failed with detailed context', errorInfo);

      if (androidInfo.isAndroid) {
        const errorMessage = errorInfo.message;
        const errorName = errorInfo.name;

        logDebug('🚨 Android-specific error analysis', {
          errorName,
          errorMessage,
          isPermissionError:
            errorName === 'NotAllowedError' ||
            errorMessage.includes('Permission denied'),
          isDeviceError: errorName === 'NotFoundError',
          isInUseError:
            errorName === 'NotReadableError' || errorMessage.includes('in use'),
          isNetworkError:
            errorMessage.includes('network') ||
            errorMessage.includes('offline'),
          commonAndroidIssues: {
            chromeVersion: androidInfo.chromeVersion,
            isWebView: androidInfo.isWebView,
            androidVersion: androidInfo.androidVersion,
            potentialIssues: [
              androidInfo.chromeVersion &&
              Number.parseInt(androidInfo.chromeVersion.split('.')[0]) < 70
                ? 'Old Chrome version'
                : null,
              androidInfo.isWebView
                ? 'WebView may have limited microphone support'
                : null,
              !networkInfo.online ? 'Device appears offline' : null,
              mediaDevicesInfo.audioInputDevices === 0
                ? 'No audio input devices detected'
                : null,
            ].filter(Boolean),
          },
        });

        if (
          errorName === 'NotAllowedError' ||
          errorMessage.includes('Permission denied')
        ) {
          setError(
            'Microphone permission denied. Please enable microphone access in browser settings.'
          );
          toast({
            title: 'Microphone Permission Denied',
            description:
              'Go to browser settings and allow microphone access for this site.',
            variant: 'destructive',
          });
        } else if (errorName === 'NotFoundError') {
          setError('No microphone found on this Android device');
          toast({
            title: 'No Microphone Found',
            description:
              'This Android device does not have a microphone or it is not accessible.',
            variant: 'destructive',
          });
        } else if (
          errorName === 'NotReadableError' ||
          errorMessage.includes('in use')
        ) {
          setError('Microphone is being used by another application');
          toast({
            title: 'Microphone In Use',
            description:
              'The microphone is being used by another app. Please close other apps and try again.',
            variant: 'destructive',
          });
        } else {
          setError(`Android microphone error: ${errorMessage}`);
        }
      } else {
        setError('Microphone access denied or not available');
      }
      return false;
    }
  }, [toast]);

  // Enhanced event handlers
  const handleStart = useCallback(() => {
    logDebug('Speech recognition started');
    setIsListening(true);
    setIsProcessing(false);
    setError(null);
    startAudioMonitoring();
  }, [startAudioMonitoring]);

  const handleResult = useCallback(
    (event: any) => {
      try {
        logDebug('Speech recognition result event', event);

        if (!event.results || event.results.length === 0) {
          logDebug('No results in event');
          return;
        }

        let finalTranscript = '';
        let interim = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          const transcript = result[0].transcript;
          const confidence = result[0].confidence;

          logDebug(
            `Result ${i}: "${transcript}" (confidence: ${confidence}, final: ${result.isFinal})`
          );

          if (result.isFinal) {
            // Only accept results above confidence threshold
            if (confidence >= confidenceThreshold) {
              finalTranscript += transcript;
            } else {
              logDebug(
                `Rejecting low confidence result: ${confidence} < ${confidenceThreshold}`
              );
            }
          } else {
            interim += transcript;
          }
        }

        if (interim) {
          setInterimTranscript(interim.toLowerCase().trim());
          logDebug(`Interim transcript: ${interim}`);
        }

        if (finalTranscript) {
          const cleanTranscript = finalTranscript.toLowerCase().trim();
          setCurrentTranscript(cleanTranscript);
          setInterimTranscript('');
          logDebug(`Final transcript: ${cleanTranscript}`);

          if (cleanTranscript) {
            onTranscriptReceivedRef.current(cleanTranscript);
          }
        }
      } catch (error) {
        logDebug(`Error processing speech result: ${String(error)}`);
        setError('Error processing speech result');
      }
    },
    [confidenceThreshold]
  );

  const handleEnd = useCallback(() => {
    const now = Date.now();
    const timeSinceLastStart = now - lastStartTimeRef.current;

    logDebug(
      `Speech recognition ended, autoRestart: ${autoRestart}, shouldRestart: ${shouldRestartRef.current}, isManualStop: ${isManualStopRef.current}, timeSinceLastStart: ${timeSinceLastStart}`
    );

    setIsListening(false);
    setIsProcessing(false);
    setInterimTranscript('');
    stopAudioMonitoring();

    // Only auto-restart if:
    // 1. autoRestart is enabled
    // 2. shouldRestart is true (not manually stopped)
    // 3. it's not a manual stop
    // 4. enough time has passed since last start (prevent rapid restarts)
    // 5. recognition instance still exists
    if (
      autoRestart &&
      shouldRestartRef.current &&
      !isManualStopRef.current &&
      timeSinceLastStart > 1000 && // At least 1 second since last start
      recognitionRef.current
    ) {
      logDebug('Auto-restarting speech recognition in 1000ms');
      restartTimeoutRef.current = window.setTimeout(() => {
        if (
          shouldRestartRef.current &&
          !isManualStopRef.current &&
          recognitionRef.current
        ) {
          try {
            lastStartTimeRef.current = Date.now();
            recognitionRef.current.start();
          } catch (error) {
            logDebug(`Error restarting speech recognition: ${String(error)}`);
            setError('Failed to restart speech recognition');
            shouldRestartRef.current = false; // Stop trying to restart
          }
        }
      }, 1000); // Increased delay to prevent rapid restarts
    } else {
      logDebug('Skipping auto-restart due to conditions not met');
    }

    // Reset manual stop flag after a delay
    if (isManualStopRef.current) {
      setTimeout(() => {
        isManualStopRef.current = false;
      }, 2000);
    }
  }, [autoRestart, stopAudioMonitoring]);

  const handleError = useCallback(
    (event: any) => {
      logDebug(`Speech recognition error: ${event.error}`, event);
      setIsListening(false);
      setIsProcessing(false);
      setInterimTranscript('');
      stopAudioMonitoring();

      // Handle different error types
      switch (event.error) {
        case 'language-not-supported':
          setError(`Language "${language}" not supported`);
          if (!langNotSupportedToastShownRef.current) {
            toast({
              title: 'Language Not Supported',
              description: `Try switching to a supported language. Currently using: ${language}`,
              variant: 'destructive',
            });
            langNotSupportedToastShownRef.current = true;
          }
          break;
        case 'not-allowed':
          setError('Microphone access denied');
          if (!micDeniedToastShownRef.current) {
            toast({
              title: 'Microphone Access Denied',
              description:
                'Please allow microphone access in browser settings and refresh the page.',
              variant: 'destructive',
            });
            micDeniedToastShownRef.current = true;
          }
          break;
        case 'network':
          setError('Network error - speech recognition requires internet');
          if (!networkErrorToastShownRef.current) {
            toast({
              title: 'Network Error',
              description:
                'Speech recognition requires an internet connection.',
              variant: 'destructive',
            });
            networkErrorToastShownRef.current = true;
          }
          break;
        case 'no-speech':
          logDebug('No speech detected - this is normal');
          // Don't show error for no-speech, it's common
          break;
        case 'aborted':
          logDebug('Speech recognition aborted - this is normal when stopping');
          // Don't show error for aborted, it's expected when stopping
          break;
        case 'service-not-allowed':
          setError('Speech recognition service not allowed');
          if (!serviceNotAllowedToastShownRef.current) {
            toast({
              title: 'Service Not Allowed',
              description:
                'Speech recognition service is not allowed on this page.',
              variant: 'destructive',
            });
            serviceNotAllowedToastShownRef.current = true;
          }
          break;
        default:
          setError(`Speech recognition error: ${event.error}`);
          logDebug(`Unknown error: ${event.error}`);
      }
    },
    [language, toast, stopAudioMonitoring]
  );

  const handleSpeechStart = useCallback(() => {
    logDebug('Speech started');
    setIsProcessing(true);
  }, []);

  const handleSpeechEnd = useCallback(() => {
    logDebug('Speech ended');
    setIsProcessing(false);
  }, []);

  // Initialize once on mount - ONLY run this effect once
  useEffect(() => {
    const initialize = () => {
      if (isInitializedRef.current) {
        return speechSupported;
      }

      logDebug('Initializing speech recognition...');

      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        logDebug('Speech Recognition API not supported');
        isInitializedRef.current = true;
        setSpeechSupported(false);
        setError('Speech recognition not supported in this browser');
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
        setSpeechSupported(true);

        logDebug('Speech recognition initialized successfully', {
          continuous,
          interimResults,
          maxAlternatives,
          language,
          confidenceThreshold,
        });

        return true;
      } catch (error) {
        logDebug(`Failed to initialize speech recognition: ${String(error)}`);
        setError('Failed to initialize speech recognition');
        toast({
          title: 'Speech Recognition Error',
          description: 'Failed to initialize speech recognition.',
          variant: 'destructive',
        });
        isInitializedRef.current = true;
        setSpeechSupported(false);
        return false;
      }
    };

    initialize();

    return () => {
      logDebug('Cleaning up speech recognition');
      shouldRestartRef.current = false;
      isManualStopRef.current = true; // Prevent any restart attempts during cleanup

      if (restartTimeoutRef.current) {
        clearTimeout(restartTimeoutRef.current);
        restartTimeoutRef.current = null;
      }

      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (error) {
          logDebug(`Error stopping speech recognition: ${String(error)}`);
        }
        recognitionRef.current = null;
      }

      // Clean up audio monitoring
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

      isInitializedRef.current = false;
    };
  }, []); // Empty dependency array - only run once on mount

  const startListening = useCallback(async () => {
    const androidInfo = getAndroidInfo();
    const securityContext = getSecurityContext();
    const gestureInfo = getUserGestureInfo();
    const networkInfo = getNetworkInfo();

    logDebug(
      '🎙️ Starting speech recognition with comprehensive environment check',
      {
        currentState: {
          speechSupported,
          isListening,
          recognitionRef: !!recognitionRef.current,
          hasRecognitionAPI:
            !!(window as any).SpeechRecognition ||
            !!(window as any).webkitSpeechRecognition,
        },
        environment: {
          ...androidInfo,
          ...securityContext,
          ...gestureInfo,
          ...networkInfo,
        },
      }
    );

    if (!speechSupported) {
      logDebug('❌ Speech recognition not supported - aborting', {
        availableAPIs: {
          SpeechRecognition: !!(window as any).SpeechRecognition,
          webkitSpeechRecognition: !!(window as any).webkitSpeechRecognition,
          mediaDevices: !!navigator.mediaDevices,
          getUserMedia: !!navigator.mediaDevices?.getUserMedia,
        },
      });
      setError('Speech recognition not supported in this browser');
      return;
    }

    if (!recognitionRef.current) {
      logDebug('❌ Speech recognition not initialized - aborting');
      setError('Speech recognition not initialized');
      return;
    }

    if (isListening) {
      logDebug('⚠️ Already listening - ignoring start request');
      return;
    }

    // Get fresh media devices info for Android debugging
    const mediaDevicesInfo = await getMediaDevicesInfo();

    // Android-specific comprehensive validation
    if (androidInfo.isAndroid) {
      logDebug(
        '🤖 Android device detected - performing comprehensive validation',
        {
          deviceInfo: {
            androidVersion: androidInfo.androidVersion,
            browser: androidInfo.browser,
            chromeVersion: androidInfo.chromeVersion,
            isWebView: androidInfo.isWebView,
          },
          capabilities: {
            ...mediaDevicesInfo,
            speechRecognitionAPI: !!recognitionRef.current,
            audioContextSupported: !!(
              window.AudioContext || (window as any).webkitAudioContext
            ),
          },
        }
      );

      if (!securityContext.isSecure) {
        logDebug('❌ Android security check failed - HTTPS required', {
          currentContext: securityContext,
          requirement: 'HTTPS or localhost for microphone access on Android',
        });
        setError('HTTPS is required for microphone access on Android devices');
        toast({
          title: 'HTTPS Required',
          description:
            'Voice input requires a secure connection on Android. Please use HTTPS.',
          variant: 'destructive',
        });
        return;
      }

      if (!gestureInfo.hasGesture) {
        logDebug(
          '❌ Android gesture check failed - user interaction required',
          {
            gestureInfo,
            requirement:
              'Recent user interaction (within 5 seconds) required for microphone access',
          }
        );
        setError('User interaction required before using microphone');
        toast({
          title: 'User Interaction Required',
          description:
            'Please tap the microphone button to enable voice input.',
          variant: 'destructive',
        });
        return;
      }

      if (!networkInfo.online) {
        logDebug('❌ Android network check failed - offline detected', {
          networkInfo,
          requirement: 'Internet connection required for speech recognition',
        });
        setError('Internet connection required for speech recognition');
        toast({
          title: 'Network Required',
          description:
            'Speech recognition requires an active internet connection.',
          variant: 'destructive',
        });
        return;
      }

      // Check for known Android issues
      const potentialIssues = [];
      if (
        androidInfo.chromeVersion &&
        Number.parseInt(androidInfo.chromeVersion.split('.')[0]) < 70
      ) {
        potentialIssues.push(
          'Chrome version may be too old for reliable speech recognition'
        );
      }
      if (androidInfo.isWebView) {
        potentialIssues.push(
          'WebView environment may have limited speech recognition support'
        );
      }
      if (mediaDevicesInfo.audioInputDevices === 0) {
        potentialIssues.push('No audio input devices detected');
      }

      if (potentialIssues.length > 0) {
        logDebug('⚠️ Android compatibility issues detected', {
          issues: potentialIssues,
          recommendation: 'May experience reduced functionality',
        });
      }

      logDebug('✅ Android validation passed - all requirements met', {
        secureContext: true,
        userGesture: true,
        networkOnline: true,
        audioDevices: mediaDevicesInfo.audioInputDevices,
        microphonePermission: mediaDevicesInfo.permissions.microphone,
      });
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
      recognitionRef.current.start();
    } catch (error) {
      logDebug(`Error starting speech recognition: ${String(error)}`);
      setIsListening(false);

      // Enhanced error handling for Android
      if (isAndroid()) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
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
          setError(
            'Network connection required for speech recognition on Android'
          );
          toast({
            title: 'Network Required',
            description:
              'Speech recognition requires an active internet connection.',
            variant: 'destructive',
          });
        } else {
          setError(`Android microphone error: ${errorMessage}`);
        }
      } else {
        setError('Failed to start speech recognition');
      }
    }
  }, [speechSupported, isListening]);

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
        stopAudioMonitoring();
      }
    }

    setInterimTranscript('');
  }, [isListening, stopAudioMonitoring]);

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
