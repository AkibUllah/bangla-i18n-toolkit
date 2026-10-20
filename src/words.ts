import type { Locale } from './types';

/** Indian numbering (lakh, crore) or western (million, billion). Only affects English. */
export type NumberingSystem = 'indian' | 'western';

export interface NumberToWordsOptions {
  /** Default: `en`. */
  locale?: Locale;
  /** Default: `indian`. Ignored for Bangla, which is always lakh/crore. */
  system?: NumberingSystem;
}

export interface AmountToWordsOptions extends NumberToWordsOptions {
  /** Append "only" / "মাত্র" as on cheques. Default: true. */
  suffix?: boolean;
}

/** Largest value supported: 99,99,99,99,99,999 (just under 10 lakh crore). */
export const MAX_WORDS_VALUE = 99_999_999_999_999;

const EN_ONES = [
  'zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten',
  'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen',
] as const;
const EN_TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'] as const;

/** Bangla has an irregular word for every number from 0 to 99. */
const BN_ONES = [
  'শূন্য', 'এক', 'দুই', 'তিন', 'চার', 'পাঁচ', 'ছয়', 'সাত', 'আট', 'নয়',
  'দশ', 'এগারো', 'বারো', 'তেরো', 'চৌদ্দ', 'পনেরো', 'ষোলো', 'সতেরো', 'আঠারো', 'উনিশ',
  'বিশ', 'একুশ', 'বাইশ', 'তেইশ', 'চব্বিশ', 'পঁচিশ', 'ছাব্বিশ', 'সাতাশ', 'আটাশ', 'ঊনত্রিশ',
  'ত্রিশ', 'একত্রিশ', 'বত্রিশ', 'তেত্রিশ', 'চৌত্রিশ', 'পঁয়ত্রিশ', 'ছত্রিশ', 'সাঁইত্রিশ', 'আটত্রিশ', 'ঊনচল্লিশ',
  'চল্লিশ', 'একচল্লিশ', 'বিয়াল্লিশ', 'তেতাল্লিশ', 'চুয়াল্লিশ', 'পঁয়তাল্লিশ', 'ছেচল্লিশ', 'সাতচল্লিশ', 'আটচল্লিশ', 'ঊনপঞ্চাশ',
  'পঞ্চাশ', 'একান্ন', 'বাহান্ন', 'তিপ্পান্ন', 'চুয়ান্ন', 'পঞ্চান্ন', 'ছাপ্পান্ন', 'সাতান্ন', 'আটান্ন', 'ঊনষাট',
  'ষাট', 'একষট্টি', 'বাষট্টি', 'তেষট্টি', 'চৌষট্টি', 'পঁয়ষট্টি', 'ছেষট্টি', 'সাতষট্টি', 'আটষট্টি', 'ঊনসত্তর',
  'সত্তর', 'একাত্তর', 'বাহাত্তর', 'তিয়াত্তর', 'চুয়াত্তর', 'পঁচাত্তর', 'ছিয়াত্তর', 'সাতাত্তর', 'আটাত্তর', 'ঊনআশি',
  'আশি', 'একাশি', 'বিরাশি', 'তিরাশি', 'চুরাশি', 'পঁচাশি', 'ছিয়াশি', 'সাতাশি', 'আটাশি', 'ঊননব্বই',
  'নব্বই', 'একানব্বই', 'বিরানব্বই', 'তিরানব্বই', 'চুরানব্বই', 'পঁচানব্বই', 'ছিয়ানব্বই', 'সাতানব্বই', 'আটানব্বই', 'নিরানব্বই',
] as const;

function assertSupported(n: number): void {
  if (!Number.isInteger(n)) throw new RangeError(`expected an integer, received ${n}`);
  if (Math.abs(n) > MAX_WORDS_VALUE) {
    throw new RangeError(`value exceeds supported range (|n| <= ${MAX_WORDS_VALUE})`);
  }
}

function enBelowHundred(n: number): string {
  if (n < 20) return EN_ONES[n] ?? '';
  const tens = EN_TENS[Math.floor(n / 10)] ?? '';
  const ones = n % 10;
  return ones === 0 ? tens : `${tens}-${EN_ONES[ones] ?? ''}`;
}

function enBelowThousand(n: number): string {
  const hundreds = Math.floor(n / 100);
  const rest = n % 100;
  const parts: string[] = [];
  if (hundreds > 0) parts.push(`${EN_ONES[hundreds] ?? ''} hundred`);
  if (rest > 0) parts.push(enBelowHundred(rest));
  return parts.join(' ');
}

function enIndian(n: number): string {
  if (n === 0) return 'zero';
  const parts: string[] = [];
  const crore = Math.floor(n / 1e7);
  const lakh = Math.floor((n % 1e7) / 1e5);
  const thousand = Math.floor((n % 1e5) / 1e3);
  const rest = n % 1e3;
  if (crore > 0) parts.push(`${enIndian(crore)} crore`);
  if (lakh > 0) parts.push(`${enBelowHundred(lakh)} lakh`);
  if (thousand > 0) parts.push(`${enBelowHundred(thousand)} thousand`);
  if (rest > 0) parts.push(enBelowThousand(rest));
  return parts.join(' ');
}

function enWestern(n: number): string {
  if (n === 0) return 'zero';
  const scales: Array<[number, string]> = [
    [1e12, 'trillion'],
    [1e9, 'billion'],
    [1e6, 'million'],
    [1e3, 'thousand'],
  ];
  const parts: string[] = [];
  let remaining = n;
  for (const [value, label] of scales) {
    const count = Math.floor(remaining / value);
    if (count > 0) {
      parts.push(`${enBelowThousand(count)} ${label}`);
      remaining %= value;
    }
  }
  if (remaining > 0) parts.push(enBelowThousand(remaining));
  return parts.join(' ');
}

function bnBelowThousand(n: number): string {
  const hundreds = Math.floor(n / 100);
  const rest = n % 100;
  const parts: string[] = [];
  if (hundreds > 0) parts.push(`${BN_ONES[hundreds] ?? ''}শত`);
  if (rest > 0) parts.push(BN_ONES[rest] ?? '');
  return parts.join(' ');
}

function bnWords(n: number): string {
  if (n === 0) return 'শূন্য';
  const parts: string[] = [];
  const crore = Math.floor(n / 1e7);
  const lakh = Math.floor((n % 1e7) / 1e5);
  const thousand = Math.floor((n % 1e5) / 1e3);
  const rest = n % 1e3;
  if (crore > 0) parts.push(`${bnWords(crore)} কোটি`);
  if (lakh > 0) parts.push(`${BN_ONES[lakh] ?? ''} লাখ`);
  if (thousand > 0) parts.push(`${BN_ONES[thousand] ?? ''} হাজার`);
  if (rest > 0) parts.push(bnBelowThousand(rest));
  return parts.join(' ');
}

/**
 * Spell out an integer in English or Bangla.
 *
 * @example numberToWords(1250)                       // 'one thousand two hundred fifty'
 * @example numberToWords(1250, { locale: 'bn' })     // 'এক হাজার দুইশত পঞ্চাশ'
 * @example numberToWords(12_50_000)                  // 'twelve lakh fifty thousand'
 * @example numberToWords(1_250_000, { system: 'western' }) // 'one million two hundred fifty thousand'
 */
export function numberToWords(n: number, options: NumberToWordsOptions = {}): string {
  assertSupported(n);
  const locale = options.locale ?? 'en';
  const negative = n < 0;
  const abs = Math.abs(n);
  let words: string;
  if (locale === 'bn') {
    words = bnWords(abs);
  } else {
    words = (options.system ?? 'indian') === 'indian' ? enIndian(abs) : enWestern(abs);
  }
  if (!negative) return words;
  return locale === 'bn' ? `ঋণাত্মক ${words}` : `minus ${words}`;
}

/**
 * Spell out a Taka amount the way it is printed on cheques and invoices.
 * Paisa are rounded to two decimals.
 *
 * @example amountToWords(1250.5)                   // 'one thousand two hundred fifty taka and fifty paisa only'
 * @example amountToWords(1250.5, { locale: 'bn' }) // 'এক হাজার দুইশত পঞ্চাশ টাকা পঞ্চাশ পয়সা মাত্র'
 */
export function amountToWords(amount: number, options: AmountToWordsOptions = {}): string {
  if (!Number.isFinite(amount)) throw new RangeError(`amount must be finite, received ${String(amount)}`);
  const locale = options.locale ?? 'en';
  const suffix = options.suffix ?? true;
  const negative = amount < 0;
  const paisaTotal = Math.round(Math.abs(amount) * 100);
  const taka = Math.floor(paisaTotal / 100);
  const paisa = paisaTotal % 100;
  const wordOpts: NumberToWordsOptions = { locale, ...(options.system ? { system: options.system } : {}) };

  const parts: string[] = [];
  if (locale === 'bn') {
    if (taka > 0 || paisa === 0) parts.push(`${numberToWords(taka, wordOpts)} টাকা`);
    if (paisa > 0) parts.push(`${numberToWords(paisa, wordOpts)} পয়সা`);
    if (suffix) parts.push('মাত্র');
    const text = parts.join(' ');
    return negative ? `ঋণাত্মক ${text}` : text;
  }

  if (taka > 0 || paisa === 0) parts.push(`${numberToWords(taka, wordOpts)} taka`);
  if (paisa > 0) parts.push(`${taka > 0 ? 'and ' : ''}${numberToWords(paisa, wordOpts)} paisa`);
  if (suffix) parts.push('only');
  const text = parts.join(' ');
  return negative ? `minus ${text}` : text;
}
