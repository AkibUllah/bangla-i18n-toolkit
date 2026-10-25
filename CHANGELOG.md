# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- Screenshots and an animated walkthrough of the live playground in the README.
- CodeQL code scanning workflow (JavaScript/TypeScript and Actions) and Dependabot updates for npm, Docker and GitHub Actions.
- Roadmap tracked as GitHub issues under the v0.2.0 milestone.

### Changed

- CI workflow runs with a read-only `GITHUB_TOKEN` by default.

## [0.1.0] - 2026-10-20

### Added

- `numerals`: `toBanglaDigits`, `toEnglishDigits`, `isBanglaDigit`, `isNumeric`, `parseLocalizedNumber`.
- `currency`: `formatNumber`, `formatBDT`, `formatBDTFromPaisa` (number or bigint), `formatCompactBDT`, `toCompactParts`, `groupDigits` with Indian/western/none grouping.
- `date`: `formatDate` with Day.js-style tokens, Bangla month/weekday tables, `getBanglaDayPeriod`.
- `relative-time`: `formatRelativeTime`, `getRelativeTimeParts` with `auto`/`always` numeric modes.
- `plural`: CLDR plural categories for `en`/`bn`, `pluralize`, `withClassifier`.
- `ordinal`: suffix and word styles in both languages.
- `words`: `numberToWords` (Indian or western system) and cheque-style `amountToWords`.
- `phone`: normalisation, validation, operator lookup, formatting and masking for Bangladeshi mobile numbers.
- `nid`: format detection, structural validation, 13 -> 17 digit conversion, masking.
- ESM + CJS builds with per-module subpath exports, source maps and type declarations.
- CI on Node 18 and 20, Dockerfile for a reproducible build, gzip size report script.
- Interactive playground on GitHub Pages running the built ESM bundle, and a Codespaces dev container.

[Unreleased]: https://github.com/AkibUllah/bangla-i18n-toolkit/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/AkibUllah/bangla-i18n-toolkit/releases/tag/v0.1.0
