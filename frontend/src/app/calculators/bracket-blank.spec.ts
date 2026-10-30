import { describe, expect, it } from 'vitest';
import { calculateBracketBlank as calc } from './bracket-blank';
const input = {
  leg1Mm: 50,
  leg2Mm: 30,
  thicknessMm: 2,
  insideRadiusMm: 3,
  bendDegrees: 90,
  allowance: { kFactor: 0.4 },
};
describe('G12 bracket blank', () => {
  it('returns the worked example and measured mode equivalence', () => {
    const r = calc(input);
    expect(r.allowanceMm).toBeCloseTo(5.969026, 5);
    expect(r.deductionMm).toBeCloseTo(4.030974, 5);
    expect(r.blankMm).toBeCloseTo(75.969026, 5);
    expect(r.centerMm).toBeCloseTo(47.984513, 5);
    expect(
      calc({ ...input, allowance: { measuredMm: r.allowanceMm } }).blankMm,
    ).toBe(r.blankMm);
  });
  it('allows zero inside radius and a flange exactly at setback', () => {
    expect(calc({ ...input, insideRadiusMm: 0 }).blankMm).toBeGreaterThan(0);
    const r = calc(input);
    expect(calc({ ...input, leg1Mm: r.setbackMm }).centerMm).toBe(
      r.allowanceMm / 2,
    );
  });
  it('rejects short flanges, impossible allowances and angle endpoints', () => {
    for (const patch of [
      { leg1Mm: 1 },
      { bendDegrees: 0 },
      { bendDegrees: 180 },
      { allowance: { kFactor: 1.1 } },
      { allowance: { measuredMm: 100 } },
    ])
      expect(() => calc({ ...input, ...patch })).toThrow();
  });
});
