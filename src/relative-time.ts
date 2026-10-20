import type { DateInput } from './date';
import type { DigitStyle, Locale } from './types';
import { resolveDigits } from './types';
import { toBanglaDigits } from './numerals';

export type RelativeUnit = 'second' | 'minute' | 'hour' | 'day' | 'week' | 'month' | 'year';

export interface RelativeTimeOptions {
  /** Reference point. Default: `new Date()`. */
  now?: DateInput;
  /** Default: `en`. */
  locale?: Locale;
  /** Default: `auto`. */
  digits?: DigitStyle;
  /**
   * `auto` uses words such as "yesterday" / "গতকাল" where natural,
   * `always` keeps "1 day ago" / "১ দিন আগে". Default: `auto`.
   */
  numeric?: 'auto' | 'always';
}

export interface RelativeTimeParts {
  value: number;
  unit: RelativeUnit;
  /** Negative = past, positive = future. */
  direction: -1 | 0 | 1;
}

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

const UNIT_WORDS: Record<Locale, Record<RelativeUnit, { one: string; other: string }>> = {
  en: {
    second: { one: 'second', other: 'seconds' },
    minute: { one: 'minute', other: 'minutes' },
    hour: { one: 'hour', other: 'hours' },
    day: { one: 'day', other: 'days' },
    week: { one: 'week', other: 'weeks' },
    month: { one: 'month', other: 'months' },
    year: { one: 'year', other: 'years' },
  },
  bn: {
    second: { one: 'সেকেন্ড', other: 'সেকেন্ড' },
    minute: { one: 'মিনিট', other: 'মিনিট' },
    hour: { one: 'ঘণ্টা', other: 'ঘণ্টা' },
    day: { one: 'দিন', other: 'দিন' },
    week: { one: 'সপ্তাহ', other: 'সপ্তাহ' },
    month: { one: 'মাস', other: 'মাস' },
    year: { one: 'বছর', other: 'বছর' },
  },
};

const SPECIAL: Record<Locale, { now: string; yesterday: string; tomorrow: string; lastWeek: string; nextWeek: string; lastYear: string; nextYear: string }> = {
  en: {
    now: 'just now',
    yesterday: 'yesterday',
    tomorrow: 'tomorrow',
    lastWeek: 'last week',
    nextWeek: 'next week',
    lastYear: 'last year',
    nextYear: 'next year',
  },
  bn: {
    now: 'এখনই',
    yesterday: 'গতকাল',
    tomorrow: 'আগামীকাল',
    lastWeek: 'গত সপ্তাহে',
    nextWeek: 'আগামী সপ্তাহে',
    lastYear: 'গত বছর',
    nextYear: 'আগামী বছর',
  },
};

function toMillis(input: DateInput): number {
  const ms = input instanceof Date ? input.getTime() : new Date(input).getTime();
  if (Number.isNaN(ms)) throw new RangeError(`Invalid date: ${String(input)}`);
  return ms;
}

/**
 * Pick the most natural unit for a time difference. Thresholds mirror
 * common UI expectations (45s -> "just now", 45m -> hours, 26 days -> month…).
 */
export function getRelativeTimeParts(date: DateInput, now: DateInput = new Date()): RelativeTimeParts {
  const diff = toMillis(date) - toMillis(now);
  const abs = Math.abs(diff);
  const direction: -1 | 0 | 1 = diff === 0 ? 0 : diff < 0 ? -1 : 1;

  if (abs < 45 * SECOND) return { value: Math.round(abs / SECOND), unit: 'second', direction };
  if (abs < 45 * MINUTE) return { value: Math.max(1, Math.round(abs / MINUTE)), unit: 'minute', direction };
  if (abs < 22 * HOUR) return { value: Math.max(1, Math.round(abs / HOUR)), unit: 'hour', direction };
  if (abs < 7 * DAY) return { value: Math.max(1, Math.round(abs / DAY)), unit: 'day', direction };
  if (abs < 26 * DAY) return { value: Math.max(1, Math.round(abs / WEEK)), unit: 'week', direction };
  if (abs < 320 * DAY) return { value: Math.max(1, Math.round(abs / MONTH)), unit: 'month', direction };
  return { value: Math.max(1, Math.round(abs / YEAR)), unit: 'year', direction };
}

/**
 * Human-friendly relative time in English or Bangla.
 *
 * @example formatRelativeTime(fiveMinutesAgo, { locale: 'bn' }) // '৫ মিনিট আগে'
 * @example formatRelativeTime(inTwoDays, { locale: 'bn' })      // '২ দিন পরে'
 * @example formatRelativeTime(yesterday)                         // 'yesterday'
 */
export function formatRelativeTime(date: DateInput, options: RelativeTimeOptions = {}): string {
  const locale = options.locale ?? 'en';
  const digits = resolveDigits(options.digits, locale);
  const numeric = options.numeric ?? 'auto';
  const { value, unit, direction } = getRelativeTimeParts(date, options.now ?? new Date());
  const words = SPECIAL[locale];

  if (unit === 'second' && value < 45) return words.now;

  if (numeric === 'auto' && value === 1 && direction !== 0) {
    if (unit === 'day') return direction < 0 ? words.yesterday : words.tomorrow;
    if (unit === 'week') return direction < 0 ? words.lastWeek : words.nextWeek;
    if (unit === 'year') return direction < 0 ? words.lastYear : words.nextYear;
  }

  const unitWord = value === 1 ? UNIT_WORDS[locale][unit].one : UNIT_WORDS[locale][unit].other;
  const number = digits === 'bn' ? toBanglaDigits(value) : String(value);

  if (locale === 'bn') {
    return direction < 0 ? `${number} ${unitWord} আগে` : `${number} ${unitWord} পরে`;
  }
  return direction < 0 ? `${number} ${unitWord} ago` : `in ${number} ${unitWord}`;
}
