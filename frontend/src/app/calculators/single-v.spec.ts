import { describe, expect, it } from 'vitest';
import { calculateSingleV as calc } from './single-v';
describe('G22 single-V prep', () => {
  it('returns depth, setback and unrounded mouth', () => {
    const r = calc(12, 2, 2, 60);
    expect(r.depthMm).toBe(10);
    expect(r.setbackMm).toBeCloseTo(5.77350269, 7);
    expect(r.mouthMm).toBeCloseTo(13.54700538, 7);
    expect(r.halfDegrees).toBe(30);
  });
  it('accepts zero face and opening', () => {
    const r = calc(12, 0, 0, 60);
    expect(r.depthMm).toBe(12);
    expect(r.mouthMm).toBe(r.setbackMm * 2);
  });
  it('rejects a full-thickness face and excluded angles', () => {
    expect(() => calc(12, 12, 2, 60)).toThrow();
    expect(() => calc(12, 2, 2, 180)).toThrow();
    expect(() => calc(12, 2, -1, 60)).toThrow();
  });
});
