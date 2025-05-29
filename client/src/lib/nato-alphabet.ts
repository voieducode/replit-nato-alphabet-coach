export const natoAlphabet: Record<string, string> = {
  'A': 'Alpha',
  'B': 'Bravo', 
  'C': 'Charlie',
  'D': 'Delta',
  'E': 'Echo',
  'F': 'Foxtrot',
  'G': 'Golf',
  'H': 'Hotel',
  'I': 'India',
  'J': 'Juliet',
  'K': 'Kilo',
  'L': 'Lima',
  'M': 'Mike',
  'N': 'November',
  'O': 'Oscar',
  'P': 'Papa',
  'Q': 'Quebec',
  'R': 'Romeo',
  'S': 'Sierra',
  'T': 'Tango',
  'U': 'Uniform',
  'V': 'Victor',
  'W': 'Whiskey',
  'X': 'X-ray',
  'Y': 'Yankee',
  'Z': 'Zulu'
};

export interface ConvertedLetter {
  char: string;
  nato: string;
}

export function convertToNATO(text: string): ConvertedLetter[] {
  return text
    .toUpperCase()
    .split('')
    .map(char => {
      if (natoAlphabet[char]) {
        return { char, nato: natoAlphabet[char] };
      } else if (char === ' ') {
        return { char: ' ', nato: 'SPACE' };
      }
      return null;
    })
    .filter((item): item is ConvertedLetter => item !== null);
}

export function getAllLetters(): string[] {
  return Object.keys(natoAlphabet);
}

export function getRandomLetter(): string {
  const letters = getAllLetters();
  return letters[Math.floor(Math.random() * letters.length)];
}

export function getNATOWord(letter: string): string | undefined {
  return natoAlphabet[letter.toUpperCase()];
}
