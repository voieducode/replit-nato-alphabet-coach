import type { NotificationSettingsProps } from '../types';
import { Bell } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { DEFAULT_CARD_STYLES, SECTION_ICON_STYLES } from '../constants';

export function NotificationSettingsCard({
  enabled,
  onToggle,
  translations,
}: NotificationSettingsProps) {
  return (
    <Card className={DEFAULT_CARD_STYLES}>
      <CardContent className="p-4">
        <div className="flex items-center space-x-3 mb-4">
          <Bell className={SECTION_ICON_STYLES} />
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
          <Switch checked={enabled} onCheckedChange={onToggle} />
        </div>

        {enabled && (
          <div className="mt-3 p-3 rounded-lg border border-green-200">
            <p className="text-sm text-green-800">
              {translations.notificationDescription}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
