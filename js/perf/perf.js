import { Bench } from 'tinybench';
import {
  timeago,
  duration,
  parseDuration,
  humanDate,
  dateRange,
} from '../src/whenwords.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load tests from YAML file
const testsYaml = fs.readFileSync(
  path.join(__dirname, '..', '..', 'spec', 'tests.yaml'),
  'utf8'
);
const tests = yaml.load(testsYaml);

const bench = new Bench({ time: 500 });

// Select a subset of timeago tests for benchmarking
const timeagoTests = [
  tests.timeago.find((t) => t.name === 'just now - identical timestamps'),
  tests.timeago.find((t) => t.name === '30 minutes ago'),
  tests.timeago.find((t) => t.name === '5 hours ago'),
  tests.timeago.find((t) => t.name === '25 days ago'),
  tests.timeago.find((t) => t.name === '5 years ago'),
];

for (const test of timeagoTests) {
  if (test) {
    bench.add(`timeago - ${test.name}`, () => {
      timeago(test.input.timestamp, test.input.reference);
    });
  }
}

// Select a subset of duration tests for benchmarking
const durationTests = [
  tests.duration.find((t) => t.name === 'zero seconds'),
  tests.duration.find((t) => t.name === '1 minute 30 seconds'),
  tests.duration.find((t) => t.name === '1 hour'),
  tests.duration.find((t) => t.name === '1 day'),
  tests.duration.find((t) => t.name === '1 year (365 days)'),
  tests.duration.find((t) => t.name === 'compact - 2h 30m'),
  tests.duration.find((t) => t.name === 'max_units 1 - days only'),
];

for (const test of durationTests) {
  if (test) {
    bench.add(`duration - ${test.name}`, () => {
      duration(test.input.seconds, test.input.options);
    });
  }
}

// Select a subset of parse_duration tests for benchmarking
const parseDurationTests = [
  tests.parse_duration.find((t) => t.name === 'compact hours minutes'),
  tests.parse_duration.find((t) => t.name === 'verbose'),
  tests.parse_duration.find((t) => t.name === 'colon notation h:mm'),
  tests.parse_duration.find((t) => t.name === 'decimal hours'),
  tests.parse_duration.find((t) => t.name === 'mixed compact'),
];

for (const test of parseDurationTests) {
  if (test) {
    bench.add(`parseDuration - ${test.name}`, () => {
      parseDuration(test.input);
    });
  }
}

// Select a subset of human_date tests for benchmarking
const humanDateTests = [
  tests.human_date.find((t) => t.name === 'today'),
  tests.human_date.find((t) => t.name === 'yesterday'),
  tests.human_date.find((t) => t.name === 'last Friday (3 days ago)'),
  tests.human_date.find((t) => t.name === 'same year different month'),
  tests.human_date.find((t) => t.name === 'previous year'),
];

for (const test of humanDateTests) {
  if (test) {
    bench.add(`humanDate - ${test.name}`, () => {
      humanDate(test.input.timestamp, test.input.reference);
    });
  }
}

// Select a subset of date_range tests for benchmarking
const dateRangeTests = [
  tests.date_range.find((t) => t.name === 'same day'),
  tests.date_range.find((t) => t.name === 'same month range'),
  tests.date_range.find((t) => t.name === 'same year different months'),
  tests.date_range.find((t) => t.name === 'different years'),
];

for (const test of dateRangeTests) {
  if (test) {
    bench.add(`dateRange - ${test.name}`, () => {
      dateRange(test.input.start, test.input.end);
    });
  }
}

await bench.run();

console.table(bench.table());
