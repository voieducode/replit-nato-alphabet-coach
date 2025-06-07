import type { SpeechRecognitionInstance } from './speech-recognition-types';
// Speech recognition utility functions
import { logDebug } from '../../lib/debug-logger';
import { getAndroidInfo, getMediaDevicesInfo } from './platform-detection';

/**
 * Test microphone access with comprehensive diagnostics
 */
export async function testMicrophoneAccess(toast: any): Promise<boolean> {
  const androidInfo = getAndroidInfo();

  logDebug('🎤 Starting comprehensive microphone test', {
    environment: {
      userAgent: navigator.userAgent,
      ...androidInfo,
    },
  });

  // Get media devices info for diagnostics
  const mediaDevicesInfo = await getMediaDevicesInfo();
  logDebug('📱 Media devices information', mediaDevicesInfo);

  try {
    // Create audio context for testing
    const AudioContext =
      window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) {
      throw new Error('AudioContext not supported');
    }

    const audioContext = new AudioContext();

    // Attempt to access the microphone
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
      video: false,
    });

    // Create media source and analyzer to test audio data flow
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
    };

    logDebug('❌ Microphone test failed with detailed context', errorInfo);

    if (androidInfo.isAndroid) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      if (
        errorMessage.includes('permission') ||
        errorMessage.includes('denied')
      ) {
        toast({
          title: 'Microphone Permission Required',
          description:
            'Please allow microphone access to use voice input features.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Microphone Error',
          description:
            'Could not access microphone. Please check browser settings.',
          variant: 'destructive',
        });
      }
    } else {
      toast({
        title: 'Microphone Error',
        description: 'Could not access microphone. Please check permissions.',
        variant: 'destructive',
      });
    }

    return false;
  }
}

/**
 * Initialize speech recognition instance with proper event handlers
 */
export function initializeSpeechRecognition(
  continuous: boolean,
  interimResults: boolean,
  maxAlternatives: number,
  language: string,
  handleStart: () => void,
  handleResult: (event: any) => void,
  handleError: (event: any) => void,
  handleEnd: () => void,
  handleSpeechStart: () => void,
  handleSpeechEnd: () => void
): SpeechRecognitionInstance | null {
  // Check if API is available
  const SpeechRecognition =
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    logDebug('Speech Recognition API not available');
    return null;
  }

  try {
    // Create new instance
    const recognition = new SpeechRecognition();

    // Configure instance
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.maxAlternatives = maxAlternatives;
    recognition.lang = language;

    // Attach event handlers
    recognition.onstart = handleStart;
    recognition.onresult = handleResult;
    recognition.onerror = handleError;
    recognition.onend = handleEnd;

    // Additional events if available
    if ('onspeechstart' in recognition) {
      recognition.onspeechstart = handleSpeechStart;
    }
    if ('onspeechend' in recognition) {
      recognition.onspeechend = handleSpeechEnd;
    }

    return recognition;
  } catch (error) {
    logDebug('Error initializing speech recognition:', error);
    return null;
  }
}
