import { describe, expect, it } from 'vitest';
import { calculateMiteredCorner } from './mitered-corner';

describe('G4 mitered pipe corner', () => {
  it('develops the 60 mm pipe and 60 degree worked example', () => {
    const result = calculateMiteredCorner({ diameterMm: 60, turnDegrees: 60 });
    expect(result.offSquareDegrees).toBe(30);
    expect(result.riseMm).toBeCloseTo(34.641016, 5);
    expect(result.wrapWidthMm).toBeCloseTo(188.495559, 5);
    expect(
      [0, 6, 12, 18, 24].map((index) => result.stations[index].riseMm),
    ).toEqual(expect.arrayContaining([0, result.riseMm]));
    expect(result.stations[6].riseMm).toBeCloseTo(result.riseMm / 2, 10);
    expect(result.stations[18].riseMm).toBeCloseTo(result.riseMm / 2, 10);
    expect(result.profile[0].y).toBeCloseTo(result.profile.at(-1)!.y, 12);
  });
  it('makes a diameter-high rise for a right-angle corner', () => {
    expect(
      calculateMiteredCorner({ diameterMm: 60, turnDegrees: 90 }).riseMm,
    ).toBeCloseTo(60, 12);
  });
  it.each([0, 180, NaN, Infinity])(
    'rejects excluded angle %s',
    (turnDegrees) => {
      expect(() =>
        calculateMiteredCorner({ diameterMm: 60, turnDegrees }),
      ).toThrow(RangeError);
    },
  );
  it('rejects a nonpositive diameter', () => {
    expect(() =>
      calculateMiteredCorner({ diameterMm: 0, turnDegrees: 60 }),
    ).toThrow(RangeError);
  });
});
