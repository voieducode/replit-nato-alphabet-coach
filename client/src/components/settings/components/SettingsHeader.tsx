import type { SettingsHeaderProps } from '../types';
import { Settings } from 'lucide-react';
import { HEADER_ICON_STYLES } from '../constants';

export function SettingsHeader({ translations }: SettingsHeaderProps) {
  return (
    <div className="flex items-center space-x-3 mb-6">
      <Settings className={HEADER_ICON_STYLES} />
      <h2 className="text-xl font-semibold text-gray-800">
        {translations.settings}
      </h2>
    </div>
  );
}
