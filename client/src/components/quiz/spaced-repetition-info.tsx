import type { Translations } from '@/lib/i18n';
import type { LetterProgress, ProgressType } from '@/types/progress';
import { Brain } from 'lucide-react';
import React, { memo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { LettersDialog } from './letters-dialog';

interface SpacedRepetitionInfoProps {
  progressStats: {
    learning: number;
    review: number;
    mastered: number;
  };
  letterProgress: LetterProgress[];
  translations: Translations;
}

export const SpacedRepetitionInfo = memo(
  ({
    progressStats,
    letterProgress,
    translations,
  }: SpacedRepetitionInfoProps) => {
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
        <Card className="bg-info border border-green-100">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <Brain className="text-info-foreground-green mt-1 h-5 w-5" />
              <div>
                <h4 className="font-semibold text-info-foreground mb-1">
                  {translations.adaptiveLearning}
                </h4>
                <p className="text-sm text-info-foreground mb-2">
                  {translations.spacedRepetitionDescription}
                </p>
                <div className="flex items-center space-x-4 text-xs">
                  <Badge
                    variant="secondary"
                    className="bg-red-100 text-info-foreground-red hover:opacity-80 cursor-pointer transition-opacity"
                    onClick={() => handlePillClick('learning')}
                  >
                    {translations.learning}
                    &nbsp;({progressStats.learning})
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-info text-info-foreground hover:opacity-80 cursor-pointer transition-opacity"
                    onClick={() => handlePillClick('review')}
                  >
                    {translations.review}
                    &nbsp;({progressStats.review})
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-info-foreground-green hover:opacity-80 cursor-pointer transition-opacity"
                    onClick={() => handlePillClick('mastered')}
                  >
                    {translations.mastered}
                    &nbsp;({progressStats.mastered})
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

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
SpacedRepetitionInfo.displayName = 'SpacedRepetitionInfo';
