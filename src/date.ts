import type { DigitStyle, Locale } from './types';
import { resolveDigits } from './types';
import { toBanglaDigits } from './numerals';

export const MONTHS: Record<Locale, readonly string[]> = {
  en: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ],
  bn: [
    'জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন',
    'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর',
  ],
};

export const MONTHS_SHORT: Record<Locale, readonly string[]> = {
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  bn: ['জানু', 'ফেব্রু', 'মার্চ', 'এপ্রি', 'মে', 'জুন', 'জুলা', 'আগ', 'সেপ্টে', 'অক্টো', 'নভে', 'ডিসে'],
};

/** Index 0 is Sunday, matching `Date#getDay()`. */
export const WEEKDAYS: Record<Locale, readonly string[]> = {
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  bn: ['রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার', 'শনিবার'],
};

export const WEEKDAYS_SHORT: Record<Locale, readonly string[]> = {
  en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  bn: ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'],
};

export type BanglaDayPeriod = 'ভোর' | 'সকাল' | 'দুপুর' | 'বিকাল' | 'সন্ধ্যা' | 'রাত';

export interface FormatDateOptions {
  /** Default: `en`. */
  locale?: Locale;
  /** Default: `auto` (Bangla digits for `bn`). */
  digits?: DigitStyle;
}

export type DateInput = Date | number | string;

function toDate(input: DateInput): Date {
  const date = input instanceof Date ? new Date(input.getTime()) : new Date(input);
  if (Number.isNaN(date.getTime())) {
    throw new RangeError(`Invalid date: ${String(input)}`);
  }
  return date;
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

/** Month name for a 0-based month index. */
export function getMonthName(monthIndex: number, locale: Locale = 'en', short = false): string {
  const table = short ? MONTHS_SHORT[locale] : MONTHS[locale];
  const name = table[monthIndex];
  if (name === undefined) throw new RangeError(`monthIndex must be 0-11, received ${monthIndex}`);
  return name;
}

/** Weekday name for a 0-based day index (0 = Sunday). */
export function getWeekdayName(dayIndex: number, locale: Locale = 'en', short = false): string {
  const table = short ? WEEKDAYS_SHORT[locale] : WEEKDAYS[locale];
  const name = table[dayIndex];
  if (name === undefined) throw new RangeError(`dayIndex must be 0-6, received ${dayIndex}`);
  return name;
}

/**
 * The Bangla part-of-day word used instead of AM/PM.
 *
 * 04–05 ভোর · 06–11 সকাল · 12–14 দুপুর · 15–17 বিকাল · 18–19 সন্ধ্যা · 20–03 রাত
 */
export function getBanglaDayPeriod(hour: number): BanglaDayPeriod {
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
    throw new RangeError(`hour must be 0-23, received ${hour}`);
  }
  if (hour >= 4 && hour < 6) return 'ভোর';
  if (hour >= 6 && hour < 12) return 'সকাল';
  if (hour >= 12 && hour < 15) return 'দুপুর';
  if (hour >= 15 && hour < 18) return 'বিকাল';
  if (hour >= 18 && hour < 20) return 'সন্ধ্যা';
  return 'রাত';
}

const TOKEN_RE = /\[([^\]]*)\]|YYYY|YY|MMMM|MMM|MM|M|DD|D|dddd|ddd|HH|H|hh|h|mm|m|ss|s|A|a/g;

/**
 * Format a date with a Moment/Day.js-style token pattern, localised to
 * English or Bangla. Literal text goes in square brackets.
 *
 * Tokens: YYYY YY · MMMM MMM MM M · DD D · dddd ddd · HH H hh h · mm m · ss s · A a
 * In Bangla, `A`/`a` render the part of day (সকাল, দুপুর, রাত…) instead of AM/PM.
 *
 * @example formatDate(new Date(2026, 2, 26), 'D MMMM YYYY', { locale: 'bn' }) // '২৬ মার্চ ২০২৬'
 * @example formatDate(new Date(2026, 2, 26, 15, 5), 'dddd, h:mm A', { locale: 'bn' }) // 'বৃহস্পতিবার, ৩:০৫ বিকাল'
 */
export function formatDate(input: DateInput, pattern = 'D MMMM YYYY', options: FormatDateOptions = {}): string {
  const locale = options.locale ?? 'en';
  const digits = resolveDigits(options.digits, locale);
  const date = toDate(input);

  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const weekday = date.getDay();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const hour12 = hours % 12 === 0 ? 12 : hours % 12;

  const period = (): string => {
    if (locale === 'bn') return getBanglaDayPeriod(hours);
    return hours < 12 ? 'AM' : 'PM';
  };

  const out = pattern.replace(TOKEN_RE, (token, literal: string | undefined) => {
    if (literal !== undefined) return literal;
    switch (token) {
      case 'YYYY': return String(year);
      case 'YY': return pad2(year % 100);
      case 'MMMM': return getMonthName(month, locale);
      case 'MMM': return getMonthName(month, locale, true);
      case 'MM': return pad2(month + 1);
      case 'M': return String(month + 1);
      case 'DD': return pad2(day);
      case 'D': return String(day);
      case 'dddd': return getWeekdayName(weekday, locale);
      case 'ddd': return getWeekdayName(weekday, locale, true);
      case 'HH': return pad2(hours);
      case 'H': return String(hours);
      case 'hh': return pad2(hour12);
      case 'h': return String(hour12);
      case 'mm': return pad2(minutes);
      case 'm': return String(minutes);
      case 'ss': return pad2(seconds);
      case 's': return String(seconds);
      case 'A': return period();
      case 'a': return locale === 'bn' ? period() : period().toLowerCase();
      default: return token;
    }
  });

  return digits === 'bn' ? toBanglaDigits(out) : out;
}
