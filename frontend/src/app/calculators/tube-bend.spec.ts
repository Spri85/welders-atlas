import { describe, expect, it } from 'vitest';
import { calculateTubeBend as calc } from './tube-bend';
describe('G15 continuous tube bend', () => {
  it('returns tangent setbacks, arc and stock', () => {
    const r = calc(200, 150, 90, 50);
    expect(r.setbackMm).toBeCloseTo(50, 10);
    expect(r.arcMm).toBeCloseTo(78.539816, 5);
    expect(r.stockMm).toBeCloseTo(328.539816, 5);
    expect(r.tangent1Mm).toBeCloseTo(150, 10);
  });
  it('mirrors marks on swapping legs and accepts exact setback', () => {
    const a = calc(200, 150, 90, 50),
      b = calc(150, 200, 90, 50);
    expect(a.stockMm).toBe(b.stockMm);
    expect(a.stockMm - a.tangent2Mm).toBeCloseTo(b.tangent1Mm, 10);
    expect(calc(a.setbackMm, 150, 90, 50).tangent1Mm).toBe(0);
  });
  it('rejects short legs and excluded angles', () => {
    expect(() => calc(20, 150, 90, 50)).toThrow();
    expect(() => calc(200, 150, 180, 50)).toThrow();
    expect(() => calc(200, 150, 0, 50)).toThrow();
  });
});
