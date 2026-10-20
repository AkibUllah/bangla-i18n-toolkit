import { describe, expect, it } from 'vitest';
import {
  isBanglaDigit,
  isNumeric,
  parseLocalizedNumber,
  toBanglaDigits,
  toEnglishDigits,
} from '../src/numerals';

describe('numerals', () => {
  it('converts numbers and strings to Bangla digits', () => {
    expect(toBanglaDigits(2024)).toBe('২০২৪');
    expect(toBanglaDigits('Order #1023')).toBe('Order #১০২৩');
    expect(toBanglaDigits(-12.5)).toBe('-১২.৫');
  });

  it('converts Bangla digits back to ASCII digits', () => {
    expect(toEnglishDigits('৳১,২৩,৪৫৬')).toBe('৳1,23,456');
    expect(toEnglishDigits('০১৭১২৩৪৫৬৭৮')).toBe('01712345678');
  });

  it('round-trips arbitrary digit strings', () => {
    const value = '0123456789';
    expect(toEnglishDigits(toBanglaDigits(value))).toBe(value);
  });

  it('identifies Bangla digits and numeric strings', () => {
    expect(isBanglaDigit('৫')).toBe(true);
    expect(isBanglaDigit('5')).toBe(false);
    expect(isBanglaDigit('৫৫')).toBe(false);
    expect(isNumeric('১২3')).toBe(true);
    expect(isNumeric('12a')).toBe(false);
    expect(isNumeric('')).toBe(false);
  });

  it('parses localised numbers with currency markers and grouping', () => {
    expect(parseLocalizedNumber('৳ ১,২৩,৪৫৬.৭৮')).toBe(123456.78);
    expect(parseLocalizedNumber('-1,250')).toBe(-1250);
    expect(parseLocalizedNumber('Tk 500')).toBe(500);
    expect(parseLocalizedNumber('BDT 1,000.50')).toBe(1000.5);
    expect(parseLocalizedNumber('৫০০ টাকা')).toBe(500);
  });

  it('returns NaN for non-numeric input', () => {
    expect(parseLocalizedNumber('abc')).toBeNaN();
    expect(parseLocalizedNumber('')).toBeNaN();
    expect(parseLocalizedNumber('1.2.3')).toBeNaN();
  });
});
