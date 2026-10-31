import { describe, expect, it } from 'vitest';
import {
  calculateSquareToRound,
  type SquareToRoundDimensions,
} from './square-to-round';

describe('square-to-round panel development', () => {
  const dimensions = {
    squareWidthMm: 200,
    roundDiameterMm: 100,
    heightMm: 150,
    maxDeviationMm: 1,
  };
  it.each([
    dimensions,
    {
      squareWidthMm: 200,
      roundDiameterMm: 199,
      heightMm: 5,
      maxDeviationMm: 1,
    },
    {
      squareWidthMm: 300,
      roundDiameterMm: 50,
      heightMm: 400,
      maxDeviationMm: 1,
    },
  ])('preserves every formed triangle edge for %o', (input) => {
    const result = calculateSquareToRound(input);
    for (const triangle of result.triangles) {
      for (let index = 0; index < 3; index++) {
        const from = triangle[index];
        const to = triangle[(index + 1) % 3];
        const a = result.formedPanels[0][from];
        const b = result.formedPanels[0][to];
        const p = result.flatVertices[from];
        const q = result.flatVertices[to];
        expect(Math.hypot(p.x - q.x, p.y - q.y)).toBeCloseTo(
          Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z),
          8,
        );
      }
    }
    expect(result.copies).toBe(4);
    expect(result.rimFacets % 8).toBe(0);
    expect(result.actualDeviationMm).toBeLessThanOrEqual(input.maxDeviationMm);
    expect(result.allowance).toBe('zero-allowance');
    expect(result.drawing.folds).toHaveLength(result.segmentsPerPanel);
    expect(result.drawing.outline[0].start).toEqual(
      result.drawing.outline.at(-1)!.end,
    );
    expect(result.drawing.labels!.map((label) => label.text)).toEqual([
      'A',
      'A',
      'M',
      'h',
      `3–${result.lastPointId}`,
    ]);
    expect(result.flatVertices[1].x - result.flatVertices[0].x).toBe(
      input.squareWidthMm,
    );
  });

  it('provides the midpoint-to-5 height and centered 3–7 construction span', () => {
    const result = calculateSquareToRound(dimensions);
    const [span, centerline] = result.drawing.construction!;
    const [one, two, three, , five, , seven] = result.flatVertices;
    expect(centerline.start).toEqual({
      x: (one.x + two.x) / 2,
      y: (one.y + two.y) / 2,
    });
    expect(centerline.end).toEqual(five);
    expect(centerline.start.x).toBe(five.x);
    expect(span.start).toEqual(three);
    expect(span.end).toEqual(seven);
    expect(three.y).toBeCloseTo(seven.y, 12);
    expect((three.x + seven.x) / 2).toBeCloseTo(centerline.start.x, 12);
    expect(
      result.drawing
        .measurements!.find((item) => item.id === 'h')!
        .value.toFixed(2),
    ).toBe('158.11');
    expect(
      result.drawing
        .measurements!.find((item) => item.id === '3–7')!
        .value.toFixed(2),
    ).toBe('76.65');
    expect(result.drawing.outline).toHaveLength(7);
    expect(result.drawing.folds).toHaveLength(4);
  });

  it.each([0.1, 1, 10])(
    'assembles matching panel seams with deviation %s',
    (maxDeviationMm) => {
      const result = calculateSquareToRound({ ...dimensions, maxDeviationMm });
      for (let index = 0; index < 4; index++) {
        const panel = result.formedPanels[index];
        const next = result.formedPanels[(index + 1) % 4];
        expect(panel[1].x).toBeCloseTo(next[0].x, 10);
        expect(panel[1].y).toBeCloseTo(next[0].y, 10);
        expect(panel.at(-1)!.x).toBeCloseTo(next[2].x, 10);
        expect(panel.at(-1)!.y).toBeCloseTo(next[2].y, 10);
      }
    },
  );

  it.each([
    'squareWidthMm',
    'roundDiameterMm',
    'heightMm',
    'maxDeviationMm',
  ] as const)('rejects invalid %s', (field: keyof SquareToRoundDimensions) => {
    for (const value of [0, -1, NaN, Infinity, -Infinity]) {
      expect(() =>
        calculateSquareToRound({ ...dimensions, [field]: value }),
      ).toThrow(RangeError);
    }
  });
  it.each([200, 201])(
    'rejects outlet %s at least as large as the square',
    (roundDiameterMm) => {
      expect(() =>
        calculateSquareToRound({ ...dimensions, roundDiameterMm }),
      ).toThrow(RangeError);
    },
  );
});

describe('automatic outlet segmentation', () => {
  const large = {
    squareWidthMm: 2000,
    roundDiameterMm: 1500,
    heightMm: 150,
    maxDeviationMm: 1,
  };
  it.each([0.1, 0.5, 1, 4, 20, 1500])(
    'meets %s mm with the smallest symmetric segment count',
    (maxDeviationMm) => {
      const result = calculateSquareToRound({ ...large, maxDeviationMm });
      const n = result.rimFacets;
      expect(n % 8).toBe(0);
      expect(result.actualDeviationMm).toBeLessThanOrEqual(maxDeviationMm);
      expect(result.actualDeviationMm).toBeCloseTo(
        750 * (1 - Math.cos(Math.PI / n)),
        10,
      );
      if (n > 8)
        expect(750 * (1 - Math.cos(Math.PI / (n - 8)))).toBeGreaterThan(
          maxDeviationMm,
        );
      expect(result.flatVertices).toHaveLength(n / 4 + 3);
      expect(result.drawing.folds).toHaveLength(n / 4);
      for (const triangle of result.triangles)
        for (let i = 0; i < 3; i++) {
          const a = triangle[i],
            b = triangle[(i + 1) % 3];
          const p = result.flatVertices[a],
            q = result.flatVertices[b];
          const v = result.formedPanels[0][a],
            w = result.formedPanels[0][b];
          expect(Math.hypot(p.x - q.x, p.y - q.y)).toBeCloseTo(
            Math.hypot(v.x - w.x, v.y - w.y, v.z - w.z),
            7,
          );
        }
    },
  );
  it('uses 64 segments for a 1500 mm outlet and 1 mm tolerance', () => {
    const result = calculateSquareToRound(large);
    expect(result.rimFacets).toBe(64);
    expect(result.segmentsPerPanel).toBe(16);
    expect(result.actualDeviationMm).toBeCloseTo(0.903407846, 8);
    expect(result.centerPointId).toBe(11);
    expect(result.lastPointId).toBe(19);
    expect(result.drawing.construction![0].end).toEqual(
      result.flatVertices[18],
    );
  });
  it('keeps segment count at the exact tolerance boundary and increases it below the boundary', () => {
    const boundary = large.roundDiameterMm * Math.sin(Math.PI / 128) ** 2;
    expect(
      calculateSquareToRound({ ...large, maxDeviationMm: boundary }).rimFacets,
    ).toBe(64);
    expect(
      calculateSquareToRound({
        ...large,
        maxDeviationMm: boundary * (1 - 1e-10),
      }).rimFacets,
    ).toBe(72);
  });
  it('rejects excessive resolution before allocating geometry', () => {
    expect(() =>
      calculateSquareToRound({ ...large, maxDeviationMm: 1e-12 }),
    ).toThrow(/1024/);
    expect(() =>
      calculateSquareToRound({ ...large, maxDeviationMm: Number.MIN_VALUE }),
    ).toThrow(/1024/);
  });
});

it('accepts the maximum supported resolution at its tolerance boundary', () => {
  const result = calculateSquareToRound({
    squareWidthMm: 2000,
    roundDiameterMm: 1500,
    heightMm: 150,
    maxDeviationMm: 1500 * Math.sin(Math.PI / 2048) ** 2,
  });
  expect(result.rimFacets).toBe(1024);
});
