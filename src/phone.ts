import { toEnglishDigits } from './numerals';

export interface BDOperator {
  /** Three-digit local prefix, e.g. `017`. */
  prefix: string;
  /** Brand name as marketed in Bangladesh. */
  name: string;
  /** Short machine-friendly code. */
  code: 'GP' | 'BL' | 'TT' | 'AIRTEL' | 'ROBI';
}

/** Bangladesh mobile operator prefixes (BTRC allocation). */
export const BD_OPERATORS: Readonly<Record<string, BDOperator>> = Object.freeze({
  '013': { prefix: '013', name: 'Grameenphone', code: 'GP' },
  '014': { prefix: '014', name: 'Banglalink', code: 'BL' },
  '015': { prefix: '015', name: 'Teletalk', code: 'TT' },
  '016': { prefix: '016', name: 'Airtel', code: 'AIRTEL' },
  '017': { prefix: '017', name: 'Grameenphone', code: 'GP' },
  '018': { prefix: '018', name: 'Robi', code: 'ROBI' },
  '019': { prefix: '019', name: 'Banglalink', code: 'BL' },
});

export type PhoneStyle = 'e164' | 'international' | 'local' | 'compact';

const LOCAL_RE = /^01[3-9]\d{8}$/;

/**
 * Normalise anything a user might type into the 11-digit local form
 * (`01XXXXXXXXX`) or return `null` if it is not a Bangladeshi mobile number.
 *
 * Accepts Bangla digits, spaces, hyphens, dots, parentheses, a leading `+`,
 * the `00` international prefix and the `880` country code.
 */
export function normalizeBDPhone(input: string): string | null {
  if (typeof input !== 'string') return null;
  let digits = toEnglishDigits(input).replace(/[\s.()-]/g, '');
  if (digits.startsWith('+')) digits = digits.slice(1);
  else if (digits.startsWith('00')) digits = digits.slice(2);
  if (!/^\d+$/.test(digits)) return null;

  if (digits.startsWith('880')) {
    digits = `0${digits.slice(3)}`;
  } else if (digits.length === 10 && digits.startsWith('1')) {
    // "1712345678" — local number with the leading zero dropped.
    digits = `0${digits}`;
  }
  return LOCAL_RE.test(digits) ? digits : null;
}

/** True when the input is a valid Bangladeshi mobile number in any accepted notation. */
export function isValidBDPhone(input: string): boolean {
  return normalizeBDPhone(input) !== null;
}

/** Identify the operator from the prefix, or `null` if the number is invalid. */
export function getBDOperator(input: string): BDOperator | null {
  const local = normalizeBDPhone(input);
  if (local === null) return null;
  return BD_OPERATORS[local.slice(0, 3)] ?? null;
}

/**
 * Format a Bangladeshi mobile number.
 *
 * - `e164`:          +8801712345678
 * - `international`: +880 1712-345678
 * - `local`:         01712-345678
 * - `compact`:       01712345678
 *
 * @throws RangeError when the input is not a valid BD mobile number.
 */
export function formatBDPhone(input: string, style: PhoneStyle = 'international'): string {
  const local = normalizeBDPhone(input);
  if (local === null) throw new RangeError(`Not a valid Bangladeshi mobile number: ${input}`);
  const subscriber = local.slice(1); // 1712345678
  switch (style) {
    case 'e164':
      return `+880${subscriber}`;
    case 'international':
      return `+880 ${subscriber.slice(0, 4)}-${subscriber.slice(4)}`;
    case 'local':
      return `${local.slice(0, 5)}-${local.slice(5)}`;
    case 'compact':
      return local;
  }
}

/**
 * Mask the middle of a number for receipts and KYC screens: `017****5678`.
 * Invalid numbers are returned unchanged so the caller can still display them.
 */
export function maskBDPhone(input: string, visibleEnd = 4): string {
  const local = normalizeBDPhone(input);
  if (local === null) return input;
  const end = Math.min(Math.max(visibleEnd, 0), 8);
  const prefix = local.slice(0, 3);
  const tail = end > 0 ? local.slice(-end) : '';
  return `${prefix}${'*'.repeat(local.length - 3 - tail.length)}${tail}`;
}
