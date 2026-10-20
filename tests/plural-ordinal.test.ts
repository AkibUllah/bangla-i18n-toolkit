import { describe, expect, it } from 'vitest';
import { getPluralCategory, pluralize, withClassifier } from '../src/plural';
import { banglaOrdinalSuffix, englishOrdinalSuffix, ordinal } from '../src/ordinal';

describe('plural', () => {
  it('follows CLDR rules for English and Bangla', () => {
    expect(getPluralCategory(1)).toBe('one');
    expect(getPluralCategory(0)).toBe('other');
    expect(getPluralCategory(2)).toBe('other');
    expect(getPluralCategory(0, 'bn')).toBe('one');
    expect(getPluralCategory(0.5, 'bn')).toBe('one');
    expect(getPluralCategory(1, 'bn')).toBe('one');
    expect(getPluralCategory(2, 'bn')).toBe('other');
  });

  it('pluralizes with the count', () => {
    const forms = { one: 'order', other: 'orders' };
    expect(pluralize(1, forms)).toBe('1 order');
    expect(pluralize(3, forms)).toBe('3 orders');
    expect(pluralize(3, forms, { includeCount: false })).toBe('orders');
    expect(pluralize(3, { one: 'অর্ডার', other: 'অর্ডার' }, { locale: 'bn' })).toBe('৩ অর্ডার');
  });

  it('attaches Bangla classifiers', () => {
    expect(withClassifier(3, 'পণ্য')).toBe('৩টি পণ্য');
    expect(withClassifier(5, 'গ্রাহক', 'জন')).toBe('৫ জন গ্রাহক');
    expect(withClassifier(2, 'বই', 'খানা', 'en')).toBe('2খানা বই');
    expect(() => withClassifier(-1, 'পণ্য')).toThrow(RangeError);
  });
});

describe('ordinal', () => {
  it('computes English suffixes including the teens exception', () => {
    expect(englishOrdinalSuffix(1)).toBe('st');
    expect(englishOrdinalSuffix(2)).toBe('nd');
    expect(englishOrdinalSuffix(3)).toBe('rd');
    expect(englishOrdinalSuffix(4)).toBe('th');
    expect(englishOrdinalSuffix(11)).toBe('th');
    expect(englishOrdinalSuffix(12)).toBe('th');
    expect(englishOrdinalSuffix(13)).toBe('th');
    expect(englishOrdinalSuffix(21)).toBe('st');
    expect(englishOrdinalSuffix(112)).toBe('th');
  });

  it('computes Bangla suffixes', () => {
    expect(banglaOrdinalSuffix(1)).toBe('ম');
    expect(banglaOrdinalSuffix(2)).toBe('য়');
    expect(banglaOrdinalSuffix(4)).toBe('র্থ');
    expect(banglaOrdinalSuffix(6)).toBe('ষ্ঠ');
    expect(banglaOrdinalSuffix(11)).toBe('তম');
  });

  it('formats ordinals in both locales and styles', () => {
    expect(ordinal(1)).toBe('1st');
    expect(ordinal(22)).toBe('22nd');
    expect(ordinal(3, { style: 'word' })).toBe('third');
    expect(ordinal(22, { style: 'word' })).toBe('22nd');
    expect(ordinal(2, { locale: 'bn' })).toBe('২য়');
    expect(ordinal(3, { locale: 'bn', style: 'word' })).toBe('তৃতীয়');
    expect(ordinal(12, { locale: 'bn' })).toBe('১২তম');
    expect(ordinal(12, { locale: 'bn', digits: 'en' })).toBe('12তম');
  });

  it('rejects negative or fractional input', () => {
    expect(() => ordinal(-1)).toThrow(RangeError);
    expect(() => ordinal(1.5)).toThrow(RangeError);
  });
});
