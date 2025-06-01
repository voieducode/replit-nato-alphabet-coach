import type { Translations } from '@/lib/i18n';
import React, { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface StudyStatsFooterProps {
  totalSessions: number;
  averageScore: number;
  translations: Translations;
}

export const StudyStatsFooter = memo(
  ({ totalSessions, averageScore, translations }: StudyStatsFooterProps) => {
    return (
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-white shadow-material border border-gray-100">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary mb-1">
              {totalSessions}
            </div>
            <div className="text-sm text-gray-600">
              {translations.totalSessions}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-material border border-gray-100">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {averageScore}%
            </div>
            <div className="text-sm text-gray-600">{translations.accuracy}</div>
          </CardContent>
        </Card>
      </div>
    );
  }
);

// Add displayName for better debugging
StudyStatsFooter.displayName = 'StudyStatsFooter';
