import { describe, expect, it } from 'vitest';
import { calculateArcEnergy as calc } from './arc-energy';
describe('G24 steady arc energy', () => {
  it('returns arc and effective energy separately', () => {
    const r = calc(24, 200, 300, 0.8);
    expect(r.arcKjPerMm).toBe(0.96);
    expect(r.effectiveKjPerMm).toBe(0.768);
    const b = calc(24, 200, 600, 0.8);
    expect(b.arcKjPerMm).toBe(r.arcKjPerMm / 2);
    expect(b.effectiveKjPerMm).toBe(r.effectiveKjPerMm! / 2);
  });
  it('keeps arc energy without efficiency and allows full efficiency', () => {
    expect(calc(24, 200, 300).effectiveKjPerMm).toBeUndefined();
    expect(calc(24, 200, 300, 1).effectiveKjPerMm).toBe(0.96);
  });
  it('rejects zero speed and efficiencies outside (0,1]', () => {
    expect(() => calc(24, 200, 0)).toThrow();
    for (const e of [0, -1, 1.01, NaN])
      expect(() => calc(24, 200, 300, e)).toThrow();
  });
});
