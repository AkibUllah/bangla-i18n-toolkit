import { describe, expect, it } from 'vitest';
import {
  formatBDT,
  formatBDTFromPaisa,
  formatCompactBDT,
  formatNumber,
  groupDigits,
  toCompactParts,
} from '../src/currency';

describe('groupDigits', () => {
  it('applies Indian grouping (3 then 2s)', () => {
    expect(groupDigits('1234567')).toBe('12,34,567');
    expect(groupDigits('123456789')).toBe('12,34,56,789');
    expect(groupDigits('1000')).toBe('1,000');
    expect(groupDigits('999')).toBe('999');
  });

  it('applies western grouping and none', () => {
    expect(groupDigits('1234567', 'western')).toBe('1,234,567');
    expect(groupDigits('1234567', 'none')).toBe('1234567');
  });
});

describe('formatNumber', () => {
  it('formats with Indian grouping and up to 2 decimals by default', () => {
    expect(formatNumber(1234567.891)).toBe('12,34,567.89');
    expect(formatNumber(1234567)).toBe('12,34,567');
    expect(formatNumber(0.5)).toBe('0.5');
  });

  it('respects fraction digit bounds', () => {
    expect(formatNumber(1500, { minimumFractionDigits: 2 })).toBe('1,500.00');
    expect(formatNumber(1.23456, { maximumFractionDigits: 3 })).toBe('1.235');
    expect(formatNumber(1.5, { maximumFractionDigits: 0 })).toBe('2');
  });

  it('renders Bangla digits when asked', () => {
    expect(formatNumber(1234567, { digits: 'bn' })).toBe('১২,৩৪,৫৬৭');
    expect(formatNumber(1234567, { locale: 'bn', digits: 'auto' })).toBe('১২,৩৪,৫৬৭');
  });

  it('handles negatives and negative zero', () => {
    expect(formatNumber(-1234.5)).toBe('-1,234.5');
    expect(formatNumber(-0)).toBe('0');
    expect(formatNumber(-0.001)).toBe('0');
  });

  it('rejects non-finite values', () => {
    expect(() => formatNumber(NaN)).toThrow(RangeError);
    expect(() => formatNumber(Infinity)).toThrow(RangeError);
  });
});

describe('formatBDT', () => {
  it('uses the taka sign with Indian grouping by default', () => {
    expect(formatBDT(123456.78)).toBe('৳1,23,456.78');
    expect(formatBDT(1500)).toBe('৳1,500');
    expect(formatBDT(0)).toBe('৳0');
  });

  it('supports Bangla digits via locale', () => {
    expect(formatBDT(1500, { locale: 'bn' })).toBe('৳১,৫০০');
    expect(formatBDT(123456.78, { locale: 'bn' })).toBe('৳১,২৩,৪৫৬.৭৮');
  });

  it('supports code, word and no symbol', () => {
    expect(formatBDT(1500, { symbol: 'code' })).toBe('BDT 1,500');
    expect(formatBDT(1500, { symbol: 'word' })).toBe('1,500 Tk');
    expect(formatBDT(1500, { symbol: 'word', locale: 'bn' })).toBe('১,৫০০ টাকা');
    expect(formatBDT(1500, { symbol: 'none' })).toBe('1,500');
    expect(formatBDT(1500, { space: true })).toBe('৳ 1,500');
  });

  it('places the minus sign before the symbol', () => {
    expect(formatBDT(-500)).toBe('-৳500');
    expect(formatBDT(-500.25, { symbol: 'code' })).toBe('-BDT 500.25');
  });

  it('forces two decimals when requested (invoice style)', () => {
    expect(formatBDT(1500, { minimumFractionDigits: 2 })).toBe('৳1,500.00');
    expect(formatBDT(1500.5, { minimumFractionDigits: 2 })).toBe('৳1,500.50');
  });
});

describe('formatBDTFromPaisa', () => {
  it('formats integer minor units exactly', () => {
    expect(formatBDTFromPaisa(12345678)).toBe('৳1,23,456.78');
    expect(formatBDTFromPaisa(5)).toBe('৳0.05');
    expect(formatBDTFromPaisa(0)).toBe('৳0.00');
  });

  it('accepts bigint and negatives', () => {
    expect(formatBDTFromPaisa(-5000n)).toBe('-৳50.00');
    expect(formatBDTFromPaisa(123456789012345n, { symbol: 'code' })).toBe('BDT 12,34,56,78,90,123.45');
  });

  it('supports Bangla digits', () => {
    expect(formatBDTFromPaisa(150000, { locale: 'bn' })).toBe('৳১,৫০০.০০');
  });

  it('rejects fractional paisa', () => {
    expect(() => formatBDTFromPaisa(10.5)).toThrow(RangeError);
  });
});

describe('compact amounts', () => {
  it('picks crore, lakh, thousand or none', () => {
    expect(toCompactParts(12_500_000)).toEqual({ value: 1.25, unit: 'crore' });
    expect(toCompactParts(250_000)).toEqual({ value: 2.5, unit: 'lakh' });
    expect(toCompactParts(7_500)).toEqual({ value: 7.5, unit: 'thousand' });
    expect(toCompactParts(999)).toEqual({ value: 999, unit: 'none' });
  });

  it('formats compact BDT in both locales', () => {
    expect(formatCompactBDT(12_500_000)).toBe('৳1.25 crore');
    expect(formatCompactBDT(250_000, { locale: 'bn' })).toBe('৳২.৫ লাখ');
    expect(formatCompactBDT(7_500, { locale: 'bn' })).toBe('৳৭.৫ হাজার');
    expect(formatCompactBDT(999)).toBe('৳999');
    expect(formatCompactBDT(-250_000)).toBe('-৳2.5 lakh');
    expect(formatCompactBDT(250_000, { symbol: false, precision: 0 })).toBe('3 lakh');
  });
});
