import { describe, expect, it } from 'vitest';
import { calculateCircularKerf as calc } from './circular-kerf';
describe('G18 circular kerf', () => {
  it('places the path on the scrap side', () => {
    expect(calc(50, 2, true, false).programmedMm).toBe(52);
    expect(calc(50, 2, false, false).programmedMm).toBe(48);
  });
  it('avoids double compensation and accepts zero kerf', () => {
    for (const disc of [true, false]) {
      expect(calc(50, 2, disc, true).programmedMm).toBe(50);
      expect(calc(50, 0, disc, false).referencePathMm).toBe(50);
    }
  });
  it('rejects nonpositive hole paths and negative kerf', () => {
    expect(() => calc(2, 2, false, false)).toThrow();
    expect(() => calc(50, -1, true, false)).toThrow();
    expect(() => calc(NaN, 2, true, false)).toThrow();
  });
});
