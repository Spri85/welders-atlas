import { describe, expect, it } from 'vitest';
import { calculateCenteredRoundReducer } from './centered-round-reducer';
import { arcPoints, drawingBounds } from './pattern-drawing';
import { layoutPatternTiles } from './pattern-tiles';

describe('full-scale pattern tiles', () => {
  const pattern = calculateCenteredRoundReducer({ inletDiameterMm: 200, outletDiameterMm: 100, axialLengthMm: 150 });
  const drawing = { outline: pattern.outline.segments };

  it.each(['a4', 'letter'] as const)('preserves scale and adjacent tile continuity on %s', (paper) => {
    const layout = layoutPatternTiles(drawing, paper);
    const [left, right] = layout.tiles;
    const point = { x: 100, y: 50 };
    const onLeft = left.project(point);
    const onRight = right.project(point);
    expect(onLeft.x - onRight.x).toBeCloseTo(layout.width - layout.overlap, 12);
    expect(onLeft.y).toBe(onRight.y);
    expect(left.project({ x: point.x + 50, y: point.y }).x - onLeft.x).toBeCloseTo(50, 12);
    const below = layout.tiles[layout.columns];
    expect(below.project(point).y - onLeft.y).toBeCloseTo(-(layout.height - layout.overlap), 12);
    expect(layout.tiles.at(-1)!.origin.x + layout.width).toBeGreaterThanOrEqual(drawingBounds(drawing).width + 10);
    expect(layout.tiles.at(-1)!.origin.y + layout.height).toBeGreaterThanOrEqual(drawingBounds(drawing).height + 10);
    expect(right.origin.x + 5).toBe(left.origin.x + layout.width - 5);
  });

  it.each([100, 199])('bounds arc approximation error below 0.01 mm for outlet %s', (outletDiameterMm) => {
    const result = calculateCenteredRoundReducer({ inletDiameterMm: 200, outletDiameterMm, axialLengthMm: 150 });
    for (const arc of [result.outline.segments[0], result.outline.segments[2]]) {
      const points = arcPoints(arc);
      expect(points[0]).toEqual(arc.start);
      expect(points.at(-1)).toEqual(arc.end);
      for (let index = 1; index < points.length; index++) {
        const midpoint = { x: (points[index - 1].x + points[index].x) / 2, y: (points[index - 1].y + points[index].y) / 2 };
        expect(arc.radiusMm - Math.hypot(midpoint.x - arc.center.x, midpoint.y - arc.center.y)).toBeLessThanOrEqual(0.01000001);
      }
    }
  });

  it('rejects a job that would exceed the page limit', () => {
    const huge = calculateCenteredRoundReducer({ inletDiameterMm: 200_000, outletDiameterMm: 100_000, axialLengthMm: 150_000 });
    expect(() => layoutPatternTiles({ outline: huge.outline.segments }, 'a4')).toThrow(RangeError);
  });
});
