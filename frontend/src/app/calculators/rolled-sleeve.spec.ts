import { describe, expect, it } from 'vitest';
import { calculateRolledSleeve as calc } from './rolled-sleeve';
describe('G14 sleeve blank', () => {
  it('resolves outside and inside diameters identically', () => {
    const r = calc(200, true, 2, 100, 0.5);
    expect(r.cutLengthMm).toBeCloseTo(622.035345, 5);
    expect(calc(196, false, 2, 100, 0.5).cutLengthMm).toBe(r.cutLengthMm);
    expect(calc(200, true, 2, 100, 0.5, 5).cutLengthMm).toBe(r.cutLengthMm + 5);
  });
  it('allows neutral-axis endpoints and zero allowance', () => {
    expect(calc(200, true, 2, 100, 0).neutralMm).toBe(196);
    expect(calc(200, true, 2, 100, 1).neutralMm).toBe(200);
  });
  it('rejects insufficient diameter and invalid fractions', () => {
    expect(() => calc(4, true, 2, 100, 0.5)).toThrow();
    expect(() => calc(200, true, 2, 100, 1.1)).toThrow();
    expect(() => calc(200, true, 2, 100, 0.5, -1)).toThrow();
  });
});
