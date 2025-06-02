import type { ThemeSettingsProps } from '../types';
import { Palette } from 'lucide-react';
import { ThemeSelector } from '@/components/theme-selector';
import { Card, CardContent } from '@/components/ui/card';
import { DEFAULT_CARD_STYLES, SECTION_ICON_STYLES } from '../constants';

export function ThemeSettingsCard({ translations }: ThemeSettingsProps) {
  return (
    <Card className={DEFAULT_CARD_STYLES}>
      <CardContent className="p-4">
        <div className="flex items-center space-x-3 mb-4">
          <Palette className={SECTION_ICON_STYLES} />
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
  );
}
