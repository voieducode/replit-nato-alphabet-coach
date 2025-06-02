import type { VoiceSettings } from '@/hooks/use-speech-synthesis';
import type { Translations } from '@/lib/i18n';

export interface VoiceSettingsProps {
  voiceSettings: VoiceSettings;
  availableVoices: SpeechSynthesisVoice[];
  onVoiceChange: (name: string) => void;
  onSettingChange: (
    setting: 'rate' | 'pitch' | 'volume',
    value: number
  ) => void;
  onTestVoice: () => void;
  translations: Translations;
}

export interface NotificationSettingsProps {
  enabled: boolean;
  onToggle: (enabled: boolean) => Promise<void>;
  translations: Translations;
}

export interface ThemeSettingsProps {
  translations: Translations;
}

export interface LanguageSettingsProps {
  currentLanguage: string;
  onLanguageChange: (value: string) => void;
  translations: Translations;
}

export interface AboutCardProps {
  translations: Translations;
}

export interface SettingsHeaderProps {
  translations: Translations;
}
