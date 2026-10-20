import { describe, expect, it } from 'vitest';
import { formatRelativeTime, getRelativeTimeParts } from '../src/relative-time';

const now = new Date('2026-03-26T12:00:00Z');
const shift = (ms: number): Date => new Date(now.getTime() + ms);
const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

describe('getRelativeTimeParts', () => {
  it('chooses sensible units', () => {
    expect(getRelativeTimeParts(shift(-10_000), now)).toEqual({ value: 10, unit: 'second', direction: -1 });
    expect(getRelativeTimeParts(shift(-5 * MIN), now)).toEqual({ value: 5, unit: 'minute', direction: -1 });
    expect(getRelativeTimeParts(shift(3 * HOUR), now)).toEqual({ value: 3, unit: 'hour', direction: 1 });
    expect(getRelativeTimeParts(shift(-2 * DAY), now)).toEqual({ value: 2, unit: 'day', direction: -1 });
    expect(getRelativeTimeParts(shift(14 * DAY), now)).toEqual({ value: 2, unit: 'week', direction: 1 });
    expect(getRelativeTimeParts(shift(-90 * DAY), now)).toEqual({ value: 3, unit: 'month', direction: -1 });
    expect(getRelativeTimeParts(shift(2 * 365 * DAY), now)).toEqual({ value: 2, unit: 'year', direction: 1 });
    expect(getRelativeTimeParts(now, now).direction).toBe(0);
  });
});

describe('formatRelativeTime', () => {
  it('formats English past and future', () => {
    expect(formatRelativeTime(shift(-5 * MIN), { now })).toBe('5 minutes ago');
    expect(formatRelativeTime(shift(1 * HOUR), { now })).toBe('in 1 hour');
    expect(formatRelativeTime(shift(3 * DAY), { now })).toBe('in 3 days');
    expect(formatRelativeTime(shift(-10_000), { now })).toBe('just now');
  });

  it('formats Bangla past and future with Bangla digits', () => {
    expect(formatRelativeTime(shift(-5 * MIN), { now, locale: 'bn' })).toBe('৫ মিনিট আগে');
    expect(formatRelativeTime(shift(2 * DAY), { now, locale: 'bn' })).toBe('২ দিন পরে');
    expect(formatRelativeTime(shift(-3 * HOUR), { now, locale: 'bn' })).toBe('৩ ঘণ্টা আগে');
    expect(formatRelativeTime(shift(-20_000), { now, locale: 'bn' })).toBe('এখনই');
  });

  it('uses natural words for single day/week/year in auto mode', () => {
    expect(formatRelativeTime(shift(-DAY), { now })).toBe('yesterday');
    expect(formatRelativeTime(shift(DAY), { now })).toBe('tomorrow');
    expect(formatRelativeTime(shift(-DAY), { now, locale: 'bn' })).toBe('গতকাল');
    expect(formatRelativeTime(shift(DAY), { now, locale: 'bn' })).toBe('আগামীকাল');
    expect(formatRelativeTime(shift(-8 * DAY), { now, locale: 'bn' })).toBe('গত সপ্তাহে');
    expect(formatRelativeTime(shift(400 * DAY), { now })).toBe('next year');
  });

  it('keeps numeric output when numeric is always', () => {
    expect(formatRelativeTime(shift(-DAY), { now, numeric: 'always' })).toBe('1 day ago');
    expect(formatRelativeTime(shift(DAY), { now, locale: 'bn', numeric: 'always' })).toBe('১ দিন পরে');
  });

  it('can force English digits in Bangla', () => {
    expect(formatRelativeTime(shift(-5 * MIN), { now, locale: 'bn', digits: 'en' })).toBe('5 মিনিট আগে');
  });
});
