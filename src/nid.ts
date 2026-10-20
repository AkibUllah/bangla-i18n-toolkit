import { toEnglishDigits } from './numerals';

/**
 * Bangladesh National ID numbers exist in three lengths:
 * - `legacy-13`: 13 digits issued 2008-2016 (no birth year).
 * - `legacy-17`: the 13-digit number prefixed with the 4-digit birth year.
 * - `smart-10`:  10 digits printed on Smart NID cards since 2016.
 */
export type NIDFormat = 'legacy-13' | 'legacy-17' | 'smart-10';

export interface NIDValidationOptions {
  /** Restrict to specific formats. Default: all three. */
  allowedFormats?: readonly NIDFormat[];
  /** Used to bound the birth year embedded in 17-digit numbers. Default: current year. */
  currentYear?: number;
}

const EARLIEST_BIRTH_YEAR = 1900;

/** Strip whitespace/hyphens and convert Bangla digits so the result is ASCII digits only. */
export function normalizeNID(input: string): string {
  return toEnglishDigits(input).replace(/[\s-]/g, '');
}

/** Detect the NID format from length, or `null` if it cannot be one. */
export function getNIDFormat(input: string): NIDFormat | null {
  const digits = normalizeNID(input);
  if (!/^\d+$/.test(digits)) return null;
  switch (digits.length) {
    case 10: return 'smart-10';
    case 13: return 'legacy-13';
    case 17: return 'legacy-17';
    default: return null;
  }
}

/**
 * Structural validation of an NID number. This checks shape only; the
 * Election Commission does not publish a check-digit algorithm, so real
 * verification must go through their verification service.
 *
 * @example isValidNID('1234567890')        // true (smart card)
 * @example isValidNID('19901234567890123') // true (17-digit, born 1990)
 * @example isValidNID('৯৯৯১২৩৪৫৬৭৮৯০১২৩')  // false (year 9991 is impossible)
 */
export function isValidNID(input: string, options: NIDValidationOptions = {}): boolean {
  const format = getNIDFormat(input);
  if (format === null) return false;
  const allowed = options.allowedFormats ?? ['legacy-13', 'legacy-17', 'smart-10'];
  if (!allowed.includes(format)) return false;

  const digits = normalizeNID(input);
  if (/^0+$/.test(digits)) return false;

  if (format === 'legacy-17') {
    const year = Number(digits.slice(0, 4));
    const currentYear = options.currentYear ?? new Date().getFullYear();
    if (year < EARLIEST_BIRTH_YEAR || year > currentYear) return false;
  }
  return true;
}

/**
 * Convert a 13-digit legacy NID into its 17-digit form by prefixing the
 * holder's birth year, which is how banks and MFS providers store it.
 *
 * @throws RangeError when the input is not a valid 13-digit NID or the year is out of range.
 */
export function toNID17(nid13: string, birthYear: number): string {
  const digits = normalizeNID(nid13);
  if (getNIDFormat(digits) !== 'legacy-13') {
    throw new RangeError('toNID17 expects a 13-digit legacy NID');
  }
  if (!Number.isInteger(birthYear) || birthYear < EARLIEST_BIRTH_YEAR || birthYear > new Date().getFullYear()) {
    throw new RangeError(`birthYear out of range: ${birthYear}`);
  }
  return `${birthYear}${digits}`;
}

/** Extract the birth year from a 17-digit NID, or `null` for other formats. */
export function getNIDBirthYear(input: string): number | null {
  if (getNIDFormat(input) !== 'legacy-17') return null;
  return Number(normalizeNID(input).slice(0, 4));
}

/**
 * Mask all but the last `visibleEnd` digits: `*********0123`.
 * Inputs that are not NID-shaped are returned unchanged.
 */
export function maskNID(input: string, visibleEnd = 4): string {
  const digits = normalizeNID(input);
  if (getNIDFormat(digits) === null) return input;
  const end = Math.min(Math.max(visibleEnd, 0), digits.length);
  return `${'*'.repeat(digits.length - end)}${digits.slice(digits.length - end)}`;
}
