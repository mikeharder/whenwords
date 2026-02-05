# Copilot Instructions

## Project Overview

**whenwords** is a library for human-friendly time formatting and parsing. It converts timestamps to readable strings like "3 hours ago" and parses duration strings like "2h 30m" into seconds.

This repository contains:
- The formal specification in `/spec/`
- JavaScript implementation in `/js/`
- Future implementations may be added

## Core Design Principles

1. **Pure functions only** — No side effects, no system clock access, no I/O. The current time is always passed explicitly.
2. **Timestamps are Unix seconds** — All functions work with Unix timestamps (seconds since 1970-01-01 UTC). Accept language-native datetime types for convenience.
3. **Strings are UTF-8** — All string inputs and outputs are UTF-8 encoded.
4. **English only (v0.1)** — This version outputs English strings only. Do not implement i18n unless the spec explicitly defines it.
5. **Deterministic** — Given the same inputs, functions always return the same output. No randomness, no environment-dependent behavior.

## JavaScript Implementation

### Project Structure
- **Source code**: `/js/src/whenwords.js`
- **Tests**: `/js/test/whenwords.test.js`
- **Documentation**: `/js/README.md` and `/js/usage.md`
- **Spec tests**: Tests are loaded from `/spec/tests.yaml` and must pass

### Development Workflow

```bash
# Install dependencies (from /js directory)
npm install

# Run tests
npm test

# Run tests with coverage (used in CI)
npm run test:ci

# Run linting
npm run lint

# Format code
npm run format

# Check formatting
npm run format:check

# Run all checks (test + lint + format:check)
npm run check
```

### Code Style

- **Module system**: ES modules (`import`/`export`)
- **Node.js version**: Modern Node.js with ES2022+ features
- **Prettier**: Single quotes, semicolons, trailing commas (ES5)
- **ESLint**: Minimal rules, warns on unused variables (use `_` prefix for intentionally unused)
- **JSDoc comments**: Use JSDoc for public functions

### Testing

- **Framework**: Vitest
- **Test data**: Tests are driven by `/spec/tests.yaml` to ensure specification compliance
- **Test structure**: Use `describe` and `it` blocks, load YAML test definitions
- **All implementations must pass the spec tests**
- **Coverage**: Code coverage is tracked using Vitest's V8 provider with 80% thresholds for statements, branches, functions, and lines
- **CI Testing**: Use `npm run test:ci` in CI to generate coverage reports; use `npm test` for faster local development
- **Coverage configuration**: Located in `js/vitest.config.js`, configured to write text reports directly to `coverage/coverage.txt` using Vitest's built-in `file` option

### Common Patterns

```javascript
// Functions accept Unix timestamps, ISO 8601 strings, or Date objects
function timeago(timestamp, reference) {
  const ts = normalizeTimestamp(timestamp);
  const ref = reference !== undefined ? normalizeTimestamp(reference) : ts;
  // ...
}

// Use helper functions for consistency
function normalizeTimestamp(timestamp) {
  // Convert various formats to Unix seconds
}

function roundHalfUp(n) {
  return Math.floor(n + 0.5);
}
```

## Specification Compliance

All implementations must:
1. Follow the specification in `/spec/SPEC.md`
2. Pass all tests in `/spec/tests.yaml`
3. Generate minimal files (source, tests, usage.md)
4. NOT include package distribution scaffolding (publishable metadata)

## When Making Changes

- Run `npm test` to ensure spec compliance
- Run `npm run check` before committing to verify tests, linting, and formatting
- Keep functions pure and deterministic
- Update `/js/usage.md` if API changes
- Add tests to `/spec/tests.yaml` for new spec behaviors (cross-language)
- Do not add internationalization unless specified
- Maintain backward compatibility within v0.1.x
- **Only update `package-lock.json` when adding, removing, or updating dependencies** — Do not commit incidental changes to package-lock.json that occur from running `npm install` or `npm ci`. If you need to run these commands for testing, revert any unintended package-lock.json changes before committing.

## GitHub Actions

The repository uses GitHub Actions for CI:
- `.github/workflows/js-test.yaml` — JavaScript tests with coverage reporting
- `.github/workflows/js-perf.yaml` — Performance benchmarks
- `.github/workflows/actionlint.yaml` — Workflow linting

### CI Workflow Best Practices

- **Avoid third-party actions** — Use built-in GitHub Actions features and native tool capabilities when possible
- **Step summaries** — Display test results and coverage reports in GitHub Actions step summaries using `$GITHUB_STEP_SUMMARY`
- **Coverage reporting** — Use Vitest's built-in text reporter with `file` option to write coverage directly to a file (e.g., `coverage/coverage.txt`), then read it in the workflow
- **No custom scripts** — Prefer configuring tools (like Vitest) to generate output in the desired format rather than writing custom parsing scripts

## Documentation

- **Specification**: `/spec/SPEC.md` — Authoritative behavior definition
- **JavaScript README**: `/js/README.md` — Quick start guide
- **Usage guide**: `/js/usage.md` — Detailed API documentation
- **Project README**: `/README.md` — Repository overview
