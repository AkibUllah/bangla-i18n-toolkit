export type { Locale, DigitStyle } from './types';
export { resolveDigits } from './types';

export {
  BANGLA_DIGITS,
  isBanglaDigit,
  isNumeric,
  toBanglaDigits,
  toEnglishDigits,
  parseLocalizedNumber,
} from './numerals';

export type {
  GroupingStyle,
  FormatNumberOptions,
  FormatBDTOptions,
  CompactUnit,
  CompactParts,
  FormatCompactOptions,
} from './currency';
export {
  groupDigits,
  formatNumber,
  formatBDT,
  formatBDTFromPaisa,
  toCompactParts,
  formatCompactBDT,
} from './currency';

export type { BanglaDayPeriod, FormatDateOptions, DateInput } from './date';
export {
  MONTHS,
  MONTHS_SHORT,
  WEEKDAYS,
  WEEKDAYS_SHORT,
  getMonthName,
  getWeekdayName,
  getBanglaDayPeriod,
  formatDate,
} from './date';

export type { RelativeUnit, RelativeTimeOptions, RelativeTimeParts } from './relative-time';
export { getRelativeTimeParts, formatRelativeTime } from './relative-time';

export type { PluralCategory, PluralForms, PluralizeOptions, BanglaClassifier } from './plural';
export { getPluralCategory, pluralize, withClassifier } from './plural';

export type { OrdinalOptions } from './ordinal';
export { ordinal, englishOrdinalSuffix, banglaOrdinalSuffix } from './ordinal';

export type { NumberingSystem, NumberToWordsOptions, AmountToWordsOptions } from './words';
export { MAX_WORDS_VALUE, numberToWords, amountToWords } from './words';

export type { BDOperator, PhoneStyle } from './phone';
export {
  BD_OPERATORS,
  normalizeBDPhone,
  isValidBDPhone,
  getBDOperator,
  formatBDPhone,
  maskBDPhone,
} from './phone';

export type { NIDFormat, NIDValidationOptions } from './nid';
export { normalizeNID, getNIDFormat, isValidNID, toNID17, getNIDBirthYear, maskNID } from './nid';
