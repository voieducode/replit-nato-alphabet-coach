import type { Translations } from '@/lib/i18n';
import type { LetterProgress, ProgressType } from '@/types/progress';
import React, { memo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { LettersDialog } from './letters-dialog';

interface StatsDisplayProps {
  totalSessions: number;
  averageScore: number;
  learningStats: {
    learning: number;
    review: number;
    mastered: number;
  };
  letterProgress: LetterProgress[];
  translations: Translations;
}

export const StatsDisplay = memo(
  ({
    totalSessions,
    averageScore,
    learningStats,
    letterProgress,
    translations,
  }: StatsDisplayProps) => {
    const [dialogState, setDialogState] = useState<{
      type: ProgressType | null;
      isOpen: boolean;
    }>({
      type: null,
      isOpen: false,
    });

    // Group letters by their progress type
    const lettersByType = letterProgress.reduce(
      (acc, { letter, accuracy }) => {
        let type: ProgressType;
        if (accuracy >= 0.8) {
          type = 'mastered';
        } else if (accuracy >= 0.5) {
          type = 'review';
        } else {
          type = 'learning';
        }
        acc[type].push(letter);
        return acc;
      },
      {
        learning: [] as string[],
        review: [] as string[],
        mastered: [] as string[],
      }
    );

    const handlePillClick = (type: ProgressType) => {
      setDialogState({ type, isOpen: true });
    };

    const closeDialog = () => {
      setDialogState({ type: null, isOpen: false });
    };

    return (
      <>
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
              <div className="text-sm text-gray-400">
                {translations.accuracy}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white shadow-material border border-gray-100 col-span-2">
            <CardContent className="p-4">
              <h4 className="font-semibold text-gray-800 mb-3">
                {translations.learningProgress}
              </h4>
              <div className="flex items-center justify-between text-sm">
                <button
                  type="button"
                  onClick={() => handlePillClick('learning')}
                  className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
                >
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span>
                    {translations.learning}:{learningStats.learning}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => handlePillClick('review')}
                  className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
                >
                  <div className="w-3 h-3 bg-info rounded-full"></div>
                  <span>
                    {translations.review}:{learningStats.review}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => handlePillClick('mastered')}
                  className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
                >
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>
                    {translations.mastered}:{learningStats.mastered}
                  </span>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        <LettersDialog
          type={dialogState.type}
          isOpen={dialogState.isOpen}
          onClose={closeDialog}
          letters={dialogState.type ? lettersByType[dialogState.type] : []}
          translations={translations}
        />
      </>
    );
  }
);

// Add displayName for better debugging
StatsDisplay.displayName = 'StatsDisplay';
