import type { DigitStyle, Locale } from './types';
import { resolveDigits } from './types';
import { toBanglaDigits } from './numerals';

/** CLDR plural categories relevant to English and Bangla. */
export type PluralCategory = 'one' | 'other';

export interface PluralForms {
  one: string;
  other: string;
}

export interface PluralizeOptions {
  /** Default: `en`. */
  locale?: Locale;
  /** Default: `auto`. */
  digits?: DigitStyle;
  /** Prefix the count to the chosen form. Default: true. */
  includeCount?: boolean;
}

/**
 * Bangla counters (measure words). `টি` for things, `জন` for people,
 * `খানা` for flat objects and `টা` colloquially.
 */
export type BanglaClassifier = 'টি' | 'টা' | 'জন' | 'খানা';

/**
 * CLDR plural rules.
 * - en: `one` when n === 1.
 * - bn: `one` when the integer part is 0 or n === 1 (0, 1, 0.5 are all "one").
 */
export function getPluralCategory(n: number, locale: Locale = 'en'): PluralCategory {
  if (!Number.isFinite(n)) throw new RangeError(`n must be finite, received ${String(n)}`);
  const abs = Math.abs(n);
  if (locale === 'bn') {
    return Math.trunc(abs) === 0 || abs === 1 ? 'one' : 'other';
  }
  return abs === 1 ? 'one' : 'other';
}

/**
 * Pick a plural form and (optionally) prefix the count.
 *
 * @example pluralize(3, { one: 'order', other: 'orders' }) // '3 orders'
 * @example pluralize(1, { one: 'order', other: 'orders' }) // '1 order'
 * @example pluralize(3, { one: 'অর্ডার', other: 'অর্ডার' }, { locale: 'bn' }) // '৩ অর্ডার'
 */
export function pluralize(count: number, forms: PluralForms, options: PluralizeOptions = {}): string {
  const locale = options.locale ?? 'en';
  const category = getPluralCategory(count, locale);
  const word = forms[category];
  if (options.includeCount === false) return word;
  const digits = resolveDigits(options.digits, locale);
  const number = digits === 'bn' ? toBanglaDigits(count) : String(count);
  return `${number} ${word}`;
}

/**
 * Attach a Bangla classifier to a count: "৩টি পণ্য", "৫ জন গ্রাহক".
 * `জন` is written with a space by convention; the others are joined.
 *
 * @example withClassifier(3, 'পণ্য')            // '৩টি পণ্য'
 * @example withClassifier(5, 'গ্রাহক', 'জন')    // '৫ জন গ্রাহক'
 */
export function withClassifier(
  count: number,
  noun: string,
  classifier: BanglaClassifier = 'টি',
  digits: Exclude<DigitStyle, 'auto'> = 'bn',
): string {
  if (!Number.isInteger(count) || count < 0) {
    throw new RangeError(`count must be a non-negative integer, received ${count}`);
  }
  const number = digits === 'bn' ? toBanglaDigits(count) : String(count);
  const joiner = classifier === 'জন' ? ' ' : '';
  return `${number}${joiner}${classifier} ${noun}`;
}
