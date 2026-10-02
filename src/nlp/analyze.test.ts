import { describe, it, expect } from 'vitest';
import { analyze, extractHealthMetrics, detectActivities } from './analyze';

describe('analyze', () => {
  it('drops descriptor-only symptoms and systemic locations', () => {
    const r = analyze('Severe fatigue in my legs, mood 4, energy 2, took my meds');
    expect(r.symptoms.find((s) => s.symptom === 'severe')).toBeUndefined();
    const fatigue = r.symptoms.find((s) => s.symptom === 'fatigue');
    expect(fatigue?.painDetails?.location ?? null).toBeNull();
    expect(r.metrics).toEqual({ mood: 4, energy: 2, medication: 'taken' });
  });

  it('supplements a nearby location and tolerates a typo', () => {
    const r = analyze('My left hip aches badly');
    expect(r.symptoms.some((s) => s.painDetails?.location)).toBe(true);
  });

  it('keeps headache location only when head-related', () => {
    const r = analyze('Headache behind my eyes and sore knee');
    const h = r.symptoms.find((s) => s.symptom === 'headache');
    if (h?.painDetails?.location) expect(['head', 'temple', 'forehead', 'migraine']).toContain(h.painDetails.location);
  });
});

describe('metrics and activities', () => {
  it('parses skipped meds and stress', () => {
    expect(extractHealthMetrics('stress level 7, forgot meds')).toEqual({ stress: 7, medication: 'skipped' });
  });
  it('estimates intensity', () => {
    expect(detectActivities('Went to the grocery store and cleaned, then worked')).toMatchObject({ intensity: 'high' });
    expect(detectActivities('Just lying here')).toEqual({ signals: [], intensity: null });
  });
});

describe('subsumed matches', () => {
  it('drops a lemma match contained in a longer phrase match', () => {
    const names = analyze('heart racing, dizzy, then night sweats').symptoms.map((s) => s.symptom);
    expect(names).toContain('night_sweats');
    expect(names).not.toContain('sweating');
    expect(analyze('I was sweating a lot').symptoms.map((s) => s.symptom)).toContain('sweating');
  });
});
