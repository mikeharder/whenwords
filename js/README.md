# whenwords for JavaScript

Human-friendly time formatting and parsing for JavaScript.

## Overview

This is the JavaScript implementation of the [whenwords](https://github.com/dbreunig/whenwords) library. It provides five core functions for working with time in a human-friendly way:

- **timeago** — Converts timestamps to relative time strings ("3 hours ago", "in 2 days")
- **duration** — Formats seconds as human-readable durations ("1 hour, 30 minutes" or "1h 30m")
- **parseDuration** — Parses duration strings like "2h 30m" into seconds
- **humanDate** — Returns contextual date strings ("Today", "Yesterday", "Last Tuesday")
- **dateRange** — Formats smart date ranges ("March 5–7, 2024")

## Quick Start

```javascript
import {
  timeago,
  duration,
  parseDuration,
  humanDate,
  dateRange,
} from './index.js';

const now = Math.floor(Date.now() / 1000);
const yesterday = now - 86400;

console.log(timeago(yesterday, now)); // "1 day ago"
console.log(duration(3661)); // "1 hour, 1 minute"
console.log(parseDuration('2h 30m')); // 9000
console.log(humanDate(yesterday, now)); // "Yesterday"
```

## Documentation

For complete API documentation, examples, and error handling details, see **[usage.md](usage.md)**.

## Development

```bash
# Run tests
npm test

# Format code
npm run format

# Check formatting
npm run format:check
```

## Specification Compliance

This implementation follows the [whenwords specification](../SPEC.md) and passes all tests defined in [tests.yaml](../tests.yaml).
