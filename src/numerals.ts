/**
 * Bangla <-> ASCII numeral conversion.
 *
 * Bangla digits occupy U+09E6..U+09EF. Conversions are pure character maps,
 * so any other characters (separators, currency signs, letters) pass through
 * untouched.
 */

export const BANGLA_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'] as const;

const BANGLA_ZERO = 0x09e6;
const BANGLA_NINE = 0x09ef;
const ASCII_ZERO = 0x30;

/** True if `char` is a single Bangla digit (০-৯). */
export function isBanglaDigit(char: string): boolean {
  if (char.length !== 1) return false;
  const code = char.charCodeAt(0);
  return code >= BANGLA_ZERO && code <= BANGLA_NINE;
}

/** True if every character in `value` is a Bangla or ASCII digit. */
export function isNumeric(value: string): boolean {
  return value.length > 0 && /^[0-9০-৯]+$/.test(value);
}

/**
 * Convert every ASCII digit in a string or number into a Bangla digit.
 *
 * @example toBanglaDigits(2024) // '২০২৪'
 * @example toBanglaDigits('Order #1023') // 'Order #১০২৩'
 */
export function toBanglaDigits(value: string | number): string {
  const text = typeof value === 'number' ? String(value) : value;
  let out = '';
  for (const ch of text) {
    const code = ch.charCodeAt(0);
    if (code >= ASCII_ZERO && code <= ASCII_ZERO + 9) {
      out += String.fromCharCode(BANGLA_ZERO + (code - ASCII_ZERO));
    } else {
      out += ch;
    }
  }
  return out;
}

/**
 * Convert every Bangla digit in a string into an ASCII digit.
 *
 * @example toEnglishDigits('৳১,২৩,৪৫৬') // '৳1,23,456'
 */
export function toEnglishDigits(value: string): string {
  let out = '';
  for (const ch of value) {
    const code = ch.charCodeAt(0);
    if (code >= BANGLA_ZERO && code <= BANGLA_NINE) {
      out += String.fromCharCode(ASCII_ZERO + (code - BANGLA_ZERO));
    } else {
      out += ch;
    }
  }
  return out;
}

/**
 * Parse a human-entered number that may contain Bangla digits, grouping
 * commas, whitespace, a leading sign and the ৳ / Tk / BDT currency markers.
 * Returns `NaN` when nothing numeric remains.
 *
 * @example parseLocalizedNumber('৳ ১,২৩,৪৫৬.৭৮') // 123456.78
 * @example parseLocalizedNumber('-1,250') // -1250
 */
export function parseLocalizedNumber(value: string): number {
  const cleaned = toEnglishDigits(value)
    .replace(/৳|Tk\.?|BDT|টাকা/gi, '')
    .replace(/[,\s]/g, '')
    .trim();
  if (!/^[-+]?(\d+(\.\d*)?|\.\d+)$/.test(cleaned)) return NaN;
  return Number(cleaned);
}
