# Copilot Instructions - Source Code

## JavaScript Implementation

### Project Structure

- **Source code**: `/src/whenwords.js`
- **Tests**: `/test/whenwords.test.js`
- **Performance tests**: `/perf/perf.js`
- **Documentation**: `/README.md` and `/usage.md`
- **Interactive playground**: `/web/playground.html` (deployed at https://mikeharder.github.io/whenwords-js/playground.html)
- **Spec tests**: Tests are loaded from `/spec/tests.yaml` and must pass

### Development Workflow

**Prerequisites**: Enable corepack to use pnpm

```bash
# Enable corepack (one-time setup)
corepack enable

# From repository root
pnpm install

# Run tests
pnpm test

# Run tests with coverage (used in CI)
pnpm run test:ci

# Run linting
pnpm run lint

# Format code
pnpm run format

# Check formatting
pnpm run format:check

# Run all checks (test + lint + format:check)
pnpm run check

# Run performance benchmarks
pnpm run perf

# Start local web server for playground
pnpm run web
```

**Note**: The project is configured to use pnpm via corepack (see `packageManager` in `package.json`). If you prefer npm, you can still use it, but pnpm is the standard for this project.

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
- **CI Testing**: Use `pnpm run test:ci` in CI to generate coverage reports; use `pnpm test` for faster local development
- **Coverage configuration**: Located in `vitest.config.js`, configured to write text reports directly to `coverage/coverage.txt` using Vitest's built-in `file` option

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

## When Making Code Changes

- **NEVER modify files in the `/spec/` folder** — The spec folder contains the formal specification and is maintained separately. It is excluded from prettier formatting (see `.prettierignore`). Only read from spec files, never write to them.
- Run `pnpm test` to ensure spec compliance
- **ALWAYS run `pnpm run check` before considering a change "done"** — This verifies tests, linting, and formatting all pass
- **Formatting is required** — All code must pass `pnpm run format:check` before committing. Run `pnpm run format` to auto-fix formatting issues.
- Keep functions pure and deterministic
- Update `/usage.md` if API changes
- Add tests to `/spec/tests.yaml` for new spec behaviors (cross-language)
- Do not add internationalization unless specified
- Maintain backward compatibility within v0.1.x
- **Maintain 100% code coverage** — When adding new code, always add corresponding test cases. Use `pnpm run test:ci` to verify coverage remains at 100%. If coverage drops, add tests to cover the new code paths.
- **Avoid unreachable defensive code** — Before adding defensive checks (e.g., negative value validation, overlap detection), verify they can actually be triggered. If the code design (e.g., regex patterns, type checks) makes certain conditions impossible, don't add checks for them. This keeps the codebase clean and maintainable.
- **Only update `pnpm-lock.yaml` when adding, removing, or updating dependencies** — Do not commit incidental changes to pnpm-lock.yaml that occur from running `pnpm install` or `pnpm ci`. If you need to run these commands for testing, revert any unintended pnpm-lock.yaml changes before committing.
- **After all other tasks, reflect on your work, and update copilot instructions if anything relevant has changed** — This ensures the instructions stay current with project practices and decisions.
- **When given direct feedback in a PR, update copilot instructions** — This makes it less likely you will need similar feedback in other PRs by incorporating lessons learned.

## Performance Optimization

When optimizing performance-critical code:

### Benchmarking

- **Run performance tests first** — Use `pnpm run perf` to identify actual bottlenecks before making changes
- **Measure, don't guess** — Focus optimization efforts on functions that show up as slow in benchmarks
- **Compare before/after** — Document performance improvements with concrete numbers (e.g., "20x faster: 12,204ns → 602ns")

### Common Performance Patterns

- **Pre-compile regexes** — Move regex patterns outside functions as constants to avoid recompilation on each call
- **Minimize regex passes** — Consolidate multiple regex patterns into a single comprehensive pattern when possible
- **Avoid nested loops** — Look for O(n²) algorithms (e.g., overlap detection) that can be eliminated with better data structures
- **Use object lookups** — Replace repeated string comparisons or searches with O(1) object property access
- **Eliminate redundant operations** — Remove unnecessary type conversions, string operations, or checks that are already handled elsewhere
- **Prefer simple algorithms** — A single-pass linear algorithm is usually faster than multiple passes, even with simpler logic per pass

### Example: parseDuration Optimization

The `parseDuration` function was optimized from ~12,000ns to ~600ns (20x improvement) by:

1. Consolidating 12+ regex patterns into one comprehensive pattern
2. Eliminating O(n²) overlap detection by using sequential matching
3. Pre-compiling regex and lookup tables outside the function
4. Removing redundant `toLowerCase()` calls

### Performance Testing

- Performance tests are in `/perf/perf.js` using the tinybench library
- Run `pnpm run perf` to benchmark all functions
- CI runs performance tests automatically via `.github/workflows/perf.yaml`
