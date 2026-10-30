import { describe, expect, it } from 'vitest';
import { calculateGasBudget as calc } from './gas-budget';
describe('G23 shielding gas', () => {
  it('includes every pre/postflow cycle and supply shortfall', () => {
    const r = calc(12, 20, 30, 1, 3, 250);
    expect(r.gasMinutes).toBe(22);
    expect(r.jobLitres).toBe(264);
    expect(r.balanceLitres).toBe(-14);
  });
  it('handles zero extensions, empty jobs and omitted supply', () => {
    expect(calc(12, 20, 30, 0, 0).jobLitres).toBe(240);
    expect(calc(12, 0, 0, 1, 3).jobLitres).toBe(0);
    expect(calc(12, 0, 1, 1, 3).jobLitres).toBeCloseTo(0.8, 10);
    expect(calc(12, 20, 30, 1, 3).balanceLitres).toBeUndefined();
  });
  it('rejects inconsistent jobs, fractional cycles and bad flow', () => {
    expect(() => calc(12, 20, 0, 1, 3)).toThrow();
    expect(() => calc(12, 20, 1.5, 1, 3)).toThrow();
    expect(() => calc(0, 20, 30, 1, 3)).toThrow();
  });
});
