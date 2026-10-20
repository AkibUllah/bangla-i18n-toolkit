import { describe, expect, it } from 'vitest';
import { amountToWords, MAX_WORDS_VALUE, numberToWords } from '../src/words';

describe('numberToWords (en)', () => {
  it('spells small numbers', () => {
    expect(numberToWords(0)).toBe('zero');
    expect(numberToWords(7)).toBe('seven');
    expect(numberToWords(19)).toBe('nineteen');
    expect(numberToWords(42)).toBe('forty-two');
    expect(numberToWords(100)).toBe('one hundred');
    expect(numberToWords(999)).toBe('nine hundred ninety-nine');
  });

  it('uses lakh and crore by default', () => {
    expect(numberToWords(1250)).toBe('one thousand two hundred fifty');
    expect(numberToWords(1_25_000)).toBe('one lakh twenty-five thousand');
    expect(numberToWords(12_50_000)).toBe('twelve lakh fifty thousand');
    expect(numberToWords(1_00_00_000)).toBe('one crore');
    expect(numberToWords(2_34_56_789)).toBe('two crore thirty-four lakh fifty-six thousand seven hundred eighty-nine');
    expect(numberToWords(150_00_00_000)).toBe('one hundred fifty crore');
  });

  it('supports the western system', () => {
    expect(numberToWords(1_250_000, { system: 'western' })).toBe('one million two hundred fifty thousand');
    expect(numberToWords(3_000_000_001, { system: 'western' })).toBe('three billion one');
  });

  it('handles negatives and range', () => {
    expect(numberToWords(-15)).toBe('minus fifteen');
    expect(() => numberToWords(1.5)).toThrow(RangeError);
    expect(() => numberToWords(MAX_WORDS_VALUE + 1)).toThrow(RangeError);
  });
});

describe('numberToWords (bn)', () => {
  it('spells irregular numbers below 100', () => {
    expect(numberToWords(0, { locale: 'bn' })).toBe('শূন্য');
    expect(numberToWords(1, { locale: 'bn' })).toBe('এক');
    expect(numberToWords(17, { locale: 'bn' })).toBe('সতেরো');
    expect(numberToWords(29, { locale: 'bn' })).toBe('ঊনত্রিশ');
    expect(numberToWords(52, { locale: 'bn' })).toBe('বাহান্ন');
    expect(numberToWords(71, { locale: 'bn' })).toBe('একাত্তর');
    expect(numberToWords(99, { locale: 'bn' })).toBe('নিরানব্বই');
  });

  it('spells hundreds, thousands, lakh and crore', () => {
    expect(numberToWords(250, { locale: 'bn' })).toBe('দুইশত পঞ্চাশ');
    expect(numberToWords(1250, { locale: 'bn' })).toBe('এক হাজার দুইশত পঞ্চাশ');
    expect(numberToWords(1_25_000, { locale: 'bn' })).toBe('এক লাখ পঁচিশ হাজার');
    expect(numberToWords(1_00_00_000, { locale: 'bn' })).toBe('এক কোটি');
    expect(numberToWords(2_34_56_789, { locale: 'bn' })).toBe('দুই কোটি চৌত্রিশ লাখ ছাপ্পান্ন হাজার সাতশত ঊননব্বই');
    expect(numberToWords(-5, { locale: 'bn' })).toBe('ঋণাত্মক পাঁচ');
  });
});

describe('amountToWords', () => {
  it('writes cheque-style amounts in English', () => {
    expect(amountToWords(1250.5)).toBe('one thousand two hundred fifty taka and fifty paisa only');
    expect(amountToWords(1250)).toBe('one thousand two hundred fifty taka only');
    expect(amountToWords(0.75)).toBe('seventy-five paisa only');
    expect(amountToWords(0)).toBe('zero taka only');
    expect(amountToWords(99.999)).toBe('one hundred taka only');
    expect(amountToWords(1250, { suffix: false })).toBe('one thousand two hundred fifty taka');
  });

  it('writes cheque-style amounts in Bangla', () => {
    expect(amountToWords(1250.5, { locale: 'bn' })).toBe('এক হাজার দুইশত পঞ্চাশ টাকা পঞ্চাশ পয়সা মাত্র');
    expect(amountToWords(500, { locale: 'bn' })).toBe('পাঁচশত টাকা মাত্র');
    expect(amountToWords(-20, { locale: 'bn' })).toBe('ঋণাত্মক বিশ টাকা মাত্র');
  });
});
