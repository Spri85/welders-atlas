import { describe, expect, it } from 'vitest';
import { calculatePipeOffset } from './pipe-offset';

describe('G5 two-elbow offset', () => {
  it('returns the 150 mm shift worked example', () => {
    const result = calculatePipeOffset({
      shiftMm: 150,
      angleDegrees: 45,
      takeoffAMm: 30,
      takeoffBMm: 40,
    });
    expect(result.travelMm).toBeCloseTo(212.132034, 5);
    expect(result.advanceMm).toBeCloseTo(150, 10);
    expect(result.cutMm).toBeCloseTo(142.132034, 5);
  });
  it('supports zero straight and reports overlap', () => {
    const input = {
      shiftMm: 100,
      angleDegrees: 90,
      takeoffAMm: 50,
      takeoffBMm: 50,
    };
    expect(calculatePipeOffset(input).cutMm).toBe(0);
    expect(calculatePipeOffset(input).advanceMm).toBe(0);
    expect(calculatePipeOffset({ ...input, takeoffBMm: 51 }).overlapMm).toBe(1);
  });
  it('rejects a zero elbow angle and negative takeoff', () => {
    expect(() =>
      calculatePipeOffset({
        shiftMm: 100,
        angleDegrees: 0,
        takeoffAMm: 0,
        takeoffBMm: 0,
      }),
    ).toThrow(RangeError);
    expect(() =>
      calculatePipeOffset({
        shiftMm: 100,
        angleDegrees: 45,
        takeoffAMm: -1,
        takeoffBMm: 0,
      }),
    ).toThrow(RangeError);
  });
});
