import { describe, expect, it } from 'vitest';
import { calculateFilletFiller as calc } from './fillet-filler';
const input = {
  legMm: 6,
  lengthMm: 1000,
  quantity: 1,
  densityGPerCm3: 7.85,
  reinforcementFactor: 1.2,
  efficiencyPercent: 95,
};
describe('G10 fillet filler', () => {
  it('calculates the worked example without intermediate rounding', () => {
    const r = calc(input);
    expect(r.areaMm2).toBeCloseTo(21.6, 10);
    expect(r.depositedKg).toBeCloseTo(0.16956, 10);
    expect(r.consumableKg).toBeCloseTo(0.178484210526, 10);
    expect(calc({ ...input, quantity: 2 }).consumableKg).toBe(
      r.consumableKg * 2,
    );
  });
  it('accepts full efficiency and distinguishes omitted from zero price', () => {
    expect(calc({ ...input, efficiencyPercent: 100 }).consumableKg).toBe(
      calc(input).depositedKg,
    );
    expect(calc(input).cost).toBeUndefined();
    expect(calc({ ...input, pricePerKg: 0 }).cost).toBe(0);
  });
  it('rejects bad estimating assumptions', () => {
    for (const patch of [
      { efficiencyPercent: 0 },
      { efficiencyPercent: 101 },
      { reinforcementFactor: 0.9 },
      { densityGPerCm3: NaN },
      { quantity: 1.5 },
      { pricePerKg: -1 },
    ])
      expect(() => calc({ ...input, ...patch })).toThrow();
  });
});
