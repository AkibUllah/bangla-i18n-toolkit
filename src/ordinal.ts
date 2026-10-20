import type { DigitStyle, Locale } from './types';
import { resolveDigits } from './types';
import { toBanglaDigits } from './numerals';

export interface OrdinalOptions {
  /** Default: `en`. */
  locale?: Locale;
  /** Default: `auto`. */
  digits?: DigitStyle;
  /** `suffix`: 1st / ১ম · `word`: first / প্রথম. Default: `suffix`. */
  style?: 'suffix' | 'word';
}

const EN_WORDS = [
  'zeroth', 'first', 'second', 'third', 'fourth', 'fifth',
  'sixth', 'seventh', 'eighth', 'ninth', 'tenth',
] as const;

const BN_WORDS = [
  'শূন্যতম', 'প্রথম', 'দ্বিতীয়', 'তৃতীয়', 'চতুর্থ', 'পঞ্চম',
  'ষষ্ঠ', 'সপ্তম', 'অষ্টম', 'নবম', 'দশম',
] as const;

/** Bangla short ordinal suffixes for 1-10; everything above takes "তম". */
const BN_SUFFIX = ['', 'ম', 'য়', 'য়', 'র্থ', 'ম', 'ষ্ঠ', 'ম', 'ম', 'ম', 'ম'] as const;

/** English ordinal suffix: st / nd / rd / th, with the 11-13 exception. */
export function englishOrdinalSuffix(n: number): 'st' | 'nd' | 'rd' | 'th' {
  const mod100 = Math.abs(n) % 100;
  if (mod100 >= 11 && mod100 <= 13) return 'th';
  switch (Math.abs(n) % 10) {
    case 1: return 'st';
    case 2: return 'nd';
    case 3: return 'rd';
    default: return 'th';
  }
}

/** Bangla ordinal suffix: ম / য় / র্থ / ষ্ঠ for 1-10, "তম" afterwards. */
export function banglaOrdinalSuffix(n: number): string {
  const abs = Math.abs(n);
  if (abs >= 1 && abs <= 10) return BN_SUFFIX[abs] ?? 'তম';
  return 'তম';
}

/**
 * Ordinal number in English or Bangla.
 *
 * @example ordinal(1)                          // '1st'
 * @example ordinal(22, { style: 'word' })      // '22nd' (word form only exists for 1-10)
 * @example ordinal(2, { locale: 'bn' })        // '২য়'
 * @example ordinal(3, { locale: 'bn', style: 'word' }) // 'তৃতীয়'
 * @example ordinal(12, { locale: 'bn' })       // '১২তম'
 */
export function ordinal(n: number, options: OrdinalOptions = {}): string {
  if (!Number.isInteger(n) || n < 0) {
    throw new RangeError(`ordinal expects a non-negative integer, received ${n}`);
  }
  const locale = options.locale ?? 'en';
  const style = options.style ?? 'suffix';
  const digits = resolveDigits(options.digits, locale);

  if (style === 'word' && n <= 10) {
    return locale === 'bn' ? BN_WORDS[n] ?? '' : EN_WORDS[n] ?? '';
  }

  const number = digits === 'bn' ? toBanglaDigits(n) : String(n);
  return locale === 'bn' ? `${number}${banglaOrdinalSuffix(n)}` : `${number}${englishOrdinalSuffix(n)}`;
}
