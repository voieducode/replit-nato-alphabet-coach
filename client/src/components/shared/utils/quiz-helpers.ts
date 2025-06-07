import type { Translations } from '@/lib/i18n';
import type { ProgressType } from '@/types/progress';

/**
 * Shared quiz utility functions
 */

/**
 * Calculate progress statistics from letter progress data
 */
export function calculateProgressStats(
  letterProgress: Array<{ letter: string; accuracy: number }>
): { learning: number; review: number; mastered: number } {
  return letterProgress.reduce(
    (acc, { accuracy }) => {
      if (accuracy >= 0.8) {
        acc.mastered++;
      } else if (accuracy >= 0.5) {
        acc.review++;
      } else {
        acc.learning++;
      }
      return acc;
    },
    { learning: 0, review: 0, mastered: 0 }
  );
}

/**
 * Group letters by their progress type
 */
export function groupLettersByProgress(
  letterProgress: Array<{ letter: string; accuracy: number }>
): Record<ProgressType, string[]> {
  return letterProgress.reduce(
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
}

/**
 * Get progress type for a given accuracy
 */
export function getProgressType(accuracy: number): ProgressType {
  if (accuracy >= 0.8) {
    return 'mastered';
  }
  if (accuracy >= 0.5) {
    return 'review';
  }
  return 'learning';
}

/**
 * Get progress color class for styling
 */
export function getProgressColorClass(type: ProgressType): string {
  switch (type) {
    case 'mastered':
      return 'bg-green-500';
    case 'review':
      return 'bg-info';
    case 'learning':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
}

/**
 * Get badge class for progress type
 */
export function getProgressBadgeClass(type: ProgressType): string {
  switch (type) {
    case 'mastered':
      return 'bg-green-100 text-info-foreground-green';
    case 'review':
      return 'bg-info text-info-foreground';
    case 'learning':
      return 'bg-red-100 text-info-foreground-red';
    default:
      return 'bg-gray-100 text-gray-600';
  }
}

/**
 * Determine difficulty level based on various criteria
 */
export function calculateDifficulty(
  length: number,
  easyThreshold: number = 5,
  mediumThreshold: number = 8
): 'easy' | 'medium' | 'hard' {
  if (length <= easyThreshold) {
    return 'easy';
  }
  if (length <= mediumThreshold) {
    return 'medium';
  }
  return 'hard';
}

/**
 * Localized question count helper
 */
export function localizedQuestionCount(
  translations: Translations,
  current: number,
  total: number
): string {
  return translations.questionCount
    .replace('{current}', String(current))
    .replace('{total}', String(total));
}

/**
 * Get performance icon based on accuracy
 */
export function getPerformanceIcon(accuracy: number): {
  icon: string;
  color: string;
} {
  if (accuracy >= 80) {
    return { icon: 'Trophy', color: 'text-yellow-500' };
  } else if (accuracy >= 60) {
    return { icon: 'CheckCircle', color: 'text-green-500' };
  } else {
    return { icon: 'Target', color: 'text-blue-500' };
  }
}

/**
 * Validate input for common quiz patterns
 */
export function isValidQuizInput(input: string): boolean {
  return input.trim().length > 0;
}

/**
 * Common quiz state reset helper
 */
export function createQuizStateReset() {
  return {
    userAnswer: '',
    showResult: false,
    isCompleted: false,
    showHint: false,
    hintTimer: 0,
  };
}
