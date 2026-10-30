import { describe, expect, it } from 'vitest';
import { calculateRectangularFrame } from './rectangular-frame';

describe('G6 rectangular frame', () => {
  const input = {
    widthMm: 800,
    heightMm: 600,
    tubeWidthMm: 30,
    corner: 'butt' as const,
  };
  it('returns the cut list, diagonal and end clearances', () => {
    const result = calculateRectangularFrame(input);
    expect(result.cuts.map((cut) => cut.longPointMm)).toEqual([800, 540]);
    expect(result.targetDiagonalMm).toBe(1000);
    expect(
      calculateRectangularFrame({ ...input, gapMm: 2 }).cuts[1].longPointMm,
    ).toBe(536);
    expect(
      calculateRectangularFrame({ ...input, corner: 'miter' }).cuts.map(
        (cut) => cut.shortPointMm,
      ),
    ).toEqual([740, 540]);
  });
  it('compares both measured diagonals', () => {
    const result = calculateRectangularFrame({
      ...input,
      measuredDiagonalAMm: 998,
      measuredDiagonalBMm: 1002,
    });
    expect(result.measuredDifferenceMm).toBe(4);
    expect(result.deviationAMm).toBe(-2);
    expect(result.deviationBMm).toBe(2);
  });
  it('rejects insufficient opening and an incomplete diagonal pair', () => {
    expect(() => calculateRectangularFrame({ ...input, widthMm: 60 })).toThrow(
      RangeError,
    );
    expect(() =>
      calculateRectangularFrame({ ...input, measuredDiagonalAMm: 1000 }),
    ).toThrow(RangeError);
    expect(() => calculateRectangularFrame({ ...input, gapMm: 270 })).toThrow(
      RangeError,
    );
  });
});
