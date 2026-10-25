import { describe, expect, it } from 'vitest';
import {
  formatDate,
  getBanglaDayPeriod,
  getMonthName,
  getWeekdayName,
  MONTHS,
  WEEKDAYS,
} from '../src/date';

// 26 March 2026 is a Thursday (Independence Day).
const independenceDay = new Date(2026, 2, 26, 15, 5, 9);

describe('names', () => {
  it('exposes 12 months and 7 weekdays per locale', () => {
    expect(MONTHS.en).toHaveLength(12);
    expect(MONTHS.bn).toHaveLength(12);
    expect(WEEKDAYS.en).toHaveLength(7);
    expect(WEEKDAYS.bn).toHaveLength(7);
  });

  it('returns month and weekday names', () => {
    expect(getMonthName(2, 'bn')).toBe('মার্চ');
    expect(getMonthName(11, 'en', true)).toBe('Dec');
    expect(getWeekdayName(5, 'bn')).toBe('শুক্রবার');
    expect(getWeekdayName(0, 'en', true)).toBe('Sun');
  });

  it('throws on out-of-range indexes', () => {
    expect(() => getMonthName(12)).toThrow(RangeError);
    expect(() => getWeekdayName(7)).toThrow(RangeError);
  });
});

describe('getBanglaDayPeriod', () => {
  it('maps hours to the Bangla part of day', () => {
    expect(getBanglaDayPeriod(5)).toBe('ভোর');
    expect(getBanglaDayPeriod(9)).toBe('সকাল');
    expect(getBanglaDayPeriod(13)).toBe('দুপুর');
    expect(getBanglaDayPeriod(16)).toBe('বিকাল');
    expect(getBanglaDayPeriod(19)).toBe('সন্ধ্যা');
    expect(getBanglaDayPeriod(23)).toBe('রাত');
    expect(getBanglaDayPeriod(1)).toBe('রাত');
  });

  it('rejects invalid hours', () => {
    expect(() => getBanglaDayPeriod(24)).toThrow(RangeError);
  });
});

describe('formatDate', () => {
  it('formats the default pattern in English and Bangla', () => {
    expect(formatDate(independenceDay)).toBe('26 March 2026');
    expect(formatDate(independenceDay, undefined, { locale: 'bn' })).toBe('২৬ মার্চ ২০২৬');
  });

  it('supports every token', () => {
    expect(formatDate(independenceDay, 'YYYY-MM-DD HH:mm:ss')).toBe('2026-03-26 15:05:09');
    expect(formatDate(independenceDay, 'YY/M/D H:m:s')).toBe('26/3/26 15:5:9');
    expect(formatDate(independenceDay, 'dddd, ddd MMM hh:mm A')).toBe('Thursday, Thu Mar 03:05 PM');
    expect(formatDate(independenceDay, 'h a')).toBe('3 pm');
  });

  it('uses Bangla weekday and day period', () => {
    expect(formatDate(independenceDay, 'dddd, h:mm A', { locale: 'bn' })).toBe('বৃহস্পতিবার, ৩:০৫ বিকাল');
    expect(formatDate(new Date(2026, 0, 1, 8, 30), 'h:mm a', { locale: 'bn' })).toBe('৮:৩০ সকাল');
  });

  it('keeps bracketed literals and allows English digits with Bangla names', () => {
    expect(formatDate(independenceDay, '[Date:] D MMMM', { locale: 'bn', digits: 'en' })).toBe('Date: 26 মার্চ');
    expect(formatDate(independenceDay, '[YYYY]')).toBe('YYYY');
  });

  it('handles unbalanced brackets in linear time', () => {
    const pattern = '[\\'.repeat(20000);
    const started = performance.now();
    const out = formatDate(independenceDay, pattern);
    expect(performance.now() - started).toBeLessThan(500);
    expect(out.length).toBeGreaterThan(0);
    expect(formatDate(independenceDay, '[[YYYY] YYYY')).toBe('[YYYY 2026');
  });

  it('accepts timestamps and ISO strings', () => {
    expect(formatDate(independenceDay.getTime(), 'D/M/YYYY')).toBe('26/3/2026');
    expect(formatDate('2026-03-26T00:00:00', 'DD MMM')).toBe('26 Mar');
  });

  it('throws on invalid dates', () => {
    expect(() => formatDate('not a date')).toThrow(RangeError);
  });
});
