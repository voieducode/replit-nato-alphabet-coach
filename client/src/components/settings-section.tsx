import { useState } from "react";
import { Settings, Volume2, Bell, Globe } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/contexts/LanguageContext";

export default function SettingsSection() {
  const [ttsVoice, setTtsVoice] = useState(localStorage.getItem('tts-voice') || 'female');
  const [notificationsEnabled, setNotificationsEnabled] = useState(localStorage.getItem('notifications-enabled') === 'true');
  const { language, translations, setLanguage } = useLanguage();

  const handleVoiceChange = (value: string) => {
    setTtsVoice(value);
    localStorage.setItem('tts-voice', value);
  };

  const handleNotificationToggle = (enabled: boolean) => {
    if (enabled && 'Notification' in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          setNotificationsEnabled(true);
          localStorage.setItem('notifications-enabled', 'true');
        } else {
          setNotificationsEnabled(false);
          localStorage.setItem('notifications-enabled', 'false');
        }
      });
    } else {
      setNotificationsEnabled(enabled);
      localStorage.setItem('notifications-enabled', enabled.toString());
    }
  };

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
  };

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦' },
    { code: 'sw', name: 'Kiswahili', flag: '🇰🇪' },
    { code: 'zh', name: '中文', flag: '🇨🇳' },
  ];

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <Settings className="h-6 w-6 text-primary" />
        <h2 className="text-xl font-semibold text-gray-800">{translations.settings}</h2>
      </div>

      {/* Voice Settings */}
      <Card className="bg-white shadow-material border border-gray-100">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3 mb-4">
            <Volume2 className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-gray-800">{translations.voiceSettings}</h3>
          </div>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {translations.textToSpeechVoice}
              </label>
              <Select value={ttsVoice} onValueChange={handleVoiceChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="female">{translations.femaleVoice}</SelectItem>
                  <SelectItem value="male">{translations.maleVoice}</SelectItem>
                  <SelectItem value="robot">{translations.robotVoice}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                const utterance = new SpeechSynthesisUtterance("Alpha Bravo Charlie");
                utterance.rate = 0.8;
                
                if (ttsVoice === 'robot') {
                  utterance.pitch = 0.3;
                  utterance.rate = 0.6;
                }
                
                speechSynthesis.speak(utterance);
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
            <h3 className="font-semibold text-gray-800">{translations.notifications}</h3>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800">{translations.spacedRepetitionReminders}</p>
              <p className="text-sm text-gray-600">{translations.dailyReminders}</p>
            </div>
            <Switch 
              checked={notificationsEnabled}
              onCheckedChange={handleNotificationToggle}
            />
          </div>
          
          {notificationsEnabled && (
            <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-800">
                {translations.notificationDescription}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Language Settings */}
      <Card className="bg-white shadow-material border border-gray-100">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3 mb-4">
            <Globe className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-gray-800">{translations.language}</h3>
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
                      <div className="flex items-center space-x-2">
                        <span>{lang.flag}</span>
                        <span>{lang.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {languages.map((lang) => (
                <Badge 
                  key={lang.code}
                  variant={language === lang.code ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleLanguageChange(lang.code)}
                >
                  {lang.flag} {lang.name}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* About */}
      <Card className="bg-gray-50 border border-gray-200">
        <CardContent className="p-4">
          <h3 className="font-semibold text-gray-800 mb-2">{translations.about} {translations.appName}</h3>
          <p className="text-sm text-gray-600 mb-3">
            {translations.aboutDescription}
          </p>
          <div className="flex items-center space-x-4 text-xs text-gray-500">
            <span>{translations.version} 1.0.0</span>
            <span>•</span>
            <span>{translations.builtWith}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}