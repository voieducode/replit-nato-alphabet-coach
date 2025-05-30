import { natoAlphabet, getAllLetters, getNATOWord } from "./nato-alphabet";
import type { UserProgress } from "@shared/schema";

export interface QuizQuestion {
  letter: string;
  correctAnswer: string;
}

export interface QuizSet {
  id: string;
  questions: QuizQuestion[];
  startedAt?: Date;
  completedAt?: Date;
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

export function checkAnswerVariants(userAnswer: string, correctAnswer: string): boolean {
  const normalizedUser = userAnswer.toLowerCase().trim();
  const normalizedCorrect = correctAnswer.toLowerCase();
  
  // Direct match
  if (normalizedUser === normalizedCorrect) return true;
  
  // Common alternate spellings
  const alternates: Record<string, string[]> = {
    'whiskey': ['whisky'],
    'juliet': ['juliett'],
    'x-ray': ['xray', 'x ray'],
    'alfa': ['alpha'], // NATO officially uses "Alfa" but "Alpha" is common
  };
  
  // Check if correct answer has alternates and user provided one
  const correctAlternates = alternates[normalizedCorrect] || [];
  if (correctAlternates.includes(normalizedUser)) return true;
  
  // Check reverse - if user typed standard spelling but correct is alternate
  for (const [standard, alts] of Object.entries(alternates)) {
    if (alts.includes(normalizedCorrect) && normalizedUser === standard) {
      return true;
    }
  }
  
  return false;
}

// Hints for NATO alphabet words
export function getHintForLetter(letter: string, natoHints?: Record<string, string>): string {
  // Default English hints for fallback
  const defaultHints: Record<string, string> = {
    'A': 'First letter of Greek alphabet',
    'B': 'Well done, applause!',
    'C': 'Phonetic C, like the name',
    'D': 'River formation triangle',
    'E': 'Sound reflection',
    'F': 'Ballroom dance',
    'G': 'Sport with clubs and holes',
    'H': 'Place to stay overnight',
    'I': 'Large Asian country',
    'J': 'Shakespeare heroine',
    'K': 'Unit of weight (1000 grams)',
    'L': 'Capital of Peru',
    'M': 'Short for microphone',
    'N': 'Autumn month',
    'O': 'Academy Award',
    'P': 'Father, informal',
    'Q': 'Canadian province',
    'R': 'Shakespeare character',
    'S': 'Mountain range',
    'T': 'Argentine dance',
    'U': 'Same clothing for all',
    'V': 'Winner, champion',
    'W': 'Strong alcoholic drink',
    'X': 'Medical imaging',
    'Y': 'American baseball player',
    'Z': 'African warrior nation'
  };
  
  const hints = natoHints || defaultHints;
  return hints[letter.toUpperCase()] || '';
}

export function generateQuizQuestion(userProgress: UserProgress[]): QuizQuestion {
  const letter = selectLetterForReview(userProgress);
  const correctAnswer = getNATOWord(letter)!;
  
  return {
    letter,
    correctAnswer,
  };
}

export function generateQuizSet(userProgress: UserProgress[], setSize: number = 10): QuizSet {
  const questions: QuizQuestion[] = [];
  const usedLetters = new Set<string>();
  
  for (let i = 0; i < setSize; i++) {
    // Get letters prioritizing those that need review
    let letter = selectLetterForReview(userProgress);
    
    // If we've already used this letter in this set, try to get a different one
    let attempts = 0;
    while (usedLetters.has(letter) && attempts < 26) {
      const allLetters = getAllLetters();
      letter = allLetters[Math.floor(Math.random() * allLetters.length)];
      attempts++;
    }
    
    usedLetters.add(letter);
    const correctAnswer = getNATOWord(letter)!;
    
    questions.push({
      letter,
      correctAnswer,
    });
  }
  
  return {
    id: `set-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    questions,
    startedAt: new Date(),
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
