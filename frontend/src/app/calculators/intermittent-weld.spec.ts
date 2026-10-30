import { describe, expect, it } from 'vitest';
import { calculateIntermittentWeld as calc } from './intermittent-weld';
describe('G21 intermittent weld', () => {
  it('marks the specified pitch without rounding drift', () => {
    const r = calc(350, 10, 30, 100, 10);
    expect(r.segments.map((s) => [s.startMm, s.endMm])).toEqual([
      [10, 40],
      [110, 140],
      [210, 240],
      [310, 340],
    ]);
    expect(r.totalWeldMm).toBe(120);
    expect(r.endClearanceMm).toBe(10);
    expect(r.clearanceMatches).toBe(true);
  });
  it('includes exact boundary segments and zero-fit jobs', () => {
    expect(calc(340, 10, 30, 100).count).toBe(4);
    expect(calc(20, 10, 30, 100).count).toBe(0);
    expect(calc(350, 10, 30, 100, 11).clearanceMatches).toBe(false);
    expect(calc(350, 10, 30, 100, 11).segments[1].startMm).toBe(110);
  });
  it('rejects negative starts and continuous/overlapping pitch', () => {
    expect(() => calc(350, -1, 30, 100)).toThrow();
    expect(() => calc(350, 10, 30, 30)).toThrow();
  });
});
