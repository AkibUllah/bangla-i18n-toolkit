import { describe, expect, it } from 'vitest';
import {
  BD_OPERATORS,
  formatBDPhone,
  getBDOperator,
  isValidBDPhone,
  maskBDPhone,
  normalizeBDPhone,
} from '../src/phone';

describe('normalizeBDPhone', () => {
  it('accepts every common notation', () => {
    const expected = '01712345678';
    expect(normalizeBDPhone('01712345678')).toBe(expected);
    expect(normalizeBDPhone('+8801712345678')).toBe(expected);
    expect(normalizeBDPhone('8801712345678')).toBe(expected);
    expect(normalizeBDPhone('008801712345678')).toBe(expected);
    expect(normalizeBDPhone('+880 1712-345678')).toBe(expected);
    expect(normalizeBDPhone('01712-345678')).toBe(expected);
    expect(normalizeBDPhone('(0171) 234 5678')).toBe(expected);
    expect(normalizeBDPhone('1712345678')).toBe(expected);
  });

  it('accepts Bangla digits', () => {
    expect(normalizeBDPhone('০১৭১২৩৪৫৬৭৮')).toBe('01712345678');
    expect(normalizeBDPhone('+৮৮০১৮১২৩৪৫৬৭৮')).toBe('01812345678');
  });

  it('rejects numbers that are not BD mobiles', () => {
    expect(normalizeBDPhone('01212345678')).toBeNull(); // 012 not allocated
    expect(normalizeBDPhone('0171234567')).toBeNull(); // too short
    expect(normalizeBDPhone('017123456789')).toBeNull(); // too long
    expect(normalizeBDPhone('+919812345678')).toBeNull(); // India
    expect(normalizeBDPhone('02-9551234')).toBeNull(); // Dhaka landline
    expect(normalizeBDPhone('abc')).toBeNull();
    expect(normalizeBDPhone('')).toBeNull();
  });
});

describe('isValidBDPhone / getBDOperator', () => {
  it('validates and identifies operators for every prefix', () => {
    const cases: Array<[string, string]> = [
      ['01312345678', 'Grameenphone'],
      ['01412345678', 'Banglalink'],
      ['01512345678', 'Teletalk'],
      ['01612345678', 'Airtel'],
      ['01712345678', 'Grameenphone'],
      ['01812345678', 'Robi'],
      ['01912345678', 'Banglalink'],
    ];
    for (const [number, operator] of cases) {
      expect(isValidBDPhone(number)).toBe(true);
      expect(getBDOperator(number)?.name).toBe(operator);
    }
    expect(Object.keys(BD_OPERATORS)).toHaveLength(7);
  });

  it('returns null operator for invalid numbers', () => {
    expect(isValidBDPhone('01112345678')).toBe(false);
    expect(getBDOperator('01112345678')).toBeNull();
  });
});

describe('formatBDPhone', () => {
  it('formats in every style', () => {
    expect(formatBDPhone('01712345678')).toBe('+880 1712-345678');
    expect(formatBDPhone('01712345678', 'e164')).toBe('+8801712345678');
    expect(formatBDPhone('+8801712345678', 'local')).toBe('01712-345678');
    expect(formatBDPhone('০১৭১২৩৪৫৬৭৮', 'compact')).toBe('01712345678');
  });

  it('throws for invalid numbers', () => {
    expect(() => formatBDPhone('12345')).toThrow(RangeError);
  });
});

describe('maskBDPhone', () => {
  it('masks the middle digits', () => {
    expect(maskBDPhone('01712345678')).toBe('017****5678');
    expect(maskBDPhone('+8801712345678', 2)).toBe('017******78');
    expect(maskBDPhone('01712345678', 0)).toBe('017********');
  });

  it('returns invalid input untouched', () => {
    expect(maskBDPhone('hello')).toBe('hello');
  });
});
