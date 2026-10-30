import { describe, expect, it } from 'vitest';
import { calculateMeasuredRadius as calc } from './measured-radius';
describe('G16 chord radius', () => {
  it('calculates the worked example', () => {
    expect(calc(600, 50).radiusMm).toBe(925);
  });
  it('supports the semicircle boundary and shallow arcs', () => {
    const r = calc(200, 100);
    expect(r.radiusMm).toBe(100);
    expect(r.angleRadians).toBe(Math.PI);
    expect(r.arcMm).toBeCloseTo(314.159265, 5);
    expect(calc(600, 0.1).arcMm).toBeCloseTo(600, 2);
  });
  it('rejects zero and unsupported rises', () => {
    for (const h of [0, -1, 101, Infinity])
      expect(() => calc(200, h)).toThrow();
  });
});
