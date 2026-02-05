import { describe, it, expect } from 'vitest';
import {
  timeago,
  duration,
  parseDuration,
  humanDate,
  dateRange,
} from '../src/whenwords.js';

describe('extra coverage tests', () => {
  describe('normalizeTimestamp edge cases', () => {
    it('should handle invalid string timestamp', () => {
      expect(() => timeago('invalid-date-string', 1609459200)).toThrow(
        'Invalid timestamp format'
      );
    });

    it('should handle valid ISO 8601 string timestamp', () => {
      // Explicitly test valid string parsing (line 17 coverage)
      expect(timeago('2024-01-01T00:00:00Z', '2024-01-01T03:00:00Z')).toBe(
        '3 hours ago'
      );
    });

    it('should handle Date object as timestamp', () => {
      const date = new Date('2024-03-15T12:00:00Z');
      const refDate = new Date('2024-03-15T15:00:00Z');
      expect(timeago(date, refDate)).toBe('3 hours ago');
    });

    it('should handle Date object as reference', () => {
      const refDate = new Date('2024-03-15T15:00:00Z');
      expect(timeago(1710507600, refDate)).toBe('2 hours ago');
    });

    it('should throw on invalid timestamp type', () => {
      expect(() => timeago(null, 1609459200)).toThrow(
        'Invalid timestamp format'
      );
    });

    it('should throw on invalid timestamp type (array)', () => {
      expect(() => timeago([1, 2, 3], 1609459200)).toThrow(
        'Invalid timestamp format'
      );
    });

    it('should throw on invalid timestamp type (object)', () => {
      expect(() => timeago({ time: 123 }, 1609459200)).toThrow(
        'Invalid timestamp format'
      );
    });
  });

  describe('duration rounding edge cases', () => {
    it('should round up in non-compact mode when fraction >= 0.5', () => {
      // 90 minutes + 35 seconds = 5435 seconds
      // With max_units=1, should display hours
      // 5435 / 3600 = 1.509... hours
      // With 35 seconds remaining, that's 35/3600 = 0.0097 < 0.5, so no rounding
      // Let me try a different value
      // 1 hour 40 minutes = 6000 seconds
      // With max_units=1, should display 2 hours (1 + (40*60/3600) = 1 + 0.666 >= 0.5)
      expect(duration(6000, { max_units: 1 })).toBe('2 hours');
    });

    it('should not round up when fraction < 0.5 in non-compact mode', () => {
      // 1 hour 20 minutes = 4800 seconds
      // With max_units=1, should display 1 hour (1 + (20*60/3600) = 1 + 0.333 < 0.5)
      expect(duration(4800, { max_units: 1 })).toBe('1 hour');
    });
  });

  describe('parseDuration edge cases', () => {
    it('should handle overlapping matches by preferring first match', () => {
      // This tests the overlap detection logic
      // "5m30s" should parse minutes and seconds, not overlapping patterns
      expect(parseDuration('5m30s')).toBe(330);
    });

    it('should handle input that might create overlapping regex matches', () => {
      // Testing if different regex patterns might create overlaps
      // Using verbose "min" which is in multi-letter units,
      // but shouldn't overlap with single-letter "m" due to lookahead
      expect(parseDuration('5 min 30 s')).toBe(330);
    });

    it('should handle potential negative value parsing', () => {
      // The code checks for negative values after parsing, but also before
      // Testing the regex that detects negative numbers
      expect(() => parseDuration('- 5 hours')).toThrow(
        'Negative durations not allowed'
      );
    });

    it('should throw on whitespace-only string', () => {
      expect(() => parseDuration('   ')).toThrow('Empty string');
    });

    it('should handle complex mixed units without overlap', () => {
      // Test that multiple units work without triggering overlap detection
      expect(parseDuration('2y 3mo 5d 12h 30m 45s')).toBe(63549045);
    });
  });

  describe('additional Date object coverage', () => {
    it('should handle Date objects in humanDate', () => {
      const date = new Date('2024-03-15T00:00:00Z');
      const ref = new Date('2024-03-15T12:00:00Z');
      expect(humanDate(date, ref)).toBe('Today');
    });

    it('should handle Date objects in dateRange', () => {
      const start = new Date('2024-03-15T00:00:00Z');
      const end = new Date('2024-03-20T00:00:00Z');
      expect(dateRange(start, end)).toBe('March 15–20, 2024');
    });
  });
});
