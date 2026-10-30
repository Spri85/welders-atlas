import { describe, expect, it } from 'vitest';
import { calculateGateBars } from './gate-bars';
describe('G7 gate bars', () => {
  it('marks every bar from one datum', () => {
    const r = calculateGateBars(1000, 20, 5);
    expect(r.gapMm).toBe(150);
    expect(r.bars.map((b) => b.nearMm)).toEqual([150, 320, 490, 660, 830]);
    expect(r.bars.at(-1)!.nearMm + 20).toBe(850);
  });
  it('centers one bar and keeps fractional gaps unrounded', () => {
    expect(calculateGateBars(100, 20, 1).bars[0].centerMm).toBe(50);
    const r = calculateGateBars(100, 7, 6);
    expect(r.bars.at(-1)!.nearMm + 7 + r.gapMm).toBeCloseTo(100, 12);
  });
  it('rejects invalid counts and full openings', () => {
    for (const args of [
      [100, 20, 1.5],
      [100, 20, 5],
      [100, 21, 5],
      [NaN, 20, 2],
    ])
      expect(() =>
        calculateGateBars(...(args as [number, number, number])),
      ).toThrow(RangeError);
  });
});
