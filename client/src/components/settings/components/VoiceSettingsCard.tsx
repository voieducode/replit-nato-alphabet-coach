import type { VoiceSettingsProps } from '../types';
import { Volume2 } from 'lucide-react';
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
import { DEFAULT_CARD_STYLES, SECTION_ICON_STYLES } from '../constants';

export function VoiceSettingsCard({
  voiceSettings,
  availableVoices,
  onVoiceChange,
  onSettingChange,
  onTestVoice,
  translations,
}: VoiceSettingsProps) {
  return (
    <Card className={DEFAULT_CARD_STYLES}>
      <CardContent className="p-4">
        <div className="flex items-center space-x-3 mb-4">
          <Volume2 className={SECTION_ICON_STYLES} />
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
              onValueChange={onVoiceChange}
            >
              <SelectTrigger>
                <SelectValue placeholder={translations.placeholder} />
              </SelectTrigger>
              <SelectContent className="bg-background border-border">
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
                  {translations.speechRate}
                </label>
                <Slider
                  min={0.5}
                  max={2}
                  step={0.1}
                  value={[voiceSettings.rate]}
                  onValueChange={([value]) => onSettingChange('rate', value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {translations.pitch}
                </label>
                <Slider
                  min={0.5}
                  max={2}
                  step={0.1}
                  value={[voiceSettings.pitch]}
                  onValueChange={([value]) => onSettingChange('pitch', value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {translations.volume}
                </label>
                <Slider
                  min={0}
                  max={1}
                  step={0.1}
                  value={[voiceSettings.volume]}
                  onValueChange={([value]) => onSettingChange('volume', value)}
                />
              </div>
            </div>
          </div>

          <Button variant="outline" size="sm" onClick={onTestVoice}>
            {translations.testVoice}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
