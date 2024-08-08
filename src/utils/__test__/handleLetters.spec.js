import { describe, it, expect } from 'vitest';
import { lowerFirstCapitalLetter } from '@/utils/handleLetters';

describe('lowerFirstCapitalLetter', () => {
  it.each([
    ['empty string', '', ''],
    ['null', null, ''],
    ['undefined', undefined, ''],
    ['single uppercase letter', 'A', 'a'],
    ['single lowercase letter', 'a', 'a'],
    ['first letter uppercase', 'Hello', 'hello'],
    ['all uppercase', 'HELLO', 'hELLO'],
    ['all lowercase', 'hello', 'hello'],
    ['non-alphabetic characters only', '123', '123'],
    ['mixed alphanumeric characters', '1a2b3c', '1a2b3c'],
    ['special characters', '!@#', '!@#'],
    ['mixed-case string 1', 'BraIn', 'braIn'],
    ['mixed-case string 2', 'Weni', 'weni'],
  ])('should handle %s correctly', (_, input, expected) => {
    expect(lowerFirstCapitalLetter(input)).toBe(expected);
  });
});
