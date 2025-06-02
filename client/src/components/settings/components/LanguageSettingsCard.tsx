import type { LanguageSettingsProps } from '../types';
import { Globe } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DEFAULT_CARD_STYLES,
  SECTION_ICON_STYLES,
  SUPPORTED_LANGUAGES,
} from '../constants';

export function LanguageSettingsCard({
  currentLanguage,
  onLanguageChange,
  translations,
}: LanguageSettingsProps) {
  return (
    <Card className={DEFAULT_CARD_STYLES}>
      <CardContent className="p-4">
        <div className="flex items-center space-x-3 mb-4">
          <Globe className={SECTION_ICON_STYLES} />
          <h3 className="font-semibold text-gray-800">
            {translations.language}
          </h3>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {translations.interfaceLanguage}
            </label>
            <Select value={currentLanguage} onValueChange={onLanguageChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    <span>{lang.name}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-wrap gap-2">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <Badge
                key={lang.code}
                variant={currentLanguage === lang.code ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => onLanguageChange(lang.code)}
              >
                {lang.name}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
