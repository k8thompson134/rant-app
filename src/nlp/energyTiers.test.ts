/**
 * Tests for energy tier inference
 */

import {
  extractPhysicalCapacity,
  extractCognitiveCapacity,
  extractOutcome,
  extractSensoryLoad,
  inferFunctionalCapacity,
  registerPhysicalSignal,
  registerCognitiveSignal,
  clearCustomSignals,
} from './energyTiers';

describe('Physical Capacity Extraction', () => {
  test('detects P-2 very severe signals', () => {
    const result = extractPhysicalCapacity('bedbound all day, cannot get up');
    expect(result?.tier).toBe('P-2');
    expect(result?.confidence).toBeGreaterThan(0.9);
  });

  test('detects P-1 severe signals', () => {
    const result = extractPhysicalCapacity('couldn\'t get off the couch today');
    expect(result?.tier).toBe('P1');
    expect(result?.confidence).toBeGreaterThan(0.9);
  });

  test('detects P0 mostly bedbound signals', () => {
    const result = extractPhysicalCapacity('couldn\'t move much, mostly lying down');
    expect(result?.tier).toBe('P0');
  });

  test('detects P2 home movement signals', () => {
    const result = extractPhysicalCapacity('made it to the kitchen for breakfast');
    expect(result?.tier).toBe('P2');
    expect(result?.confidence).toBeGreaterThan(0.9);
  });

  test('detects P3 light tasks signals', () => {
    const result = extractPhysicalCapacity('took a shower this morning');
    expect(result?.tier).toBe('P3');
    expect(result?.confidence).toBeGreaterThan(0.9);
  });

  test('detects P4 short errand signals', () => {
    const result = extractPhysicalCapacity('quick errand to the store');
    expect(result?.tier).toBe('P4');
    expect(result?.confidence).toBeGreaterThan(0.9);
  });

  test('detects P5 activity signals', () => {
    const result = extractPhysicalCapacity('went for a walk around the block');
    expect(result?.tier).toBe('P5');
    expect(result?.confidence).toBeGreaterThan(0.9);
  });

  test('detects P+ pacing signals', () => {
    const result = extractPhysicalCapacity('could have done more but paced myself');
    expect(result?.tier).toBe('P+');
    expect(result?.confidence).toBeGreaterThan(0.9);
  });

  test('distinguishes bath vs shower (standing tolerance)', () => {
    const bathResult = extractPhysicalCapacity('took a bath');
    const showerResult = extractPhysicalCapacity('took a shower');

    expect(bathResult?.tier).toBe('P2');
    expect(showerResult?.tier).toBe('P3');
  });

  test('returns null for no physical capacity indicators', () => {
    const result = extractPhysicalCapacity('had a good day overall');
    expect(result).toBeNull();
  });
});

describe('Cognitive Capacity Extraction', () => {
  test('detects C-1 non-verbal signals', () => {
    const result = extractCognitiveCapacity('can\'t process any language, everything overwhelming');
    expect(result?.tier).toBe('C-1');
  });

  test('detects C0 minimal processing signals', () => {
    const result = extractCognitiveCapacity('brain just shut down, couldn\'t handle anything');
    expect(result?.tier).toBe('C0');
    expect(result?.confidence).toBeGreaterThan(0.9);
  });

  test('detects C1 passive low-demand signals', () => {
    const result = extractCognitiveCapacity('just watched a comfort rewatch');
    expect(result?.tier).toBe('C1');
    expect(result?.confidence).toBeGreaterThan(0.9);
  });

  test('detects C2 active low-demand signals', () => {
    const result = extractCognitiveCapacity('spent the day doom scrolling');
    expect(result?.tier).toBe('C2');
    expect(result?.confidence).toBeGreaterThan(0.9);
  });

  test('detects C3 engaged consumption signals', () => {
    const result = extractCognitiveCapacity('watched a new show and followed the plot');
    expect(result?.tier).toBe('C3');
    expect(result?.confidence).toBeGreaterThan(0.9);
  });

  test('detects C4 productive work signals', () => {
    const result = extractCognitiveCapacity('got some work done on the project');
    expect(result?.tier).toBe('C4');
    expect(result?.confidence).toBeGreaterThan(0.9);
  });

  test('detects C4 studying signals', () => {
    const result = extractCognitiveCapacity('actually studied for a while');
    expect(result?.tier).toBe('C4');
    expect(result?.confidence).toBeGreaterThan(0.9);
  });

  test('detects C+ social/communicative signals', () => {
    const result = extractCognitiveCapacity('had a sustained conversation with a friend');
    expect(result?.tier).toBe('C+');
    expect(result?.confidence).toBeGreaterThan(0.9);
  });

  test('returns null for no cognitive capacity indicators', () => {
    const result = extractCognitiveCapacity('feeling okay today');
    expect(result).toBeNull();
  });
});

describe('Outcome Extraction', () => {
  test('detects completed without cost', () => {
    const result = extractOutcome('took a shower and felt fine');
    expect(result).toBe('completed');
  });

  test('detects completed with cost', () => {
    const result = extractOutcome('did the dishes but got totally wiped out after');
    expect(result).toBe('completed_cost');
  });

  test('detects attempted', () => {
    const result = extractOutcome('started tidying but had to stop halfway');
    expect(result).toBe('attempted');
  });

  test('detects unable', () => {
    const result = extractOutcome('wanted to take a shower but couldn\'t even get to the bathroom');
    expect(result).toBe('unable');
  });

  test('returns null for no outcome signals', () => {
    const result = extractOutcome('had a normal day');
    expect(result).toBeNull();
  });
});

describe('Sensory Load Extraction', () => {
  test('detects light sensitivity', () => {
    const result = extractSensoryLoad('lights were hurting my eyes all day');
    expect(result?.active).toBe(true);
    expect(result?.light).toBe(true);
    expect(result?.severity).toBe('elevated');
  });

  test('detects sound sensitivity', () => {
    const result = extractSensoryLoad('everything was too loud, had to put in earplugs');
    expect(result?.active).toBe(true);
    expect(result?.sound).toBe(true);
  });

  test('detects combined sensory overload', () => {
    const result = extractSensoryLoad('the restaurant was overwhelming, too much noise and light');
    expect(result?.active).toBe(true);
    expect(result?.combined).toBe(true);
  });

  test('detects smell sensitivity', () => {
    const result = extractSensoryLoad('couldn\'t handle any smells today');
    expect(result?.active).toBe(true);
    expect(result?.smell).toBe(true);
  });

  test('detects touch sensitivity', () => {
    const result = extractSensoryLoad('even light touch was painful, sheets hurt');
    expect(result?.active).toBe(true);
    expect(result?.touch).toBe(true);
  });

  test('detects multiple sensory flags', () => {
    const result = extractSensoryLoad('bright lights, loud noises, and everything felt too much');
    expect(result?.active).toBe(true);
    expect(result?.light).toBe(true);
    expect(result?.sound).toBe(true);
    expect(result?.severity).toBe('high');
  });

  test('returns null when no sensory issues', () => {
    const result = extractSensoryLoad('had a calm, quiet day');
    expect(result).toBeNull();
  });
});

describe('Full Functional Capacity Inference', () => {
  test('infers complete capacity from physical and cognitive', () => {
    const result = inferFunctionalCapacity('couch bound, just watched comfort rewatches');
    expect(result?.physical).toBe('P1');
    expect(result?.cognitive).toBe('C1');
  });

  test('includes outcome data', () => {
    const result = inferFunctionalCapacity('took a shower and was completely wiped out');
    expect(result?.physical).toBe('P3');
    expect(result?.outcome).toBe('completed_cost');
  });

  test('includes sensory load flag', () => {
    const result = inferFunctionalCapacity('walked around the house but lights were killing me');
    expect(result?.physical).toBe('P3');
    expect(result?.sensoryLoad?.active).toBe(true);
    expect(result?.sensoryLoad?.light).toBe(true);
  });

  test('includes activity being discussed', () => {
    const result = inferFunctionalCapacity('tried to do some work but brain fog was too bad');
    expect(result?.activity).toBe('work');
  });

  test('handles day with no energy data', () => {
    const result = inferFunctionalCapacity('just a regular day, nothing special');
    expect(result).toBeNull();
  });

  test('prioritizes higher-confidence physical matches', () => {
    const result = inferFunctionalCapacity('managed to make it to the kitchen but mostly stayed in bed');
    // Should pick "made it to the kitchen" (P2) over "stayed in bed" (P-1)
    expect(result?.physical).toBe('P2');
  });
});

describe('Edge Cases', () => {
  test('handles negation (not actually done)', () => {
    // "didn't shower" should not be extracted as P3
    const result = extractPhysicalCapacity("didn't shower today, too tired");
    expect(result?.tier).not.toBe('P3');
  });

  test('handles multiple activity types', () => {
    const result = inferFunctionalCapacity(
      'shower exhausted me, couldn\'t even do dishes after. just watched TV the rest of the day.'
    );
    expect(result).not.toBeNull();
    expect(result?.outcome).toBe('completed_cost');
  });

  test('handles mixed success (some activities possible, some not)', () => {
    const result = inferFunctionalCapacity(
      'could sit at desk for work but light sensitivity made it miserable'
    );
    expect(result?.physical).toBe('P2');
    expect(result?.cognitive).toBe('C4');
    expect(result?.sensoryLoad?.light).toBe(true);
  });
});

describe('Custom Signal Registration (Personal Anchors)', () => {
  afterEach(() => {
    clearCustomSignals();
  });

  test('registers and prioritizes custom physical signals', () => {
    registerPhysicalSignal('my special couch day', 'P1', 0.95);

    const result = extractPhysicalCapacity('had my special couch day today');
    expect(result?.tier).toBe('P1');
    expect(result?.confidence).toBe(0.95);
  });

  test('registers and prioritizes custom cognitive signals', () => {
    registerCognitiveSignal('brain all static', 'C0', 0.90);

    const result = extractCognitiveCapacity('brain all static today, couldn\'t do anything');
    expect(result?.tier).toBe('C0');
    expect(result?.confidence).toBe(0.90);
  });

  test('custom signals override defaults', () => {
    // Default shower = P3, but if user customizes it
    registerPhysicalSignal('shower', 'P2', 0.95);

    const result = extractPhysicalCapacity('took a shower');
    expect(result?.tier).toBe('P2'); // Uses custom
  });

  test('handles case-insensitive custom signals', () => {
    registerPhysicalSignal('COUCH PRISON', 'P0', 0.90);

    const result = extractPhysicalCapacity('been in couch prison all day');
    expect(result?.tier).toBe('P0');
  });

  test('multiple custom signals, highest confidence wins', () => {
    registerPhysicalSignal('feeling rough', 'P1', 0.80);
    registerPhysicalSignal('couch prison', 'P0', 0.95);

    const result = extractPhysicalCapacity('feeling rough and in couch prison');
    expect(result?.tier).toBe('P0');
    expect(result?.confidence).toBe(0.95);
  });
});
