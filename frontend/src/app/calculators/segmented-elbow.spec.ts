import { describe, expect, it } from 'vitest';
import { calculateSegmentedElbow as calc } from './segmented-elbow';
describe('G13 segmented elbow', () => {
  it('splits a four-piece bend into three equal joints', () => {
    const r = calc(60, 90, 90, 4);
    expect(r.jointDegrees).toBe(30);
    expect(r.offSquareDegrees).toBe(15);
    expect(r.pieces.map((p) => [p.startCut, p.endCut])).toEqual([
      ['square', 'miter'],
      ['miter', 'miter'],
      ['miter', 'miter'],
      ['miter', 'square'],
    ]);
    expect(r.pieces[1].insideMm).toBeCloseTo(180 * Math.tan(Math.PI / 12), 10);
  });
  it('mates the whole cut circumference and respects tangent throat radius', () => {
    const r = calc(60, 90, 90, 4);
    for (let i = 0; i < 3; i++)
      for (let j = 0; j <= 360; j++) {
        const a = r.surfacePoint(i, (j * Math.PI) / 180, true),
          b = r.surfacePoint(i + 1, (j * Math.PI) / 180, false);
        expect(Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z)).toBeLessThan(1e-10);
      }
    const incoming = r.surfacePoint(0, 0, false);
    const outgoing = r.surfacePoint(3, 0, true);
    expect(incoming).toEqual({ x: 0, y: 30, z: 0 });
    expect(outgoing.x).toBeCloseTo(90, 10);
    expect(outgoing.y).toBeCloseTo(120, 10);
    const larger = calc(60, 180, 90, 4);
    expect(larger.pieces[1].insideMm).toBeGreaterThan(r.pieces[1].insideMm);
    expect(larger.offSquareDegrees).toBe(r.offSquareDegrees);
  });
  it('accepts a 180° elbow and rejects insufficient pieces/radius', () => {
    expect(calc(60, 90, 180, 3).jointDegrees).toBe(90);
    expect(() => calc(60, 0, 90, 4)).toThrow();
    expect(() => calc(60, 90, 90, 2)).toThrow();
  });
});
