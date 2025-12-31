/**
 * Test Severity Detection Enhancement
 *
 * This file tests the enhanced severity detection including:
 * - Numeric severity (7/10, 3 out of 10, 30%)
 * - Intensity modifiers (extremely tired, a bit dizzy)
 * - Comparative language (worse than yesterday)
 * - Smart default severity assignment
 */

import { extractSymptoms } from './src/nlp/extractor';

const testCases = [
  // Numeric severity tests
  {
    text: "Energy's hovering around a 3 out of 10 today",
    expected: { symptom: 'fatigue', severity: 'mild' },
  },
  {
    text: "Pain is at 8/10, really bad",
    expected: { symptom: 'pain', severity: 'severe' },
  },
  {
    text: "My fatigue level is 5 out of 10",
    expected: { symptom: 'fatigue', severity: 'moderate' },
  },
  {
    text: "Brain fog is about 7/10",
    expected: { symptom: 'brain_fog', severity: 'severe' },
  },
  {
    text: "I'm a 5/10 pain today",
    expected: { symptom: 'pain', severity: 'moderate' },
  },

  // Intensity modifiers
  {
    text: "I'm extremely tired today",
    expected: { symptom: 'fatigue', severity: 'severe' },
  },
  {
    text: "Feeling a bit dizzy",
    expected: { symptom: 'dizziness', severity: 'mild' },
  },
  {
    text: "Really bad headache",
    expected: { symptom: 'headache', severity: 'severe' },
  },
  {
    text: "Slightly nauseated",
    expected: { symptom: 'nausea', severity: 'mild' },
  },
  {
    text: "Super exhausted",
    expected: { symptom: 'fatigue', severity: 'severe' },
  },

  // Comparative language
  {
    text: "Pain is worse than yesterday",
    expected: { symptom: 'pain', severity: 'severe' },
  },
  {
    text: "Feeling better than last week, just tired",
    expected: { symptom: 'fatigue', severity: 'mild' },
  },
  {
    text: "Headache is getting worse",
    expected: { symptom: 'headache', severity: 'severe' },
  },

  // Default severity by symptom type
  {
    text: "Crashed hard after grocery shopping",
    expected: { symptom: 'pem', severity: 'severe' },  // PEM defaults to severe
  },
  {
    text: "Having a flare",
    expected: { symptom: 'flare', severity: 'severe' },  // Flare defaults to severe
  },
  {
    text: "Just feeling tired",
    expected: { symptom: 'fatigue', severity: 'moderate' },  // Fatigue defaults to moderate
  },
  {
    text: "Brain fog is here",
    expected: { symptom: 'brain_fog', severity: 'moderate' },  // Brain fog defaults to moderate
  },

  // Multiple symptoms with different severities
  {
    text: "Extremely tired, a bit dizzy, and pain is 7/10",
    expected: [
      { symptom: 'fatigue', severity: 'severe' },
      { symptom: 'dizziness', severity: 'mild' },
      { symptom: 'pain', severity: 'severe' },
    ],
  },

  // ME/CFS specific - should all get severity
  {
    text: "PEM is hitting hard, brain fog, and heart racing",
    expected: [
      { symptom: 'pem', severity: 'severe' },
      { symptom: 'brain_fog', severity: 'moderate' },
      { symptom: 'palpitations', severity: 'moderate' },
    ],
  },
];

console.log('='.repeat(80));
console.log('ENHANCED SEVERITY DETECTION TEST');
console.log('='.repeat(80));

let passed = 0;
let failed = 0;

for (const testCase of testCases) {
  const result = extractSymptoms(testCase.text);

  console.log(`\n📝 Input: "${testCase.text}"`);
  console.log(`Found symptoms:`);

  for (const symptom of result.symptoms) {
    console.log(`  - ${symptom.symptom}: ${symptom.severity} (matched: "${symptom.matched}")`);
  }

  // Validate expectations
  const expected = testCase.expected;
  if (Array.isArray(expected)) {
    // Multiple symptoms expected
    let allMatch = true;
    for (const exp of expected) {
      const found = result.symptoms.find(s => s.symptom === exp.symptom);
      if (!found) {
        console.log(`  ❌ Expected symptom "${exp.symptom}" not found`);
        allMatch = false;
      } else if (found.severity !== exp.severity) {
        console.log(`  ❌ Expected "${exp.symptom}" severity "${exp.severity}", got "${found.severity}"`);
        allMatch = false;
      } else {
        console.log(`  ✅ "${exp.symptom}" has correct severity: ${exp.severity}`);
      }
    }
    if (allMatch) {
      passed++;
    } else {
      failed++;
    }
  } else {
    // Single symptom expected
    const found = result.symptoms.find(s => s.symptom === expected.symptom);
    if (!found) {
      console.log(`  ❌ Expected symptom "${expected.symptom}" not found`);
      failed++;
    } else if (found.severity !== expected.severity) {
      console.log(`  ❌ Expected severity "${expected.severity}", got "${found.severity}"`);
      failed++;
    } else {
      console.log(`  ✅ Correct severity: ${found.severity}`);
      passed++;
    }
  }
}

console.log('\n' + '='.repeat(80));
console.log(`RESULTS: ${passed} passed, ${failed} failed`);
console.log('='.repeat(80));

if (failed === 0) {
  console.log('\n🎉 All tests passed! Severity detection is working correctly.');
} else {
  console.log(`\n⚠️  ${failed} tests failed. Please review the severity detection logic.`);
}
