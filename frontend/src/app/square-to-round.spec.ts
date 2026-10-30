import { describe, expect, it } from 'vitest';
import { calculateSquareToRound, type SquareToRoundDimensions } from './square-to-round';

describe('square-to-round panel development', () => {
  const dimensions = { squareWidthMm: 200, roundDiameterMm: 100, heightMm: 150 };
  it.each([dimensions, { squareWidthMm: 200, roundDiameterMm: 199, heightMm: 5 }, { squareWidthMm: 300, roundDiameterMm: 50, heightMm: 400 }])('preserves every formed triangle edge for %o', (input) => {
    const result = calculateSquareToRound(input);
    for (const triangle of result.triangles) {
      for (let index = 0; index < 3; index++) {
        const from = triangle[index];
        const to = triangle[(index + 1) % 3];
        const a = result.formedPanels[0][from];
        const b = result.formedPanels[0][to];
        const p = result.flatVertices[from];
        const q = result.flatVertices[to];
        expect(Math.hypot(p.x - q.x, p.y - q.y)).toBeCloseTo(Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z), 8);
      }
    }
    expect(result.copies).toBe(4);
    expect(result.rimFacets).toBe(16);
    expect(result.allowance).toBe('zero-allowance');
    expect(result.drawing.folds).toHaveLength(4);
    expect(result.drawing.outline[0].start).toEqual(result.drawing.outline.at(-1)!.end);
    expect(result.drawing.labels!.map((label) => label.text)).toEqual(['A', 'A']);
    expect(result.flatVertices[1].x - result.flatVertices[0].x).toBe(input.squareWidthMm);
  });

  it('assembles four identical panels around the same square and 16-sided rim', () => {
    const result = calculateSquareToRound(dimensions);
    for (let index = 0; index < 4; index++) {
      const panel = result.formedPanels[index];
      const next = result.formedPanels[(index + 1) % 4];
      expect(panel[1].x).toBeCloseTo(next[0].x, 10);
      expect(panel[1].y).toBeCloseTo(next[0].y, 10);
      expect(panel[6].x).toBeCloseTo(next[2].x, 10);
      expect(panel[6].y).toBeCloseTo(next[2].y, 10);
    }
  });

  it.each(['squareWidthMm', 'roundDiameterMm', 'heightMm'] as const)('rejects invalid %s', (field: keyof SquareToRoundDimensions) => {
    for (const value of [0, -1, NaN, Infinity, -Infinity]) {
      expect(() => calculateSquareToRound({ ...dimensions, [field]: value })).toThrow(RangeError);
    }
  });
  it.each([200, 201])('rejects outlet %s at least as large as the square', (roundDiameterMm) => {
    expect(() => calculateSquareToRound({ ...dimensions, roundDiameterMm })).toThrow(RangeError);
  });
});
