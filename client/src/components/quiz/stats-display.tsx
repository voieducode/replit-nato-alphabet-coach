import type { Translations } from '@/lib/i18n';
import React, { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface StatsDisplayProps {
  totalSessions: number;
  averageScore: number;
  learningStats: {
    learning: number;
    review: number;
    mastered: number;
  };
  translations: Translations;
}

export const StatsDisplay = memo(
  ({
    totalSessions,
    averageScore,
    learningStats,
    translations,
  }: StatsDisplayProps) => {
    return (
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-white shadow-material border border-gray-100">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary mb-1">
              {totalSessions}
            </div>
            <div className="text-sm text-gray-400">
              {translations.totalSessions}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-material border border-gray-100">
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {averageScore}%
            </div>
            <div className="text-sm text-gray-400">{translations.accuracy}</div>
          </CardContent>
        </Card>
        <Card className="bg-white shadow-material border border-gray-100 col-span-2">
          <CardContent className="p-4">
            <h4 className="font-semibold text-gray-800 mb-3">
              {translations.learningProgress}
            </h4>
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>
                  {translations.learning}:{learningStats.learning}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>
                  {translations.review}:{learningStats.review}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>
                  {translations.mastered}:{learningStats.mastered}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
);

// Add displayName for better debugging
StatsDisplay.displayName = 'StatsDisplay';
