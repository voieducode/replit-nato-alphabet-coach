import type { Translations } from '@/lib/i18n';
import { Brain } from 'lucide-react';
import React, { memo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface SpacedRepetitionInfoProps {
  progressStats: {
    learning: number;
    review: number;
    mastered: number;
  };
  translations: Translations;
}

export const SpacedRepetitionInfo = memo(
  ({ progressStats, translations }: SpacedRepetitionInfoProps) => {
    return (
      <Card className="bg-green-50 border border-green-100">
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <Brain className="text-green-600 mt-1 h-5 w-5" />
            <div>
              <h4 className="font-semibold text-green-800 mb-1">
                {translations.adaptiveLearning}
              </h4>
              <p className="text-sm text-green-700 mb-2">
                {translations.spacedRepetitionDescription}
              </p>
              <div className="flex items-center space-x-4 text-xs">
                <Badge variant="secondary" className="bg-red-100 text-red-700">
                  {translations.learning}
                  &nbsp;({progressStats.learning})
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-yellow-100 text-yellow-700"
                >
                  {translations.review}
                  &nbsp;({progressStats.review})
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-700"
                >
                  {translations.mastered}
                  &nbsp;({progressStats.mastered})
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
);

// Add displayName for better debugging
SpacedRepetitionInfo.displayName = 'SpacedRepetitionInfo';
