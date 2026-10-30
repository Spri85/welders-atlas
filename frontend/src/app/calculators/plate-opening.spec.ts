import { describe, expect, it } from 'vitest';
import { calculatePlateOpening as calc } from './plate-opening';
describe('G11 angled opening', () => {
  it('calculates axes and thickness shift', () => {
    const r = calc(50, 20, 45, 0);
    expect(r.majorMm).toBeCloseTo(70.710678, 5);
    expect(r.minorMm).toBe(50);
    expect(r.shiftMm).toBeCloseTo(20, 10);
    expect(r.center.x).toBeCloseTo(20, 10);
  });
  it('handles a normal passage and each datum direction', () => {
    const r = calc(50, 20, 0, 90);
    expect(r.ellipse).toEqual(r.far);
    expect(r.majorMm).toBe(50);
    for (const d of [0, 90, 180, 270]) {
      const r = calc(50, 20, 45, d);
      expect(r.center.x).toBeCloseTo(20 * Math.cos((d * Math.PI) / 180), 10);
      expect(r.center.y).toBeCloseTo(20 * Math.sin((d * Math.PI) / 180), 10);
      const far = r.farDrawing.outline[0].start;
      expect(far.x).toBeCloseTo(-r.far[0].x, 10);
      expect(far.y).toBeCloseTo(r.far[0].y, 10);
    }
  });
  it('rejects excluded tilt endpoints and bad dimensions', () => {
    for (const tilt of [-1, 90, NaN])
      expect(() => calc(50, 20, tilt, 0)).toThrow();
    expect(() => calc(0, 20, 45, 0)).toThrow();
  });
});
