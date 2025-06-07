// Types for speech recognition functionality

export interface SpeechRecognitionConfig {
  /**
   * Whether recognition should continue after the user stops speaking
   * @default true
   */
  continuous?: boolean;

  /**
   * Whether to return interim results while the user is still speaking
   * @default true
   */
  interimResults?: boolean;

  /**
   * Maximum number of alternative transcriptions to provide
   * @default 3
   */
  maxAlternatives?: number;

  /**
   * Language for speech recognition (BCP 47 language tag)
   * @default auto-detected from document
   */
  language?: string;

  /**
   * Minimum confidence level (0-1) to accept a transcription
   * Chrome on macOS uses a different default
   */
  confidenceThreshold?: number;

  /**
   * Whether to automatically restart recognition if it stops
   * @default true
   */
  autoRestart?: boolean;

  /**
   * Enable debug logging
   * @default false
   */
  debugMode?: boolean;
}

export interface SpeechRecognitionHookResult {
  /**
   * Whether speech recognition is currently listening
   */
  isListening: boolean;

  /**
   * Whether speech is currently being processed
   */
  isProcessing: boolean;

  /**
   * Whether speech recognition is supported in the current browser
   */
  speechSupported: boolean;

  /**
   * The current transcript (final result)
   */
  currentTranscript: string;

  /**
   * The interim transcript (while user is speaking)
   */
  interimTranscript: string;

  /**
   * Current audio input level (0-100)
   */
  audioLevel: number;

  /**
   * Any error that occurred during speech recognition
   */
  error: string | null;

  /**
   * Start listening for speech
   */
  startListening: () => void;

  /**
   * Stop listening for speech
   */
  stopListening: () => void;

  /**
   * Test if the microphone is accessible
   */
  testMicrophone: () => Promise<boolean>;

  /**
   * Clear any error messages
   */
  clearError: () => void;
}

export interface SpeechRecognitionInstance extends EventTarget {
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

/**
 * Information about media devices in the system
 */
export interface MediaDevicesInfo {
  audioInputDevices: number;
  videoInputDevices: number;
  audioOutputDevices: number;
  permissions: {
    microphone?: PermissionState;
    camera?: PermissionState;
  };
}

/**
 * Platform compatibility information for speech features
 */
export interface PlatformCompatibility {
  supported: boolean;
  reason?: string;
  platformInfo: {
    isAndroid: boolean;
    isIOS: boolean;
    isMacOS: boolean;
    isWindows: boolean;
    isLinux: boolean;
    browser: string;
    version?: string;
    isWebView: boolean;
  };
}
