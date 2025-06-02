import { Bell, Globe, Palette, Settings, Volume2 } from 'lucide-react';
import { useState } from 'react';
import { ThemeSelector } from '@/components/theme-selector';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { useLanguage } from '@/hooks/use-language';
import { useSpeechSynthesis } from '@/hooks/use-speech-synthesis';

export default function SettingsSection() {
  const { availableVoices, voiceSettings, setVoiceSettings, speak } =
    useSpeechSynthesis();
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    const stored = localStorage.getItem('notifications-enabled');
    return stored === 'true';
  });
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
    localStorage.setItem('notifications-enabled', enabled.toString());

    if (enabled) {
      if (!('Notification' in window)) {
        console.error('Notifications not supported by browser');
        return;
      }

      let permission = Notification.permission;
      if (permission === 'default') {
        try {
          permission = await Notification.requestPermission();
        } catch (error) {
          console.error('Error requesting notification permission:', error);
          return;
        }
      }

      if (permission === 'granted') {
        console.warn('Notifications enabled and permission granted');
      } else {
        console.warn(
          'Notifications enabled but permission denied - user can still enable manually in browser settings'
        );
      }
    }
  };

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
  };

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'fr', name: 'Français' },
    { code: 'es', name: 'Español' },
    { code: 'de', name: 'Deutsch' },
    { code: 'ar', name: 'العربية' },
    { code: 'sw', name: 'Kiswahili' },
    { code: 'zh', name: '中文' },
  ];

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <Settings className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-semibold text-gray-800">
          {translations.settings}
        </h2>
      </div>

      {/* Voice Settings */}
      <Card className="bg-white shadow-material border border-gray-100">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3 mb-4">
            <Volume2 className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-gray-800">
              {translations.voiceSettings}
            </h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {translations.textToSpeechVoice}
              </label>
              <Select
                value={voiceSettings.voiceName || ''}
                onValueChange={handleVoiceChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a voice" />
                </SelectTrigger>
                <SelectContent>
                  {availableVoices.map((voice) => (
                    <SelectItem key={voice.name} value={voice.name}>
                      {voice.name} ({voice.lang})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="space-y-6 mt-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Speech Rate
                  </label>
                  <Slider
                    min={0.5}
                    max={2}
                    step={0.1}
                    value={[voiceSettings.rate]}
                    onValueChange={([value]) =>
                      handleSettingChange('rate', value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Pitch
                  </label>
                  <Slider
                    min={0.5}
                    max={2}
                    step={0.1}
                    value={[voiceSettings.pitch]}
                    onValueChange={([value]) =>
                      handleSettingChange('pitch', value)
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Volume
                  </label>
                  <Slider
                    min={0}
                    max={1}
                    step={0.1}
                    value={[voiceSettings.volume]}
                    onValueChange={([value]) =>
                      handleSettingChange('volume', value)
                    }
                  />
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                speak('Alpha Bravo Charlie');
              }}
            >
              {translations.testVoice}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="bg-white shadow-material border border-gray-100">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3 mb-4">
            <Bell className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-gray-800">
              {translations.notifications}
            </h3>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800">
                {translations.spacedRepetitionReminders}
              </p>
              <p className="text-sm text-gray-400">
                {translations.dailyReminders}
              </p>
            </div>
            <Switch
              checked={notificationsEnabled}
              onCheckedChange={handleNotificationToggle}
            />
          </div>

          {notificationsEnabled && (
            <div className="mt-3 p-3 rounded-lg border border-green-200">
              <p className="text-sm text-green-800">
                {translations.notificationDescription}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Theme Settings */}
      <Card className="bg-white shadow-material border border-gray-100">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3 mb-4">
            <Palette className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-gray-800">
              {translations.theme || 'Theme'}
            </h3>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800">
                {translations.appearance || 'Appearance'}
              </p>
              <p className="text-sm text-gray-400">
                {translations.chooseTheme || 'Choose your preferred theme'}
              </p>
            </div>
            <ThemeSelector />
          </div>
        </CardContent>
      </Card>

      {/* Language Settings */}
      <Card className="bg-white shadow-material border border-gray-100">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3 mb-4">
            <Globe className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-gray-800">
              {translations.language}
            </h3>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {translations.interfaceLanguage}
              </label>
              <Select value={language} onValueChange={handleLanguageChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <span>{lang.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-wrap gap-2">
              {languages.map((lang) => (
                <Badge
                  key={lang.code}
                  variant={language === lang.code ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => handleLanguageChange(lang.code)}
                >
                  {lang.name}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card className="bg-gray-50 border border-gray-200">
        <CardContent className="p-4">
          <h3 className="font-semibold text-gray-800 mb-2">
            {translations.about}
          </h3>
          <p className="text-sm text-gray-400 mb-3">
            {translations.aboutDescription}
          </p>
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span>{translations.version}</span>
            <span>•</span>
            <span>{translations.builtWith}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
