import { describe, expect, it } from 'vitest';
import * as api from '../src/index';

describe('public API surface', () => {
  it('exports every documented function', () => {
    const expected = [
      'toBanglaDigits', 'toEnglishDigits', 'parseLocalizedNumber',
      'formatNumber', 'formatBDT', 'formatBDTFromPaisa', 'formatCompactBDT',
      'formatDate', 'getMonthName', 'getWeekdayName', 'getBanglaDayPeriod',
      'formatRelativeTime', 'getRelativeTimeParts',
      'pluralize', 'getPluralCategory', 'withClassifier',
      'ordinal', 'numberToWords', 'amountToWords',
      'normalizeBDPhone', 'isValidBDPhone', 'getBDOperator', 'formatBDPhone', 'maskBDPhone',
      'normalizeNID', 'getNIDFormat', 'isValidNID', 'toNID17', 'getNIDBirthYear', 'maskNID',
    ] as const;
    for (const name of expected) {
      expect(typeof api[name], name).toBe('function');
    }
  });

  it('composes for a typical bilingual receipt line', () => {
    const date = new Date(2026, 2, 26, 15, 5);
    const line = `${api.formatDate(date, 'D MMMM YYYY, h:mm A', { locale: 'bn' })} · ${api.formatBDT(1250.5, { locale: 'bn' })} · ${api.maskBDPhone('01712345678')}`;
    expect(line).toBe('২৬ মার্চ ২০২৬, ৩:০৫ বিকাল · ৳১,২৫০.৫ · 017****5678');
  });
});
