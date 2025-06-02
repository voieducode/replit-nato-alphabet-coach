import { useState } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { useSpeechSynthesis } from '@/hooks/use-speech-synthesis';
import {
  AboutCard,
  LanguageSettingsCard,
  NotificationSettingsCard,
  SettingsHeader,
  ThemeSettingsCard,
  VoiceSettingsCard,
} from './settings/components';
import {
  getNotificationPreference,
  requestNotificationPermission,
  setNotificationPreference,
} from './settings/utils';

export default function SettingsSection() {
  const { availableVoices, voiceSettings, setVoiceSettings, speak } =
    useSpeechSynthesis();
  const [notificationsEnabled, setNotificationsEnabled] = useState(() =>
    getNotificationPreference()
  );
  const { language, translations, setLanguage } = useLanguage();

  const handleVoiceChange = (name: string) => {
    setVoiceSettings((prev) => ({ ...prev, voiceName: name }));
  };

  const handleSettingChange = (
    setting: 'rate' | 'pitch' | 'volume',
    value: number
  ) => {
    setVoiceSettings((prev) => ({ ...prev, [setting]: value }));
  };

  const handleNotificationToggle = async (enabled: boolean) => {
    setNotificationsEnabled(enabled);
    setNotificationPreference(enabled);

    if (enabled) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        setNotificationsEnabled(false);
        setNotificationPreference(false);
      }
    }
  };

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
  };

  const handleTestVoice = () => {
    speak('Alpha Bravo Charlie');
  };

  return (
    <div className="p-4 space-y-6">
      <SettingsHeader translations={translations} />

      <VoiceSettingsCard
        voiceSettings={voiceSettings}
        availableVoices={availableVoices}
        onVoiceChange={handleVoiceChange}
        onSettingChange={handleSettingChange}
        onTestVoice={handleTestVoice}
        translations={translations}
      />

      <NotificationSettingsCard
        enabled={notificationsEnabled}
        onToggle={handleNotificationToggle}
        translations={translations}
      />

      <ThemeSettingsCard translations={translations} />

      <LanguageSettingsCard
        currentLanguage={language}
        onLanguageChange={handleLanguageChange}
        translations={translations}
      />

      <AboutCard translations={translations} />
    </div>
  );
}
