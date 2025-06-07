import type { Translations } from '@/lib/i18n';
import type { ProgressType } from '@/types/progress';
import React, { memo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  calculateProgressStats,
  getProgressBadgeClass,
  getProgressColorClass,
  groupLettersByProgress,
} from '../utils/quiz-helpers';

export interface ProgressStats {
  learning: number;
  review: number;
  mastered: number;
}

export interface LetterProgress {
  letter: string;
  accuracy: number;
}

export interface ProgressDisplayProps {
  /**
   * Letter progress data
   */
  letterProgress: LetterProgress[];
  /**
   * Translations object
   */
  translations: Translations;
  /**
   * Display mode
   */
  mode?: 'badges' | 'dots' | 'full';
  /**
   * Whether to show click handlers
   */
  interactive?: boolean;
  /**
   * Callback when a progress type is clicked
   */
  onProgressTypeClick?: (type: ProgressType, letters: string[]) => void;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Whether to show as card
   */
  showCard?: boolean;
  /**
   * Card title
   */
  cardTitle?: string;
}

/**
 * Shared progress display component that shows learning progress
 * in various formats (badges, dots, full stats)
 */
export const ProgressDisplay = memo(
  ({
    letterProgress,
    translations,
    mode = 'badges',
    interactive = false,
    onProgressTypeClick,
    className = '',
    showCard = false,
    cardTitle,
  }: ProgressDisplayProps) => {
    const progressStats = calculateProgressStats(letterProgress);
    const groupedLetters = groupLettersByProgress(letterProgress);

    const handleProgressClick = (type: ProgressType) => {
      if (interactive && onProgressTypeClick) {
        onProgressTypeClick(type, groupedLetters[type]);
      }
    };

    const renderProgressBadges = () => (
      <div className="flex items-center space-x-4 text-xs">
        <Badge
          variant="secondary"
          className={`${getProgressBadgeClass('learning')} ${
            interactive
              ? 'hover:opacity-80 cursor-pointer transition-opacity'
              : ''
          }`}
          onClick={
            interactive ? () => handleProgressClick('learning') : undefined
          }
        >
          {translations.learning}&nbsp;({progressStats.learning})
        </Badge>
        <Badge
          variant="secondary"
          className={`${getProgressBadgeClass('review')} ${
            interactive
              ? 'hover:opacity-80 cursor-pointer transition-opacity'
              : ''
          }`}
          onClick={
            interactive ? () => handleProgressClick('review') : undefined
          }
        >
          {translations.review}&nbsp;({progressStats.review})
        </Badge>
        <Badge
          variant="secondary"
          className={`${getProgressBadgeClass('mastered')} ${
            interactive
              ? 'hover:opacity-80 cursor-pointer transition-opacity'
              : ''
          }`}
          onClick={
            interactive ? () => handleProgressClick('mastered') : undefined
          }
        >
          {translations.mastered}&nbsp;({progressStats.mastered})
        </Badge>
      </div>
    );

    const renderProgressDots = () => (
      <div className="flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={() => handleProgressClick('learning')}
          className={`flex items-center space-x-2 ${
            interactive ? 'hover:opacity-80 transition-opacity' : ''
          }`}
          disabled={!interactive}
        >
          <div
            className={`w-3 h-3 ${getProgressColorClass('learning')} rounded-full`}
          />
          <span>
            {translations.learning}:&nbsp;{progressStats.learning}
          </span>
        </button>
        <button
          type="button"
          onClick={() => handleProgressClick('review')}
          className={`flex items-center space-x-2 ${
            interactive ? 'hover:opacity-80 transition-opacity' : ''
          }`}
          disabled={!interactive}
        >
          <div
            className={`w-3 h-3 ${getProgressColorClass('review')} rounded-full`}
          />
          <span>
            {translations.review}:&nbsp;{progressStats.review}
          </span>
        </button>
        <button
          type="button"
          onClick={() => handleProgressClick('mastered')}
          className={`flex items-center space-x-2 ${
            interactive ? 'hover:opacity-80 transition-opacity' : ''
          }`}
          disabled={!interactive}
        >
          <div
            className={`w-3 h-3 ${getProgressColorClass('mastered')} rounded-full`}
          />
          <span>
            {translations.mastered}:&nbsp;{progressStats.mastered}
          </span>
        </button>
      </div>
    );

    const renderFullProgress = () => (
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-800 mb-3">
          {cardTitle || translations.learningProgress}
        </h4>
        {renderProgressDots()}
      </div>
    );

    const renderContent = () => {
      switch (mode) {
        case 'badges':
          return renderProgressBadges();
        case 'dots':
          return renderProgressDots();
        case 'full':
          return renderFullProgress();
        default:
          return renderProgressBadges();
      }
    };

    const content = <div className={className}>{renderContent()}</div>;

    if (showCard) {
      return (
        <Card className="bg-white shadow-material border border-gray-100">
          <CardContent className="p-4">{content}</CardContent>
        </Card>
      );
    }

    return content;
  }
);

// Add displayName for better debugging
ProgressDisplay.displayName = 'ProgressDisplay';

/**
 * Helper component for compact progress display
 */
export const CompactProgressDisplay = memo(
  ({
    letterProgress,
    translations,
    onProgressTypeClick,
  }: {
    letterProgress: LetterProgress[];
    translations: Translations;
    onProgressTypeClick?: (type: ProgressType, letters: string[]) => void;
  }) => (
    <ProgressDisplay
      letterProgress={letterProgress}
      translations={translations}
      mode="badges"
      interactive={!!onProgressTypeClick}
      onProgressTypeClick={onProgressTypeClick}
    />
  )
);

CompactProgressDisplay.displayName = 'CompactProgressDisplay';

/**
 * Helper component for detailed progress display
 */
export const DetailedProgressDisplay = memo(
  ({
    letterProgress,
    translations,
    onProgressTypeClick,
    title,
  }: {
    letterProgress: LetterProgress[];
    translations: Translations;
    onProgressTypeClick?: (type: ProgressType, letters: string[]) => void;
    title?: string;
  }) => (
    <ProgressDisplay
      letterProgress={letterProgress}
      translations={translations}
      mode="full"
      interactive={!!onProgressTypeClick}
      onProgressTypeClick={onProgressTypeClick}
      showCard={true}
      cardTitle={title}
    />
  )
);

DetailedProgressDisplay.displayName = 'DetailedProgressDisplay';
