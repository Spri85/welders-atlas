import { describe, expect, it } from 'vitest';
import { calculateSquareTransition as calc } from './square-transition';
describe('G25 square transition', () => {
  it('matches flat seams to 3D corners and recovers both perimeters', () => {
    const r = calc(300, 180, 80);
    expect(r.insetMm).toBe(60);
    expect(r.faceHeightMm).toBe(100);
    expect(r.seamMm).toBeCloseTo(116.619038, 5);
    for (let i = 0; i < 4; i++) {
      const a = r.inlet[i],
        b = r.outlet[i];
      expect(Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z)).toBeCloseTo(
        r.seamMm,
        10,
      );
    }
    expect(r.drawing.outline[0].end.x - r.drawing.outline[0].start.x).toBe(300);
    expect(4 * 300).toBe(1200);
    expect(
      4 * Math.abs(r.drawing.outline[2].end.x - r.drawing.outline[2].start.x),
    ).toBe(720);
    expect(r.allowance).toBe('zero');
  });
  it('supports expanders and equal sides', () => {
    const a = calc(300, 180, 80),
      b = calc(180, 300, 80);
    expect(b.seamMm).toBe(a.seamMm);
    const c = calc(200, 200, 80);
    expect(c.faceHeightMm).toBe(80);
    expect(c.seamMm).toBe(80);
    expect(c.drawing.outline[0].start.x).toBe(c.drawing.outline[3].start.x);
  });
  it('rejects zero, negative and nonfinite inputs', () => {
    for (const n of [0, -1, NaN, Infinity]) {
      expect(() => calc(n, 180, 80)).toThrow();
      expect(() => calc(300, n, 80)).toThrow();
      expect(() => calc(300, 180, n)).toThrow();
    }
  });
});
