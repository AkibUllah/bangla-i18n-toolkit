// Playground wiring. `./lib/index.js` is the library's own ESM build, copied in by scripts/build-site.mjs.
import * as bi from './lib/index.js';

let locale = 'en';

const $ = (id) => document.getElementById(id);
const demos = new Map();

/** Register a demo card: `compute(locale)` returns [[label, () => value], ...]. */
function demo(name, compute) {
  const card = document.querySelector(`[data-demo="${name}"]`);
  const body = card.querySelector('tbody');
  const render = () => {
    body.replaceChildren();
    for (const [label, fn] of compute(locale)) {
      const tr = document.createElement('tr');
      const k = document.createElement('td');
      const v = document.createElement('td');
      k.textContent = label;
      try {
        const out = fn();
        v.textContent = typeof out === 'string' || typeof out === 'number' ? String(out) : JSON.stringify(out);
      } catch (err) {
        v.textContent = err instanceof Error ? err.message : String(err);
        v.className = 'err';
      }
      tr.append(k, v);
      body.append(tr);
    }
  };
  card.querySelectorAll('input, select').forEach((el) => el.addEventListener('input', render));
  demos.set(name, render);
  render();
}

const num = (el) => Number(el.value);

demo('numerals', () => {
  const text = $('numerals-input').value;
  return [
    [`toBanglaDigits(text)`, () => bi.toBanglaDigits(text)],
    [`toEnglishDigits(text)`, () => bi.toEnglishDigits(text)],
    [`parseLocalizedNumber(text)`, () => bi.parseLocalizedNumber(text)],
    [`isNumeric(text)`, () => bi.isNumeric(text)],
  ];
});

demo('currency', (loc) => {
  const amount = num($('currency-amount'));
  const symbol = $('currency-symbol').value;
  return [
    [`formatBDT(amount, { locale: '${loc}', symbol: '${symbol}' })`, () => bi.formatBDT(amount, { locale: loc, symbol })],
    [`formatBDT(amount, { locale: '${loc}', minimumFractionDigits: 2 })`, () => bi.formatBDT(amount, { locale: loc, minimumFractionDigits: 2 })],
    [`formatBDTFromPaisa(Math.round(amount * 100), { locale: '${loc}' })`, () => bi.formatBDTFromPaisa(Math.round(amount * 100), { locale: loc })],
    [`formatCompactBDT(amount, { locale: '${loc}' })`, () => bi.formatCompactBDT(amount, { locale: loc })],
    [`toCompactParts(amount)`, () => bi.toCompactParts(amount)],
    [`formatNumber(amount, { grouping: 'indian' })`, () => bi.formatNumber(amount, { locale: loc, digits: 'auto', grouping: 'indian' })],
    [`formatNumber(amount, { grouping: 'western' })`, () => bi.formatNumber(amount, { locale: loc, digits: 'auto', grouping: 'western' })],
  ];
});

// Default the date picker to "now" in local time, to the minute.
{
  const now = new Date();
  now.setSeconds(0, 0);
  const pad = (n) => String(n).padStart(2, '0');
  $('date-input').value =
    `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

demo('date', (loc) => {
  const raw = $('date-input').value;
  const pattern = $('date-pattern').value;
  const date = raw ? new Date(raw) : new Date(NaN);
  return [
    [`formatDate(date, '${pattern}', { locale: '${loc}' })`, () => bi.formatDate(date, pattern, { locale: loc })],
    [`formatDate(date, 'YYYY-MM-DD HH:mm', { locale: '${loc}', digits: 'en' })`, () => bi.formatDate(date, 'YYYY-MM-DD HH:mm', { locale: loc, digits: 'en' })],
    [`getBanglaDayPeriod(date.getHours())`, () => bi.getBanglaDayPeriod(date.getHours())],
    [`formatRelativeTime(date, { locale: '${loc}' })`, () => bi.formatRelativeTime(date, { locale: loc })],
    [`formatRelativeTime(date, { locale: '${loc}', numeric: 'always' })`, () => bi.formatRelativeTime(date, { locale: loc, numeric: 'always' })],
    [`getRelativeTimeParts(date)`, () => bi.getRelativeTimeParts(date)],
  ];
});

demo('plural', (loc) => {
  const count = num($('plural-count'));
  const [en = 'item', bn = 'জিনিস'] = $('plural-noun').value.split('/').map((s) => s.trim());
  const forms = loc === 'bn' ? { one: bn, other: bn } : { one: en, other: `${en}s` };
  return [
    [`getPluralCategory(count, '${loc}')`, () => bi.getPluralCategory(count, loc)],
    [`pluralize(count, ${JSON.stringify(forms)}, { locale: '${loc}' })`, () => bi.pluralize(count, forms, { locale: loc })],
    [`withClassifier(count, '${bn}')`, () => bi.withClassifier(count, bn)],
    [`withClassifier(count, '${bn}', 'জন')`, () => bi.withClassifier(count, bn, 'জন')],
    [`ordinal(count, { locale: '${loc}' })`, () => bi.ordinal(count, { locale: loc })],
    [`ordinal(count, { locale: '${loc}', style: 'word' })`, () => bi.ordinal(count, { locale: loc, style: 'word' })],
  ];
});

demo('words', (loc) => {
  const amount = num($('words-amount'));
  const system = $('words-system').value;
  return [
    [`numberToWords(Math.trunc(amount), { locale: '${loc}', system: '${system}' })`, () => bi.numberToWords(Math.trunc(amount), { locale: loc, system })],
    [`amountToWords(amount, { locale: '${loc}', system: '${system}' })`, () => bi.amountToWords(amount, { locale: loc, system })],
    [`amountToWords(amount, { locale: '${loc}', suffix: false })`, () => bi.amountToWords(amount, { locale: loc, system, suffix: false })],
    [`MAX_WORDS_VALUE`, () => bi.MAX_WORDS_VALUE],
  ];
});

demo('phone', () => {
  const input = $('phone-input').value;
  return [
    [`normalizeBDPhone(input)`, () => bi.normalizeBDPhone(input)],
    [`isValidBDPhone(input)`, () => bi.isValidBDPhone(input)],
    [`getBDOperator(input)`, () => bi.getBDOperator(input)],
    [`formatBDPhone(input, 'international')`, () => bi.formatBDPhone(input, 'international')],
    [`formatBDPhone(input, 'e164')`, () => bi.formatBDPhone(input, 'e164')],
    [`formatBDPhone(input, 'local')`, () => bi.formatBDPhone(input, 'local')],
    [`maskBDPhone(input)`, () => bi.maskBDPhone(input)],
  ];
});

demo('nid', () => {
  const input = $('nid-input').value;
  return [
    [`normalizeNID(input)`, () => bi.normalizeNID(input)],
    [`getNIDFormat(input)`, () => bi.getNIDFormat(input)],
    [`isValidNID(input)`, () => bi.isValidNID(input)],
    [`isValidNID(input, { allowedFormats: ['smart-10'] })`, () => bi.isValidNID(input, { allowedFormats: ['smart-10'] })],
    [`getNIDBirthYear(input)`, () => bi.getNIDBirthYear(input)],
    [`maskNID(input)`, () => bi.maskNID(input)],
  ];
});

document.querySelectorAll('[data-locale]').forEach((button) => {
  button.addEventListener('click', () => {
    locale = button.dataset.locale;
    document.querySelectorAll('[data-locale]').forEach((b) => b.setAttribute('aria-pressed', String(b === button)));
    demos.forEach((render) => render());
  });
});
