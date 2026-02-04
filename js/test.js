import {
  timeago,
  duration,
  parseDuration,
  humanDate,
  dateRange,
} from './index.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import yaml from 'js-yaml';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let passed = 0;
let failed = 0;
const failures = [];

function assert(condition, message, testName) {
  if (testName) {
    console.log(`Running: ${testName}`);
  }
  if (!condition) {
    failed++;
    failures.push(message);
  } else {
    passed++;
  }
}

function assertEquals(actual, expected, testName) {
  const condition = actual === expected;
  const message = `${testName}\n  Expected: ${expected}\n  Got: ${actual}`;
  assert(condition, message, testName);
}

function assertThrows(fn, testName) {
  let didThrow = false;
  try {
    fn();
  } catch {
    didThrow = true;
  }
  const message = `${testName}\n  Expected to throw but didn't`;
  assert(didThrow, message, testName);
}

// Load tests from YAML file
const testsYaml = fs.readFileSync(
  path.join(__dirname, '..', 'spec', 'tests.yaml'),
  'utf8'
);
const tests = yaml.load(testsYaml);

// Run timeago tests
for (const test of tests.timeago) {
  const testName = `timeago: ${test.name}`;
  assertEquals(
    timeago(test.input.timestamp, test.input.reference),
    test.output,
    testName
  );
}

// Run duration tests
for (const test of tests.duration) {
  const testName = `duration: ${test.name}`;
  if (test.error) {
    assertThrows(
      () => duration(test.input.seconds, test.input.options),
      testName
    );
  } else {
    assertEquals(
      duration(test.input.seconds, test.input.options),
      test.output,
      testName
    );
  }
}

// Run parse_duration tests
for (const test of tests.parse_duration) {
  const testName = `parseDuration: ${test.name}`;
  if (test.error) {
    assertThrows(() => parseDuration(test.input), testName);
  } else {
    assertEquals(parseDuration(test.input), test.output, testName);
  }
}

// Run human_date tests
for (const test of tests.human_date) {
  const testName = `humanDate: ${test.name}`;
  assertEquals(
    humanDate(test.input.timestamp, test.input.reference),
    test.output,
    testName
  );
}

// Run date_range tests
for (const test of tests.date_range) {
  const testName = `dateRange: ${test.name}`;
  assertEquals(
    dateRange(test.input.start, test.input.end),
    test.output,
    testName
  );
}

// Print results
console.log('\n' + '='.repeat(60));
console.log(`Tests passed: ${passed}`);
console.log(`Tests failed: ${failed}`);
console.log('='.repeat(60));

if (failures.length > 0) {
  console.log('\nFailures:');
  failures.forEach((failure, i) => {
    console.log(`\n${i + 1}. ${failure}`);
  });
}

process.exit(failed > 0 ? 1 : 0);
