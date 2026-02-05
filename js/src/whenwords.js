/**
 * Normalize a timestamp to Unix seconds
 * @param {number|string} timestamp - Unix seconds, ISO 8601 string, or Date
 * @returns {number} Unix seconds
 * @throws {Error} If timestamp format is invalid
 */
function normalizeTimestamp(timestamp) {
  if (typeof timestamp === 'number') {
    return timestamp;
  }
  if (typeof timestamp === 'string') {
    // Parse ISO 8601
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid timestamp format: ${timestamp}`);
    }
    return Math.floor(date.getTime() / 1000);
  }
  if (timestamp instanceof Date) {
    return Math.floor(timestamp.getTime() / 1000);
  }
  throw new Error(`Invalid timestamp format: ${timestamp}`);
}

/**
 * Round to nearest integer using half-up rounding (2.5 -> 3)
 */
function roundHalfUp(n) {
  return Math.floor(n + 0.5);
}

/**
 * Returns a human-readable relative time string
 * @param {number|string} timestamp - The event timestamp
 * @param {number|string} [reference] - Reference timestamp (defaults to timestamp)
 * @returns {string} Relative time string like "3 hours ago" or "just now"
 */
function timeago(timestamp, reference) {
  const ts = normalizeTimestamp(timestamp);
  const ref = reference !== undefined ? normalizeTimestamp(reference) : ts;

  const diff = Math.abs(ref - ts);
  const isFuture = ts > ref;

  // Helper to create output
  const formatOutput = (value, unit) => {
    const pluralUnit = value === 1 ? unit : unit + 's';
    return isFuture
      ? `in ${value} ${pluralUnit}`
      : `${value} ${pluralUnit} ago`;
  };

  // Thresholds in seconds
  if (diff < 45) return 'just now';
  if (diff < 90) return formatOutput(1, 'minute');
  if (diff < 45 * 60) {
    const n = roundHalfUp(diff / 60);
    return formatOutput(n, 'minute');
  }
  if (diff < 90 * 60) return formatOutput(1, 'hour');
  if (diff < 22 * 3600) {
    const n = roundHalfUp(diff / 3600);
    return formatOutput(n, 'hour');
  }
  if (diff < 36 * 3600) return formatOutput(1, 'day');
  if (diff < 26 * 86400) {
    const n = roundHalfUp(diff / 86400);
    return formatOutput(n, 'day');
  }
  if (diff < 46 * 86400) return formatOutput(1, 'month');
  if (diff < 320 * 86400) {
    const n = roundHalfUp(diff / (30 * 86400));
    return formatOutput(n, 'month');
  }
  if (diff < 548 * 86400) return formatOutput(1, 'year');

  const n = roundHalfUp(diff / (365 * 86400));
  return formatOutput(n, 'year');
}

/**
 * Formats a duration with optional compact mode and max units
 * @param {number} seconds - Duration in seconds
 * @param {Object} [options] - Formatting options
 * @param {boolean} [options.compact] - Use compact format (e.g., "2h 30m")
 * @param {number} [options.max_units] - Maximum units to display (default 2)
 * @returns {string} Formatted duration
 * @throws {Error} If seconds is negative
 */
function duration(seconds, options = {}) {
  if (seconds < 0) {
    throw new Error('Seconds cannot be negative');
  }

  const compact = options.compact || false;
  const maxUnits = options.max_units !== undefined ? options.max_units : 2;

  const units = [
    { name: 'year', divisor: 365 * 86400, shortName: 'y' },
    { name: 'month', divisor: 30 * 86400, shortName: 'mo' },
    { name: 'day', divisor: 86400, shortName: 'd' },
    { name: 'hour', divisor: 3600, shortName: 'h' },
    { name: 'minute', divisor: 60, shortName: 'm' },
    { name: 'second', divisor: 1, shortName: 's' },
  ];

  const parts = [];
  let remaining = seconds;

  for (const unit of units) {
    if (parts.length >= maxUnits) break;
    const count = Math.floor(remaining / unit.divisor);
    if (count > 0) {
      if (compact) {
        parts.push(`${count}${unit.shortName}`);
      } else {
        const suffix = count === 1 ? '' : 's';
        parts.push(`${count} ${unit.name}${suffix}`);
      }
      remaining -= count * unit.divisor;
    }
  }

  // Handle rounding for the smallest displayed unit
  if (parts.length > 0 && parts.length === maxUnits && remaining > 0) {
    // Get the last unit's divisor
    const lastUnitIndex = units.findIndex((u) => {
      if (compact) {
        return parts[parts.length - 1].includes(u.shortName);
      } else {
        return parts[parts.length - 1].includes(u.name);
      }
    });

    if (lastUnitIndex < units.length - 1) {
      const currentUnitDivisor = units[lastUnitIndex].divisor;
      const fraction = remaining / currentUnitDivisor;

      if (fraction >= 0.5) {
        // Round up the last displayed unit
        const lastPart = parts[parts.length - 1];
        let newCount;

        if (compact) {
          const match = lastPart.match(/^(\d+)/);
          newCount = parseInt(match[1]) + 1;
          const unit = lastPart.substring(match[1].length);
          parts[parts.length - 1] = `${newCount}${unit}`;
        } else {
          const match = lastPart.match(/^(\d+)/);
          newCount = parseInt(match[1]) + 1;
          const unitName = lastPart.substring(match[1].length).trim();
          const isSingular = newCount === 1;
          const suffix = isSingular ? '' : 's';
          parts[parts.length - 1] =
            `${newCount} ${unitName.replace(/s$/, '')}${suffix}`;
        }
      }
    }
  }

  if (parts.length === 0) {
    return compact ? '0s' : '0 seconds';
  }

  return compact ? parts.join(' ') : parts.join(', ');
}

// Pre-compiled regex for parseDuration - single pass to capture all units
const PARSE_DURATION_REGEX = /([0-9.]+)\s*(years?|weeks?|wks?|days?|hours?|hrs?|minutes?|mins?|seconds?|secs?|y(?![a-z])|w(?![a-z])|d(?![a-z])|h(?![a-z])|m(?![a-z])|s(?![a-z]))/gi;

// Unit name to divisor mapping for parseDuration
const UNIT_DIVISORS = {
  years: 365 * 86400, year: 365 * 86400, y: 365 * 86400,
  weeks: 7 * 86400, week: 7 * 86400, wks: 7 * 86400, wk: 7 * 86400, w: 7 * 86400,
  days: 86400, day: 86400, d: 86400,
  hours: 3600, hour: 3600, hrs: 3600, hr: 3600, h: 3600,
  minutes: 60, minute: 60, mins: 60, min: 60, m: 60,
  seconds: 1, second: 1, secs: 1, sec: 1, s: 1,
};

/**
 * Parses a human-written duration string into seconds
 * @param {string} input - Duration string
 * @returns {number} Duration in seconds
 * @throws {Error} If input cannot be parsed
 */
function parseDuration(input) {
  if (typeof input !== 'string' || input.trim() === '') {
    throw new Error('Empty string');
  }

  const str = input.trim().toLowerCase();

  // Check for negative numbers
  if (/-\s*\d/.test(str)) {
    throw new Error('Negative durations not allowed');
  }

  // Check for colon notation first (h:mm:ss or h:mm)
  const colonMatch = str.match(/^(\d+):(\d{1,2})(?::(\d{1,2}))?$/);
  if (colonMatch) {
    const hours = parseInt(colonMatch[1]);
    const minutes = parseInt(colonMatch[2]);
    const seconds = colonMatch[3] ? parseInt(colonMatch[3]) : 0;
    return hours * 3600 + minutes * 60 + seconds;
  }

  // Normalize the string for parsing
  const working = str
    .replace(/,\s*and\s*/g, ' ')
    .replace(/\s+and\s+/g, ' ')
    .replace(/,/g, ' ');

  let totalSeconds = 0;
  let foundAnyUnit = false;

  // Use single regex to capture all units in one pass
  PARSE_DURATION_REGEX.lastIndex = 0; // Reset regex state
  let match;
  while ((match = PARSE_DURATION_REGEX.exec(working)) !== null) {
    const value = parseFloat(match[1]);
    if (value < 0) {
      throw new Error('Negative durations not allowed');
    }
    const unit = match[2].toLowerCase();
    const divisor = UNIT_DIVISORS[unit];
    if (divisor) {
      totalSeconds += value * divisor;
      foundAnyUnit = true;
    }
  }

  if (!foundAnyUnit) {
    throw new Error('No parseable units found');
  }

  return totalSeconds;
}

/**
 * Gets an array of [year, month, day] from Unix timestamp (UTC)
 */
function getDateParts(timestamp) {
  const date = new Date(timestamp * 1000);
  return [
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCDay(),
  ];
}

/**
 * Returns a contextual date string
 * @param {number|string} timestamp - The date to format
 * @param {number|string} [reference] - Reference date for comparison
 * @returns {string} Contextual date like "Today", "Yesterday", "Last Friday", or "March 5, 2024"
 */
function humanDate(timestamp, reference) {
  const ts = normalizeTimestamp(timestamp);
  const ref = reference !== undefined ? normalizeTimestamp(reference) : ts;

  const [tYear, tMonth, tDay, _tDayOfWeek] = getDateParts(ts);
  const [rYear, rMonth, rDay, rDayOfWeek] = getDateParts(ref);

  const daysDiff = Math.floor((ref - ts) / 86400);
  const dayName = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  const monthName = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  // Same day
  if (tYear === rYear && tMonth === rMonth && tDay === rDay) {
    return 'Today';
  }

  // Yesterday
  if (
    daysDiff === 1 &&
    tYear === rYear &&
    tMonth === rMonth &&
    tDay === rDay - 1
  ) {
    return 'Yesterday';
  }

  // Tomorrow
  if (
    daysDiff === -1 &&
    tYear === rYear &&
    tMonth === rMonth &&
    tDay === rDay + 1
  ) {
    return 'Tomorrow';
  }

  // Within past 7 days (but not yesterday) - exactly 2-7 days ago
  if (daysDiff > 1 && daysDiff < 7) {
    const daysBack = daysDiff;
    let targetDay = rDayOfWeek - daysBack;
    if (targetDay < 0) targetDay += 7;
    return `Last ${dayName[targetDay]}`;
  }

  // Within next 7 days (but not tomorrow) - exactly 2-7 days ahead
  if (daysDiff < -1 && daysDiff > -7) {
    const daysAhead = -daysDiff;
    let targetDay = (rDayOfWeek + daysAhead) % 7;
    return `This ${dayName[targetDay]}`;
  }

  // Same year
  if (tYear === rYear) {
    return `${monthName[tMonth]} ${tDay}`;
  }

  // Different year
  return `${monthName[tMonth]} ${tDay}, ${tYear}`;
}

/**
 * Formats a date range with smart abbreviation
 * @param {number|string} start - Start timestamp
 * @param {number|string} end - End timestamp
 * @returns {string} Formatted date range
 */
function dateRange(start, end) {
  let ts = normalizeTimestamp(start);
  let te = normalizeTimestamp(end);

  // Swap if needed
  if (ts > te) {
    [ts, te] = [te, ts];
  }

  const [startYear, startMonth, startDay] = getDateParts(ts);
  const [endYear, endMonth, endDay] = getDateParts(te);

  const monthName = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  const formatDate = (year, month, day) =>
    `${monthName[month]} ${day}, ${year}`;
  const formatDateNoYear = (month, day) => `${monthName[month]} ${day}`;

  // Same day
  if (startYear === endYear && startMonth === endMonth && startDay === endDay) {
    return formatDate(startYear, startMonth, startDay);
  }

  // Same month
  if (startYear === endYear && startMonth === endMonth) {
    return `${formatDateNoYear(startMonth, startDay)}–${endDay}, ${endYear}`;
  }

  // Same year
  if (startYear === endYear) {
    return `${formatDateNoYear(startMonth, startDay)} – ${formatDateNoYear(endMonth, endDay)}, ${endYear}`;
  }

  // Different years
  return `${formatDate(startYear, startMonth, startDay)} – ${formatDate(endYear, endMonth, endDay)}`;
}

export { timeago, duration, parseDuration, humanDate, dateRange };
