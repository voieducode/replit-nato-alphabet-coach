// Import the Toast types from the UI components
import type { ToastActionElement, ToastProps } from '@/components/ui/toast';
// Recognition event handlers factory for useSpeechRecognition
import { logDebug } from '../../lib/debug-logger';
import {
  setupAudioMonitoring,
  startAudioLevelMonitoring,
} from './audio-monitoring';

import {
  handleAndroidError,
  handleGenericError,
  handleIOSError,
} from './platform-error-handlers';

// Define the Toast type to match what useToast expects (based on use-toast.ts)
type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

type Toast = Omit<ToasterToast, 'id'>;

interface RecognitionHandlersParams {
  setIsListening: React.Dispatch<React.SetStateAction<boolean>>;
  setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>;
  setCurrentTranscript: React.Dispatch<React.SetStateAction<string>>;
  setInterimTranscript: React.Dispatch<React.SetStateAction<string>>;
  setAudioLevel: React.Dispatch<React.SetStateAction<number>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  streamRef: React.MutableRefObject<MediaStream | null>;
  audioContextRef: React.MutableRefObject<AudioContext | null>;
  analyserRef: React.MutableRefObject<AnalyserNode | null>;
  microphoneRef: React.MutableRefObject<MediaStreamAudioSourceNode | null>;
  animationFrameIdRef: React.MutableRefObject<number | null>;
  iosInfo: any; // Replace 'any' with a more specific type if possible
  androidInfo: any; // Replace 'any' with a more specific type if possible
  toast: (toast: Toast) => {
    id: string;
    dismiss: () => void;
    update: (props: any) => void;
  };
  confidenceThreshold: number;
  stopAudioMonitoringFn: () => void;
}

export function createRecognitionHandlers({
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
}: RecognitionHandlersParams) {
  return {
    onstart() {
      logDebug('🎙 Speech recognition started');
      setIsListening(true);
      setIsProcessing(true);
      setupAudioMonitoring(
        true,
        streamRef,
        audioContextRef,
        analyserRef,
        microphoneRef,
        setAudioLevel
      )
        .then(() => {
          startAudioLevelMonitoring(
            analyserRef,
            setAudioLevel,
            animationFrameIdRef
          );
        })
        .catch((error) => {
          logDebug(`Audio monitoring setup error: ${String(error)}`);
        });
    },
    onspeechstart() {
      logDebug('👄 Speech detected');
      setIsProcessing(true);
    },
    onspeechend() {
      logDebug('🤐 Speech ended');
      setIsProcessing(false);
    },
    onaudiostart() {
      logDebug('🔊 Audio capturing started');
    },
    onaudioend() {
      logDebug('🔇 Audio capturing ended');
    },
    onresult(event: any) {
      let finalTranscript = '';
      let interimResult = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0]?.transcript || '';
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
      if (finalTranscript) {
        setCurrentTranscript((prev: string) =>
          (prev ? `${prev} ${finalTranscript}` : finalTranscript).trim()
        );
      }
      if (interimResult) {
        setInterimTranscript(interimResult);
      }
    },
    onerror(event: any) {
      const errorMessage = event.error || 'Unknown error';
      logDebug(`❌ Speech recognition error: ${errorMessage}`, event);
      if (iosInfo.isIOS) {
        handleIOSError(errorMessage, setError, toast);
      } else if (androidInfo.isAndroid) {
        handleAndroidError(errorMessage, setError, toast);
      } else {
        handleGenericError(errorMessage, setError);
      }
      stopAudioMonitoringFn();
      setIsProcessing(false);
    },
    onend() {
      logDebug('🛑 Speech recognition ended');
      setIsListening(false);
      setIsProcessing(false);
      stopAudioMonitoringFn();
    },
  };
}
