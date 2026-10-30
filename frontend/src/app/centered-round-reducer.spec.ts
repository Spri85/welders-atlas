import { describe, expect, it } from 'vitest';
import { calculateCenteredRoundReducer, type ReducerDimensions } from './centered-round-reducer';

const dimensions: ReducerDimensions = {
  inletDiameterMm: 200,
  outletDiameterMm: 100,
  axialLengthMm: 150,
};

describe('calculateCenteredRoundReducer', () => {
  it('returns the reference dimensions at display precision while retaining full precision', () => {
    const result = calculateCenteredRoundReducer(dimensions);

    expect(result.slantHeightMm.toFixed(2)).toBe('158.11');
    expect(result.outerRadiusMm.toFixed(2)).toBe('316.23');
    expect(result.innerRadiusMm.toFixed(2)).toBe('158.11');
    expect(result.sectorAngle.degrees.toFixed(2)).toBe('113.84');
    expect(result.slantHeightMm).toBe(Math.hypot(150, 50));
    expect(result.sectorAngle.radians).toBeCloseTo(result.sectorAngle.degrees * Math.PI / 180, 12);
  });

  it.each([100, 199])('preserves circumference and seam lengths for a 200 to %s mm reducer', (outletDiameterMm) => {
    const result = calculateCenteredRoundReducer({ ...dimensions, outletDiameterMm });
    const [outerArc, endSeam, innerArc, startSeam] = result.outline.segments;

    expect(outerArc.radiusMm * Math.abs(outerArc.sweepAngleRadians)).toBeCloseTo(Math.PI * 200, 9);
    expect(innerArc.radiusMm * Math.abs(innerArc.sweepAngleRadians)).toBeCloseTo(Math.PI * outletDiameterMm, 9);
    expect(outerArc.lengthMm).toBeCloseTo(Math.PI * 200, 9);
    expect(innerArc.lengthMm).toBeCloseTo(Math.PI * outletDiameterMm, 9);
    expect(outerArc.radiusMm).toBe(result.outerRadiusMm);
    expect(innerArc.radiusMm).toBe(result.innerRadiusMm);
    expect(outerArc.center).toEqual(innerArc.center);
    expect(outerArc.sweepAngleRadians).toBe(result.sectorAngle.radians);
    expect(innerArc.sweepAngleRadians).toBe(-result.sectorAngle.radians);

    for (const seam of [endSeam, startSeam]) {
      expect(Math.hypot(seam.end.x - seam.start.x, seam.end.y - seam.start.y))
        .toBeCloseTo(result.slantHeightMm, 9);
      expect(seam.lengthMm).toBe(result.slantHeightMm);
      expect(seam.seamId).toBe('seam');
    }

    for (const arc of [outerArc, innerArc]) {
      for (const [point, angle] of [
        [arc.start, arc.startAngleRadians],
        [arc.end, arc.startAngleRadians + arc.sweepAngleRadians],
      ] as const) {
        expect(point.x).toBeCloseTo(arc.center.x + arc.radiusMm * Math.cos(angle), 9);
        expect(point.y).toBeCloseTo(arc.center.y + arc.radiusMm * Math.sin(angle), 9);
      }
    }
  });

  it('returns a closed, dimensioned zero-allowance annular sector', () => {
    const { outline } = calculateCenteredRoundReducer(dimensions);

    expect(outline).toMatchObject({
      kind: 'annular-sector', units: 'mm', allowance: 'zero-allowance', closed: true,
    });
    expect(outline.segments.map((segment) => segment.kind)).toEqual(['arc', 'line', 'arc', 'line']);
    outline.segments.forEach((segment, index, segments) => {
      expect(segment.end).toEqual(segments[(index + 1) % segments.length].start);
    });
  });

  describe.each(['inletDiameterMm', 'outletDiameterMm', 'axialLengthMm'] as const)('%s validation', (field) => {
    it.each([0, -1, NaN, Infinity, -Infinity])('rejects %s', (value) => {
      expect(() => calculateCenteredRoundReducer({ ...dimensions, [field]: value }))
        .toThrow(RangeError);
    });
  });

  it.each([200, 201])('rejects an outlet diameter of %s mm for a 200 mm inlet', (outletDiameterMm) => {
    expect(() => calculateCenteredRoundReducer({ ...dimensions, outletDiameterMm }))
      .toThrow('Outlet diameter must be smaller than inlet diameter.');
  });

  it('rejects dimensions whose developed radii overflow', () => {
    expect(() => calculateCenteredRoundReducer({ ...dimensions, axialLengthMm: Number.MAX_VALUE }))
      .toThrow('Reducer pattern exceeds numeric range.');
  });
});
