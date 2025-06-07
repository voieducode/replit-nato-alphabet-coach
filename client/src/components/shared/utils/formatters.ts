/**
 * Shared formatting utilities for quiz components
 */

/**
 * Format time in seconds to MM:SS format
 */
export function formatTime(seconds: number): string {
  if (seconds < 0) {
    // For negative numbers, we need to handle the conversion differently
    // -1 second should be "-1:59" (meaning 1 minute and 59 seconds ago)
    const positiveSeconds = Math.abs(seconds);
    const mins = Math.floor(positiveSeconds / 60);
    const secs = positiveSeconds % 60;

    if (secs === 0) {
      return `-${mins}:00`;
    } else {
      return `-${mins + 1}:${(60 - secs).toString().padStart(2, '0')}`;
    }
  }

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Format question count with localization support
 */
export function formatQuestionCount(
  current: number,
  total: number,
  template: string
): string {
  return template
    .replace('{current}', String(current))
    .replace('{total}', String(total));
}

/**
 * Format accuracy percentage
 */
export function formatAccuracy(correct: number, total: number): number {
  if (total === 0) 
return 0;
  return Math.round((correct / total) * 100);
}

/**
 * Format progress percentage
 */
export function formatProgress(
  current: number,
  total: number,
  showResult: boolean = false
): number {
  const adjustedCurrent = current + (showResult ? 1 : 0);
  return (adjustedCurrent / total) * 100;
}

/**
 * Format score display
 */
export function formatScore(
  correct: number,
  total: number
): {
  score: string;
  percentage: number;
} {
  const percentage = formatAccuracy(correct, total);
  return {
    score: `${correct} / ${total}`,
    percentage,
  };
}
