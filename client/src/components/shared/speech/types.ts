export interface SpeechTranslations {
  startVoiceInput: string;
  stopVoiceInput: string;
  natoInputListening?: string;
}

export interface AudioLevelDisplayProps {
  audioLevel: number;
  isListening: boolean;
  className?: string;
}

export interface SpeechInputButtonProps {
  isListening: boolean;
  isProcessing: boolean;
  speechSupported: boolean;
  audioLevel: number;
  onToggle: () => void;
  disabled?: boolean;
  translations: SpeechTranslations;
  className?: string;
}

export interface SpeechStatusDisplayProps {
  isListening: boolean;
  isProcessing: boolean;
  error: string | null;
  interimTranscript: string;
  onClearError: () => void;
  translations: SpeechTranslations;
  showInterimText?: boolean;
  className?: string;
}
