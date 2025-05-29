import { natoAlphabet, getAllLetters, getNATOWord } from "./nato-alphabet";
import type { UserProgress } from "@shared/schema";

export interface QuizQuestion {
  letter: string;
  correctAnswer: string;
  options: string[];
}

export function calculateNextReviewDate(difficulty: number, isCorrect: boolean): Date {
  let intervalDays: number;
  
  if (isCorrect) {
    // Successful recall - increase interval
    intervalDays = Math.pow(2, Math.max(0, 4 - difficulty));
  } else {
    // Failed recall - shorter interval
    intervalDays = Math.max(1, Math.pow(2, Math.max(0, 2 - difficulty)));
  }
  
  return new Date(Date.now() + intervalDays * 24 * 60 * 60 * 1000);
}

export function updateDifficulty(currentDifficulty: number, isCorrect: boolean): number {
  if (isCorrect) {
    return Math.max(1, currentDifficulty - 0.1);
  } else {
    return Math.min(5, currentDifficulty + 0.3);
  }
}

export function selectLetterForReview(userProgress: UserProgress[]): string {
  const now = new Date();
  
  // Get letters that need review (past their next review date)
  const needReview = userProgress.filter(progress => 
    new Date(progress.nextReview) <= now
  );
  
  if (needReview.length > 0) {
    // Sort by priority: higher difficulty and older review dates first
    needReview.sort((a, b) => {
      const difficultyDiff = b.difficulty - a.difficulty;
      if (Math.abs(difficultyDiff) > 0.5) return difficultyDiff;
      
      return new Date(a.lastReviewed).getTime() - new Date(b.lastReviewed).getTime();
    });
    
    return needReview[0].letter;
  }
  
  // If no letters need review, select from letters with poor performance
  const poorPerformance = userProgress.filter(progress => {
    const total = progress.correctCount + progress.incorrectCount;
    if (total === 0) return false;
    return (progress.correctCount / total) < 0.7;
  });
  
  if (poorPerformance.length > 0) {
    poorPerformance.sort((a, b) => {
      const aAccuracy = a.correctCount / (a.correctCount + a.incorrectCount);
      const bAccuracy = b.correctCount / (b.correctCount + b.incorrectCount);
      return aAccuracy - bAccuracy;
    });
    return poorPerformance[0].letter;
  }
  
  // If all letters are performing well, select from letters with least practice
  const allLetters = getAllLetters();
  const practicedLetters = new Set(userProgress.map(p => p.letter));
  const unpracticedLetters = allLetters.filter(letter => !practicedLetters.has(letter));
  
  if (unpracticedLetters.length > 0) {
    return unpracticedLetters[Math.floor(Math.random() * unpracticedLetters.length)];
  }
  
  // Fallback: select the letter with the least total attempts
  userProgress.sort((a, b) => {
    const aTotal = a.correctCount + a.incorrectCount;
    const bTotal = b.correctCount + b.incorrectCount;
    return aTotal - bTotal;
  });
  
  return userProgress[0]?.letter || getAllLetters()[0];
}

export function generateWrongAnswers(correctAnswer: string, count: number = 3): string[] {
  const allWords = Object.values(natoAlphabet);
  const wrongAnswers = allWords.filter(word => word !== correctAnswer);
  
  // Shuffle and take the required count
  for (let i = wrongAnswers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [wrongAnswers[i], wrongAnswers[j]] = [wrongAnswers[j], wrongAnswers[i]];
  }
  
  return wrongAnswers.slice(0, count);
}

export function generateQuizQuestion(userProgress: UserProgress[]): QuizQuestion {
  const letter = selectLetterForReview(userProgress);
  const correctAnswer = getNATOWord(letter)!;
  const wrongAnswers = generateWrongAnswers(correctAnswer, 3);
  
  // Combine and shuffle options
  const options = [correctAnswer, ...wrongAnswers];
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  
  return {
    letter,
    correctAnswer,
    options,
  };
}

export function getProgressStats(userProgress: UserProgress[]) {
  return userProgress.reduce((stats, progress) => {
    const total = progress.correctCount + progress.incorrectCount;
    if (total === 0) {
      stats.unpracticed++;
      return stats;
    }
    
    const accuracy = progress.correctCount / total;
    if (accuracy >= 0.8 && total >= 3) {
      stats.mastered++;
    } else if (accuracy >= 0.5) {
      stats.review++;
    } else {
      stats.learning++;
    }
    
    return stats;
  }, {
    learning: 0,
    review: 0,
    mastered: 0,
    unpracticed: 0,
  });
}
