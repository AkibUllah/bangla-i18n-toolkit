import { describe, expect, it } from 'vitest';
import { getNIDBirthYear, getNIDFormat, isValidNID, maskNID, normalizeNID, toNID17 } from '../src/nid';

describe('normalizeNID / getNIDFormat', () => {
  it('normalises separators and Bangla digits', () => {
    expect(normalizeNID('১৯৯০ ১২৩৪৫৬৭ ৮৯০১২৩')).toBe('19901234567890123');
    expect(normalizeNID('1234-567-890')).toBe('1234567890');
  });

  it('detects formats by length', () => {
    expect(getNIDFormat('1234567890')).toBe('smart-10');
    expect(getNIDFormat('1234567890123')).toBe('legacy-13');
    expect(getNIDFormat('19901234567890123')).toBe('legacy-17');
    expect(getNIDFormat('12345')).toBeNull();
    expect(getNIDFormat('12345678901234567890')).toBeNull();
    expect(getNIDFormat('12345abcde')).toBeNull();
  });
});

describe('isValidNID', () => {
  it('accepts well-formed numbers of all three lengths', () => {
    expect(isValidNID('1234567890')).toBe(true);
    expect(isValidNID('1234567890123')).toBe(true);
    expect(isValidNID('19901234567890123')).toBe(true);
    expect(isValidNID('১৯৯০১২৩৪৫৬৭৮৯০১২৩')).toBe(true);
  });

  it('rejects impossible birth years in 17-digit numbers', () => {
    expect(isValidNID('99911234567890123')).toBe(false);
    expect(isValidNID('18991234567890123')).toBe(false);
    expect(isValidNID('20301234567890123', { currentYear: 2026 })).toBe(false);
    expect(isValidNID('20201234567890123', { currentYear: 2026 })).toBe(true);
  });

  it('rejects all-zero and wrong lengths and honours allowedFormats', () => {
    expect(isValidNID('0000000000')).toBe(false);
    expect(isValidNID('123456789')).toBe(false);
    expect(isValidNID('1234567890', { allowedFormats: ['legacy-17'] })).toBe(false);
    expect(isValidNID('1234567890', { allowedFormats: ['smart-10'] })).toBe(true);
  });
});

describe('toNID17 / getNIDBirthYear', () => {
  it('prefixes the birth year', () => {
    expect(toNID17('1234567890123', 1990)).toBe('19901234567890123');
    expect(getNIDBirthYear('19901234567890123')).toBe(1990);
    expect(getNIDBirthYear('1234567890')).toBeNull();
  });

  it('rejects wrong inputs', () => {
    expect(() => toNID17('1234567890', 1990)).toThrow(RangeError);
    expect(() => toNID17('1234567890123', 1850)).toThrow(RangeError);
  });
});

describe('maskNID', () => {
  it('masks everything except the tail', () => {
    expect(maskNID('1234567890')).toBe('******7890');
    expect(maskNID('19901234567890123', 3)).toBe('**************123');
    expect(maskNID('not-an-nid')).toBe('not-an-nid');
  });
});
