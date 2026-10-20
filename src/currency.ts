import type { DigitStyle, Locale } from './types';
import { resolveDigits } from './types';
import { toBanglaDigits } from './numerals';

/** How thousands are grouped. Indian grouping is the convention in Bangladesh: 12,34,567. */
export type GroupingStyle = 'indian' | 'western' | 'none';

export interface FormatNumberOptions {
  /** Digit set for the output. `auto` follows `locale`. Default: `en`. */
  digits?: DigitStyle;
  /** Locale used to resolve `digits: 'auto'`. Default: `en`. */
  locale?: Locale;
  /** Grouping style. Default: `indian`. */
  grouping?: GroupingStyle;
  /** Minimum fraction digits. Default: 0. */
  minimumFractionDigits?: number;
  /** Maximum fraction digits. Default: 2. */
  maximumFractionDigits?: number;
}

export interface FormatBDTOptions extends FormatNumberOptions {
  /**
   * `sign`: ৳1,000 · `code`: BDT 1,000 · `word`: 1,000 টাকা / 1,000 Tk · `none`: 1,000.
   * Default: `sign`.
   */
  symbol?: 'sign' | 'code' | 'word' | 'none';
  /** Space between symbol and amount. Default: false for `sign`, true otherwise. */
  space?: boolean;
}

export type CompactUnit = 'crore' | 'lakh' | 'thousand' | 'none';

export interface CompactParts {
  value: number;
  unit: CompactUnit;
}

export interface FormatCompactOptions {
  locale?: Locale;
  digits?: DigitStyle;
  /** Significant decimals in the compact value. Default: 2. */
  precision?: number;
  /** Include the ৳ sign. Default: true. */
  symbol?: boolean;
}

const UNIT_LABELS: Record<Locale, Record<CompactUnit, string>> = {
  en: { crore: 'crore', lakh: 'lakh', thousand: 'thousand', none: '' },
  bn: { crore: 'কোটি', lakh: 'লাখ', thousand: 'হাজার', none: '' },
};

function assertFinite(value: number, name: string): void {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new RangeError(`${name} must be a finite number, received ${String(value)}`);
  }
}

/** Groups an integer digit string: indian => 12,34,567 ; western => 1,234,567. */
export function groupDigits(integer: string, grouping: GroupingStyle = 'indian'): string {
  if (grouping === 'none' || integer.length <= 3) return integer;
  const last3 = integer.slice(-3);
  const head = integer.slice(0, -3);
  if (grouping === 'western') {
    return head.replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ',' + last3;
  }
  return head.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + last3;
}

/**
 * Split a number into sign, integer digits and fraction digits using
 * decimal-string arithmetic (no float rounding surprises in the output).
 */
function toParts(value: number, minFrac: number, maxFrac: number): { negative: boolean; integer: string; fraction: string } {
  if (minFrac < 0 || maxFrac < minFrac || maxFrac > 20) {
    throw new RangeError('fraction digit options are out of range');
  }
  const negative = value < 0 || Object.is(value, -0);
  const fixed = Math.abs(value).toFixed(maxFrac);
  const [integerRaw, fractionRaw = ''] = fixed.split('.');
  const integer = integerRaw ?? '0';
  let fraction = fractionRaw;
  while (fraction.length > minFrac && fraction.endsWith('0')) {
    fraction = fraction.slice(0, -1);
  }
  const isZero = /^0*$/.test(integer) && /^0*$/.test(fraction);
  return { negative: negative && !isZero, integer, fraction };
}

/**
 * Format a plain number with Indian (lakh/crore) grouping by default.
 *
 * @example formatNumber(1234567.891) // '12,34,567.89'
 * @example formatNumber(1234567, { digits: 'bn' }) // '১২,৩৪,৫৬৭'
 */
export function formatNumber(value: number, options: FormatNumberOptions = {}): string {
  assertFinite(value, 'value');
  const { grouping = 'indian', minimumFractionDigits = 0, maximumFractionDigits = 2 } = options;
  const { negative, integer, fraction } = toParts(value, minimumFractionDigits, maximumFractionDigits);
  let out = groupDigits(integer, grouping);
  if (fraction.length > 0) out += `.${fraction}`;
  if (negative) out = `-${out}`;
  const digits = resolveDigits(options.digits, options.locale ?? 'en');
  return digits === 'bn' ? toBanglaDigits(out) : out;
}

/**
 * Format an amount in Bangladeshi Taka.
 *
 * @example formatBDT(123456.78) // '৳1,23,456.78'
 * @example formatBDT(1500, { locale: 'bn', digits: 'auto' }) // '৳১,৫০০'
 * @example formatBDT(1500, { symbol: 'code' }) // 'BDT 1,500'
 * @example formatBDT(1500, { symbol: 'word', locale: 'bn' }) // '১,৫০০ টাকা'
 */
export function formatBDT(amount: number, options: FormatBDTOptions = {}): string {
  const locale = options.locale ?? 'en';
  const symbol = options.symbol ?? 'sign';
  const digits = resolveDigits(options.digits, locale);
  const { negative, integer, fraction } = toParts(
    amount,
    options.minimumFractionDigits ?? 0,
    options.maximumFractionDigits ?? 2,
  );
  // Formatting the absolute value and applying the sign ourselves keeps
  // "-৳500" rather than "৳-500".
  const absolute = formatNumber(Number(`${integer}.${fraction || '0'}`), {
    grouping: options.grouping ?? 'indian',
    minimumFractionDigits: fraction.length,
    maximumFractionDigits: Math.max(fraction.length, options.minimumFractionDigits ?? 0),
    digits,
  });

  let body: string;
  const space = options.space ?? symbol !== 'sign';
  const gap = space ? ' ' : '';
  switch (symbol) {
    case 'sign':
      body = `৳${gap}${absolute}`;
      break;
    case 'code':
      body = `BDT${gap}${absolute}`;
      break;
    case 'word':
      body = locale === 'bn' ? `${absolute}${gap}টাকা` : `${absolute}${gap}Tk`;
      break;
    case 'none':
      body = absolute;
      break;
  }
  return negative ? `-${body}` : body;
}

/**
 * Format an integer amount of paisa (minor units) as Taka without ever
 * going through floating point. Accepts `number` or `bigint`.
 *
 * @example formatBDTFromPaisa(12345678) // '৳1,23,456.78'
 * @example formatBDTFromPaisa(-5000n)   // '-৳50.00'
 */
export function formatBDTFromPaisa(
  paisa: number | bigint,
  options: Omit<FormatBDTOptions, 'minimumFractionDigits' | 'maximumFractionDigits'> = {},
): string {
  if (typeof paisa === 'number' && !Number.isInteger(paisa)) {
    throw new RangeError('paisa must be an integer amount of minor units');
  }
  const big = BigInt(paisa);
  const negative = big < 0n;
  const abs = negative ? -big : big;
  const integer = (abs / 100n).toString();
  const fraction = (abs % 100n).toString().padStart(2, '0');
  const locale = options.locale ?? 'en';
  const digits = resolveDigits(options.digits, locale);
  let absolute = `${groupDigits(integer, options.grouping ?? 'indian')}.${fraction}`;
  if (digits === 'bn') absolute = toBanglaDigits(absolute);

  const symbol = options.symbol ?? 'sign';
  const gap = (options.space ?? symbol !== 'sign') ? ' ' : '';
  let body: string;
  switch (symbol) {
    case 'sign':
      body = `৳${gap}${absolute}`;
      break;
    case 'code':
      body = `BDT${gap}${absolute}`;
      break;
    case 'word':
      body = locale === 'bn' ? `${absolute}${gap}টাকা` : `${absolute}${gap}Tk`;
      break;
    case 'none':
      body = absolute;
      break;
  }
  return negative ? `-${body}` : body;
}

/**
 * Reduce a number to the largest South Asian unit that keeps it >= 1.
 *
 * @example toCompactParts(12_500_000) // { value: 1.25, unit: 'crore' }
 * @example toCompactParts(250_000)    // { value: 2.5, unit: 'lakh' }
 */
export function toCompactParts(value: number): CompactParts {
  assertFinite(value, 'value');
  const abs = Math.abs(value);
  if (abs >= 1e7) return { value: value / 1e7, unit: 'crore' };
  if (abs >= 1e5) return { value: value / 1e5, unit: 'lakh' };
  if (abs >= 1e3) return { value: value / 1e3, unit: 'thousand' };
  return { value, unit: 'none' };
}

/**
 * Short, dashboard-friendly amounts: "৳1.25 crore", "৳২.৫ লাখ".
 *
 * @example formatCompactBDT(12_500_000) // '৳1.25 crore'
 * @example formatCompactBDT(250_000, { locale: 'bn' }) // '৳২.৫ লাখ'
 */
export function formatCompactBDT(amount: number, options: FormatCompactOptions = {}): string {
  const locale = options.locale ?? 'en';
  const precision = options.precision ?? 2;
  const { value, unit } = toCompactParts(amount);
  const number = formatNumber(value, {
    grouping: 'indian',
    maximumFractionDigits: precision,
    digits: resolveDigits(options.digits, locale),
  });
  const label = UNIT_LABELS[locale][unit];
  const sign = options.symbol === false ? '' : '৳';
  const negative = number.startsWith('-');
  const magnitude = negative ? number.slice(1) : number;
  const body = label ? `${sign}${magnitude} ${label}` : `${sign}${magnitude}`;
  return negative ? `-${body}` : body;
}
