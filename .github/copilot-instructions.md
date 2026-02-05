# Copilot Instructions

## Project Overview

**whenwords** is a library for human-friendly time formatting and parsing. It converts timestamps to readable strings like "3 hours ago" and parses duration strings like "2h 30m" into seconds.

This repository contains:

- The formal specification in `/spec/`
- JavaScript implementation in the root directory
- Interactive playground in `/web/`

## Core Design Principles

1. **Pure functions only** — No side effects, no system clock access, no I/O. The current time is always passed explicitly.
2. **Timestamps are Unix seconds** — All functions work with Unix timestamps (seconds since 1970-01-01 UTC). Accept language-native datetime types for convenience.
3. **Strings are UTF-8** — All string inputs and outputs are UTF-8 encoded.
4. **English only (v0.1)** — This version outputs English strings only. Do not implement i18n unless the spec explicitly defines it.
5. **Deterministic** — Given the same inputs, functions always return the same output. No randomness, no environment-dependent behavior.

## Specification Compliance

All implementations must:

1. Follow the specification in `/spec/SPEC.md`
2. Pass all tests in `/spec/tests.yaml`
3. Generate minimal files (source, tests, usage.md)
4. NOT include package distribution scaffolding (publishable metadata)

## Documentation

- **Specification**: `/spec/SPEC.md` — Authoritative behavior definition
- **Project README**: `/README.md` — Quick start guide and overview
- **Usage guide**: `/usage.md` — Detailed API documentation
- **Interactive playground**: `/web/playground.html` — Live examples

## GitHub Actions

The repository uses GitHub Actions for CI:

- `.github/workflows/test.yaml` — Tests, linting, and actionlint workflow validation
- `.github/workflows/perf.yaml` — Performance benchmarks
- `.github/workflows/pages.yaml` — Deploy playground to GitHub Pages

### CI Workflow Best Practices

- **Avoid third-party actions** — Use built-in GitHub Actions features and native tool capabilities when possible
- **Step summaries** — Display test results and coverage reports in GitHub Actions step summaries using `$GITHUB_STEP_SUMMARY`
- **PR comments** — For PR events, post step summary content as PR comments using GitHub CLI for easier review. Use a distinct header (e.g., "🧪 Test Results") to identify the comment, then search for and update existing comments instead of creating new ones each time. This keeps PR conversations clean.
- **Coverage reporting** — Use Vitest's built-in text reporter with `file` option to write coverage directly to a file (e.g., `coverage/coverage.txt`), then read it in the workflow
- **No custom scripts** — Prefer configuring tools (like Vitest) to generate output in the desired format rather than writing custom parsing scripts

### Workflow Naming Conventions

- **Workflow names**: Use clear, descriptive names that indicate the workflow's purpose (e.g., "Tests" for running tests and linting)
- **File names**: Use kebab-case filenames that match the workflow's purpose (e.g., `test.yaml` for testing, `perf.yaml` for performance)
- **Job names**: Use lowercase job IDs with hyphens (e.g., `test` or `actionlint`) and provide descriptive display names (e.g., `name: Tests`) for consistency with GitHub Actions conventions
