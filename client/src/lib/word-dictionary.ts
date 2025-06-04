export interface WordEntry {
  word: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category?: string;
}

// Dictionary of words for the word quiz
export const wordDictionary: WordEntry[] = [
  // Easy words (3-5 letters)
  { word: 'CAT', difficulty: 'easy', category: 'animals' },
  { word: 'DOG', difficulty: 'easy', category: 'animals' },
  { word: 'BAT', difficulty: 'easy', category: 'animals' },
  { word: 'COW', difficulty: 'easy', category: 'animals' },
  { word: 'PIG', difficulty: 'easy', category: 'animals' },
  { word: 'FOX', difficulty: 'easy', category: 'animals' },
  { word: 'BEE', difficulty: 'easy', category: 'animals' },
  { word: 'OWL', difficulty: 'easy', category: 'animals' },

  { word: 'CAR', difficulty: 'easy', category: 'transport' },
  { word: 'BUS', difficulty: 'easy', category: 'transport' },
  { word: 'JET', difficulty: 'easy', category: 'transport' },
  { word: 'BOAT', difficulty: 'easy', category: 'transport' },
  { word: 'BIKE', difficulty: 'easy', category: 'transport' },
  { word: 'TAXI', difficulty: 'easy', category: 'transport' },

  { word: 'SUN', difficulty: 'easy', category: 'nature' },
  { word: 'SKY', difficulty: 'easy', category: 'nature' },
  { word: 'SEA', difficulty: 'easy', category: 'nature' },
  { word: 'TREE', difficulty: 'easy', category: 'nature' },
  { word: 'FIRE', difficulty: 'easy', category: 'nature' },
  { word: 'WIND', difficulty: 'easy', category: 'nature' },
  { word: 'ROCK', difficulty: 'easy', category: 'nature' },
  { word: 'LAKE', difficulty: 'easy', category: 'nature' },

  { word: 'HOME', difficulty: 'easy', category: 'places' },
  { word: 'PARK', difficulty: 'easy', category: 'places' },
  { word: 'SHOP', difficulty: 'easy', category: 'places' },
  { word: 'FARM', difficulty: 'easy', category: 'places' },
  { word: 'BANK', difficulty: 'easy', category: 'places' },
  { word: 'CAFE', difficulty: 'easy', category: 'places' },

  { word: 'BOOK', difficulty: 'easy', category: 'objects' },
  { word: 'DESK', difficulty: 'easy', category: 'objects' },
  { word: 'DOOR', difficulty: 'easy', category: 'objects' },
  { word: 'LAMP', difficulty: 'easy', category: 'objects' },
  { word: 'CLOCK', difficulty: 'easy', category: 'objects' },
  { word: 'PHONE', difficulty: 'easy', category: 'objects' },

  // Medium words (6-8 letters)
  { word: 'FLOWER', difficulty: 'medium', category: 'nature' },
  { word: 'GARDEN', difficulty: 'medium', category: 'nature' },
  { word: 'MOUNTAIN', difficulty: 'medium', category: 'nature' },
  { word: 'FOREST', difficulty: 'medium', category: 'nature' },
  { word: 'RIVER', difficulty: 'medium', category: 'nature' },
  { word: 'OCEAN', difficulty: 'medium', category: 'nature' },
  { word: 'PLANET', difficulty: 'medium', category: 'nature' },
  { word: 'CLOUDS', difficulty: 'medium', category: 'nature' },

  { word: 'SCHOOL', difficulty: 'medium', category: 'places' },
  { word: 'OFFICE', difficulty: 'medium', category: 'places' },
  { word: 'MARKET', difficulty: 'medium', category: 'places' },
  { word: 'CHURCH', difficulty: 'medium', category: 'places' },
  { word: 'BRIDGE', difficulty: 'medium', category: 'places' },
  { word: 'CASTLE', difficulty: 'medium', category: 'places' },
  { word: 'MUSEUM', difficulty: 'medium', category: 'places' },
  { word: 'LIBRARY', difficulty: 'medium', category: 'places' },

  { word: 'ANIMAL', difficulty: 'medium', category: 'animals' },
  { word: 'RABBIT', difficulty: 'medium', category: 'animals' },
  { word: 'MONKEY', difficulty: 'medium', category: 'animals' },
  { word: 'TIGER', difficulty: 'medium', category: 'animals' },
  { word: 'EAGLE', difficulty: 'medium', category: 'animals' },
  { word: 'PENGUIN', difficulty: 'medium', category: 'animals' },
  { word: 'DOLPHIN', difficulty: 'medium', category: 'animals' },
  { word: 'GIRAFFE', difficulty: 'medium', category: 'animals' },

  { word: 'COMPUTER', difficulty: 'medium', category: 'technology' },
  { word: 'CAMERA', difficulty: 'medium', category: 'technology' },
  { word: 'SCREEN', difficulty: 'medium', category: 'technology' },
  { word: 'LAPTOP', difficulty: 'medium', category: 'technology' },
  { word: 'TABLET', difficulty: 'medium', category: 'technology' },
  { word: 'PRINTER', difficulty: 'medium', category: 'technology' },

  { word: 'KITCHEN', difficulty: 'medium', category: 'home' },
  { word: 'BEDROOM', difficulty: 'medium', category: 'home' },
  { word: 'WINDOW', difficulty: 'medium', category: 'home' },
  { word: 'GARAGE', difficulty: 'medium', category: 'home' },
  { word: 'GARDEN', difficulty: 'medium', category: 'home' },
  { word: 'BALCONY', difficulty: 'medium', category: 'home' },

  // Hard words (9+ letters)
  { word: 'HELICOPTER', difficulty: 'hard', category: 'transport' },
  { word: 'SUBMARINE', difficulty: 'hard', category: 'transport' },
  { word: 'MOTORCYCLE', difficulty: 'hard', category: 'transport' },
  { word: 'AIRPLANE', difficulty: 'hard', category: 'transport' },
  { word: 'SPACESHIP', difficulty: 'hard', category: 'transport' },

  { word: 'TELEPHONE', difficulty: 'hard', category: 'technology' },
  { word: 'TELEVISION', difficulty: 'hard', category: 'technology' },
  { word: 'REFRIGERATOR', difficulty: 'hard', category: 'technology' },
  { word: 'MICROWAVE', difficulty: 'hard', category: 'technology' },
  { word: 'SMARTPHONE', difficulty: 'hard', category: 'technology' },

  { word: 'UNIVERSITY', difficulty: 'hard', category: 'places' },
  { word: 'RESTAURANT', difficulty: 'hard', category: 'places' },
  { word: 'PLAYGROUND', difficulty: 'hard', category: 'places' },
  { word: 'SUPERMARKET', difficulty: 'hard', category: 'places' },
  { word: 'HOSPITAL', difficulty: 'hard', category: 'places' },

  { word: 'BUTTERFLY', difficulty: 'hard', category: 'animals' },
  { word: 'CROCODILE', difficulty: 'hard', category: 'animals' },
  { word: 'HIPPOPOTAMUS', difficulty: 'hard', category: 'animals' },
  { word: 'RHINOCEROS', difficulty: 'hard', category: 'animals' },
  { word: 'CHIMPANZEE', difficulty: 'hard', category: 'animals' },

  { word: 'WATERFALL', difficulty: 'hard', category: 'nature' },
  { word: 'EARTHQUAKE', difficulty: 'hard', category: 'nature' },
  { word: 'LIGHTNING', difficulty: 'hard', category: 'nature' },
  { word: 'HURRICANE', difficulty: 'hard', category: 'nature' },
  { word: 'VOLCANO', difficulty: 'hard', category: 'nature' },
];

// Function to get a random word
export function getRandomWord(
  difficulty?: 'easy' | 'medium' | 'hard'
): WordEntry {
  const filteredWords = difficulty
    ? wordDictionary.filter((entry) => entry.difficulty === difficulty)
    : wordDictionary;

  const randomIndex = Math.floor(Math.random() * filteredWords.length);
  return filteredWords[randomIndex];
}

// Function to get words by category
export function getWordsByCategory(category: string): WordEntry[] {
  return wordDictionary.filter((entry) => entry.category === category);
}

// Function to get all available categories
export function getCategories(): string[] {
  const categories = new Set(
    wordDictionary
      .map((entry) => entry.category)
      .filter((category): category is string => Boolean(category))
  );
  return Array.from(categories);
}

// Function to validate if a string is a valid word (letters, spaces, numbers)
export function isValidWordInput(input: string): boolean {
  return /^[a-z0-9\s]+$/i.test(input.trim());
}

// Function to clean and normalize word input
export function normalizeWordInput(input: string): string {
  return input.trim().toUpperCase().replace(/\s+/g, ' ');
}
