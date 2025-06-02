import type { UserProgress } from '@shared/schema';

export function quizStats(
  userProgress: UserProgress[],
  localStats: any,
  sessionResults: any[]
) {
  // Calculate stats
  const totalSessions = localStats.totalSessions;
  const averageScore =
    localStats.totalAnswers > 0
      ? Math.round((localStats.correctAnswers / localStats.totalAnswers) * 100)
      : 0;

  // Calculate letter progress and stats
  const letterProgress = userProgress.map((progress) => {
    const total = progress.correctCount + progress.incorrectCount;
    const accuracy = total > 0 ? progress.correctCount / total : 0;
    return {
      letter: progress.letter,
      accuracy,
    };
  });

  const progressStats = letterProgress.reduce(
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

  const correctAnswersCount = sessionResults.filter((r) => r.isCorrect).length;

  return {
    totalSessions,
    averageScore,
    letterProgress,
    progressStats,
    correctAnswersCount,
  };
}
