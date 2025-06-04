import type { ConvertedLetter } from './nato-alphabet';
import { convertToNATO } from './nato-alphabet';
import { checkAnswerVariants } from './spaced-repetition';

export interface WordMatchResult {
  score: number;
  percentage: number;
  correctCount: number;
  totalCount: number;
  matches: LetterMatch[];
}

export interface LetterMatch {
  position: number;
  originalLetter: string;
  expectedNato: string;
  userNato: string;
  isCorrect: boolean;
  isSpace: boolean;
}

/**
 * Converts a word to its expected NATO alphabet representation
 */
export function wordToNATO(word: string): ConvertedLetter[] {
  return convertToNATO(word);
}

/**
 * Parses user input into NATO words array
 */
export function parseUserInput(input: string): string[] {
  if (!input.trim()) {
    return [];
  }

  // Split by common separators and clean up
  return input
    .trim()
    .split(/[\s,.-]+/)
    .map((word) => word.trim().toLowerCase())
    .filter((word) => word.length > 0);
}

/**
 * Matches user NATO input against expected NATO words for a given word
 */
export function matchWordToNATO(
  word: string,
  userInput: string
): WordMatchResult {
  const expectedNATO = wordToNATO(word);
  const userNATO = parseUserInput(userInput);

  const matches: LetterMatch[] = [];
  let correctCount = 0;

  // Process each letter in the original word
  for (let i = 0; i < expectedNATO.length; i++) {
    const expected = expectedNATO[i];
    const userWord = userNATO[i] || '';

    const isSpace = expected.char === ' ';
    let isCorrect = false;

    if (isSpace) {
      // For spaces, check if user provided "space" or similar
      isCorrect =
        userWord.toLowerCase() === 'space' ||
        userWord.toLowerCase() === 'spazio' ||
        userWord.toLowerCase() === 'espacio' ||
        userWord === ''; // Allow empty for spaces
    } else {
      // For letters, use the existing variant checking
      isCorrect = checkAnswerVariants(userWord, expected.nato);
    }

    if (isCorrect) {
      correctCount++;
    }

    matches.push({
      position: i,
      originalLetter: expected.char,
      expectedNato: expected.nato,
      userNato: userWord,
      isCorrect,
      isSpace,
    });
  }

  const totalCount = expectedNATO.length;
  const percentage =
    totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

  return {
    score: correctCount,
    percentage,
    correctCount,
    totalCount,
    matches,
  };
}

/**
 * Validates if user input has the correct number of NATO words
 */
export function validateInputLength(
  word: string,
  userInput: string
): {
  isValid: boolean;
  expectedCount: number;
  actualCount: number;
  message?: string;
} {
  const expectedNATO = wordToNATO(word);
  const userNATO = parseUserInput(userInput);

  const expectedCount = expectedNATO.length;
  const actualCount = userNATO.length;

  if (actualCount === expectedCount) {
    return { isValid: true, expectedCount, actualCount };
  }

  let message: string;
  if (actualCount < expectedCount) {
    message = `Missing ${expectedCount - actualCount} NATO word(s). Expected ${expectedCount}, got ${actualCount}.`;
  } else {
    message = `Too many NATO words. Expected ${expectedCount}, got ${actualCount}.`;
  }

  return {
    isValid: false,
    expectedCount,
    actualCount,
    message,
  };
}

/**
 * Gets a hint for the next incorrect letter
 */
export function getNextHint(matches: LetterMatch[]): string | null {
  const firstIncorrect = matches.find((match) => !match.isCorrect);

  if (!firstIncorrect) {
    return null; // All correct
  }

  if (firstIncorrect.isSpace) {
    return 'Next letter is a SPACE - say "Space" or leave empty';
  }

  // Use the hint system from spaced repetition if available
  return `Next letter is "${firstIncorrect.originalLetter}" - NATO word: "${firstIncorrect.expectedNato}"`;
}

/**
 * Formats the expected NATO sequence for display
 */
export function formatExpectedNATO(word: string): string {
  const natoLetters = wordToNATO(word);
  return natoLetters.map((letter) => letter.nato).join(' ');
}

/**
 * Formats user input for display with highlighting
 */
export function formatUserInputWithFeedback(matches: LetterMatch[]): Array<{
  text: string;
  isCorrect: boolean;
  isSpace: boolean;
}> {
  return matches.map((match) => ({
    text: match.userNato || '(missing)',
    isCorrect: match.isCorrect,
    isSpace: match.isSpace,
  }));
}

/**
 * Real-time matching as user types
 */
export function getRealTimeMatch(
  word: string,
  partialInput: string
): {
  matches: LetterMatch[];
  currentPosition: number;
  nextExpected?: string;
} {
  const expectedNATO = wordToNATO(word);
  const userWords = parseUserInput(partialInput);

  const matches: LetterMatch[] = [];

  for (let i = 0; i < expectedNATO.length; i++) {
    const expected = expectedNATO[i];
    const userWord = userWords[i] || '';

    const isSpace = expected.char === ' ';
    let isCorrect = false;

    if (userWord) {
      if (isSpace) {
        isCorrect = userWord.toLowerCase() === 'space' || userWord === '';
      } else {
        isCorrect = checkAnswerVariants(userWord, expected.nato);
      }
    }

    matches.push({
      position: i,
      originalLetter: expected.char,
      expectedNato: expected.nato,
      userNato: userWord,
      isCorrect: userWord ? isCorrect : false,
      isSpace,
    });
  }

  const currentPosition = userWords.length;
  const nextExpected = expectedNATO[currentPosition]?.nato;

  return {
    matches,
    currentPosition,
    nextExpected,
  };
}
