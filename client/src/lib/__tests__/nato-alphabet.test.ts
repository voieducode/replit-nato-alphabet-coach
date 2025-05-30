import { describe, it, expect } from 'vitest'
import { 
  convertToNATO, 
  getAllLetters, 
  getRandomLetter, 
  getNATOWord 
} from '../nato-alphabet'

describe('NATO Alphabet Functions', () => {
  describe('convertToNATO', () => {
    it('should convert single letters to NATO words', () => {
      const result = convertToNATO('A')
      expect(result).toEqual([{ char: 'A', nato: 'Alpha' }])
    })

    it('should convert multiple letters', () => {
      const result = convertToNATO('ABC')
      expect(result).toEqual([
        { char: 'A', nato: 'Alpha' },
        { char: 'B', nato: 'Bravo' },
        { char: 'C', nato: 'Charlie' }
      ])
    })

    it('should handle lowercase letters', () => {
      const result = convertToNATO('abc')
      expect(result).toEqual([
        { char: 'A', nato: 'Alpha' },
        { char: 'B', nato: 'Bravo' },
        { char: 'C', nato: 'Charlie' }
      ])
    })

    it('should handle non-letter characters', () => {
      const result = convertToNATO('A1B')
      expect(result).toEqual([
        { char: 'A', nato: 'Alpha' },
        { char: 'B', nato: 'Bravo' }
      ])
    })

    it('should handle spaces and special characters', () => {
      const result = convertToNATO('A B-C')
      expect(result).toEqual([
        { char: 'A', nato: 'Alpha' },
        { char: ' ', nato: 'SPACE' },
        { char: 'B', nato: 'Bravo' },
        { char: 'C', nato: 'Charlie' }
      ])
    })

    it('should handle empty string', () => {
      const result = convertToNATO('')
      expect(result).toEqual([])
    })

    it('should handle full sentence', () => {
      const result = convertToNATO('Hello World!')
      expect(result).toHaveLength(11)
      expect(result[0]).toEqual({ char: 'H', nato: 'Hotel' })
      expect(result[5]).toEqual({ char: ' ', nato: 'SPACE' })
      // Only letters and spaces are converted, special characters are filtered out
    })
  })

  describe('getAllLetters', () => {
    it('should return all 26 letters of the alphabet', () => {
      const letters = getAllLetters()
      expect(letters).toHaveLength(26)
      expect(letters[0]).toBe('A')
      expect(letters[25]).toBe('Z')
    })

    it('should return letters in alphabetical order', () => {
      const letters = getAllLetters()
      const sortedLetters = [...letters].sort()
      expect(letters).toEqual(sortedLetters)
    })

    it('should return uppercase letters', () => {
      const letters = getAllLetters()
      letters.forEach(letter => {
        expect(letter).toMatch(/[A-Z]/)
      })
    })
  })

  describe('getRandomLetter', () => {
    it('should return a valid letter', () => {
      const letter = getRandomLetter()
      expect(letter).toMatch(/[A-Z]/)
      expect(letter).toHaveLength(1)
    })

    it('should return letters from the valid set', () => {
      const validLetters = getAllLetters()
      for (let i = 0; i < 10; i++) {
        const letter = getRandomLetter()
        expect(validLetters).toContain(letter)
      }
    })

    it('should return different letters over multiple calls', () => {
      const letters = new Set()
      for (let i = 0; i < 50; i++) {
        letters.add(getRandomLetter())
      }
      // Should get at least a few different letters
      expect(letters.size).toBeGreaterThan(3)
    })
  })

  describe('getNATOWord', () => {
    it('should return correct NATO words for uppercase letters', () => {
      expect(getNATOWord('A')).toBe('Alpha')
      expect(getNATOWord('B')).toBe('Bravo')
      expect(getNATOWord('C')).toBe('Charlie')
      expect(getNATOWord('Z')).toBe('Zulu')
    })

    it('should return correct NATO words for lowercase letters', () => {
      expect(getNATOWord('a')).toBe('Alpha')
      expect(getNATOWord('b')).toBe('Bravo')
      expect(getNATOWord('z')).toBe('Zulu')
    })

    it('should return undefined for non-letters', () => {
      expect(getNATOWord('1')).toBeUndefined()
      expect(getNATOWord('!')).toBeUndefined()
      expect(getNATOWord(' ')).toBeUndefined()
    })

    it('should return undefined for empty string', () => {
      expect(getNATOWord('')).toBeUndefined()
    })

    it('should return undefined for multi-character strings', () => {
      expect(getNATOWord('AB')).toBeUndefined()
      expect(getNATOWord('Alpha')).toBeUndefined()
    })
  })
})