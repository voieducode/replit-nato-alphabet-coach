import type { UserProgress } from '@shared/schema';
import { useState } from 'react';
import { getUserProgressLocal, updateUserProgressLocal } from '@/lib/storage';

export function useUserProgress(userId: string) {
  const [userProgress, setUserProgress] = useState<UserProgress[]>(() => {
    const localProgress = getUserProgressLocal();
    return localProgress.map((p, index) => ({
      id: index + 1,
      userId,
      letter: p.letter,
      correctCount: p.correctCount,
      incorrectCount: p.incorrectCount,
      lastReviewed: new Date(p.lastReview),
      nextReview: new Date(p.nextReview),
      difficulty: p.difficulty,
    }));
  });

  const updateProgress = (letter: string, isCorrect: boolean) => {
    const localProgress = updateUserProgressLocal(letter, isCorrect);
    setUserProgress((prev) => {
      const existing = prev.find((p) => p.letter === letter);
      if (existing) {
        return prev.map((p) =>
          p.letter === letter
            ? {
                ...p,
                correctCount: localProgress.correctCount,
                incorrectCount: localProgress.incorrectCount,
                lastReviewed: new Date(localProgress.lastReview),
                nextReview: new Date(localProgress.nextReview),
                difficulty: localProgress.difficulty,
              }
            : p
        );
      } else {
        return [
          ...prev,
          {
            id: prev.length + 1,
            userId,
            letter: localProgress.letter,
            correctCount: localProgress.correctCount,
            incorrectCount: localProgress.incorrectCount,
            lastReviewed: new Date(localProgress.lastReview),
            nextReview: new Date(localProgress.nextReview),
            difficulty: localProgress.difficulty,
          },
        ];
      }
    });
  };

  return { userProgress, updateProgress };
}
