/** Supported locales. `en` is English, `bn` is Bangla (Bengali). */
export type Locale = 'en' | 'bn';

/** Which digit set to render numbers with. `auto` follows the locale. */
export type DigitStyle = 'en' | 'bn' | 'auto';

/** Resolves the `auto` digit style against a locale. */
export function resolveDigits(digits: DigitStyle | undefined, locale: Locale): 'en' | 'bn' {
  if (digits === undefined || digits === 'auto') return locale;
  return digits;
}
