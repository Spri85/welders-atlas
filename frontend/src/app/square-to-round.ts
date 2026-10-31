import type { PatternPoint, Point3 } from './pattern-geometry';
import type { PatternDrawing } from './pattern-drawing';

export interface SquareToRoundDimensions {
  squareWidthMm: number;
  roundDiameterMm: number;
  heightMm: number;
  maxDeviationMm: number;
}

/** Locate the next developed vertex from its two true triangle-edge lengths. */
function unfold(
  anchor: PatternPoint,
  previous: PatternPoint,
  radius: number,
  chord: number,
  side: number,
): PatternPoint {
  const distance = Math.hypot(previous.x - anchor.x, previous.y - anchor.y);
  const along =
    (radius * radius - chord * chord + distance * distance) / (2 * distance);
  const across = Math.sqrt(Math.max(0, radius * radius - along * along));
  const dx = (previous.x - anchor.x) / distance;
  const dy = (previous.y - anchor.y) / distance;
  return {
    x: anchor.x + along * dx - side * across * dy,
    y: anchor.y + along * dy + side * across * dx,
  };
}

export function calculateSquareToRound(dimensions: SquareToRoundDimensions) {
  const { squareWidthMm, roundDiameterMm, heightMm, maxDeviationMm } =
    dimensions;
  if (
    !Object.values(dimensions).every(
      (value) => Number.isFinite(value) && value > 0,
    )
  ) {
    throw new RangeError('Dimensions must be finite and positive.');
  }
  if (roundDiameterMm >= squareWidthMm)
    throw new RangeError('Round outlet must be smaller than square inlet.');
  const half = squareWidthMm / 2;
  const radius = roundDiameterMm / 2;
  // D·sin²(π/(2N)) avoids cancellation when the requested deviation is small.
  const deviation = (count: number) =>
    roundDiameterMm * Math.sin(Math.PI / (2 * count)) ** 2;
  let rimFacets = Math.max(
    8,
    8 *
      Math.floor(
        Math.PI /
          (16 *
            Math.asin(
              Math.sqrt(Math.min(1, maxDeviationMm / roundDiameterMm)),
            )),
      ),
  );
  if (!Number.isFinite(rimFacets) || rimFacets > 1024)
    throw new RangeError(
      'Requested deviation requires more than 1024 segments.',
    );
  while (rimFacets > 8 && deviation(rimFacets - 8) <= maxDeviationMm)
    rimFacets -= 8;
  if (deviation(rimFacets) > maxDeviationMm) rimFacets += 8;
  if (!Number.isFinite(rimFacets) || rimFacets > 1024)
    throw new RangeError(
      'Requested deviation requires more than 1024 segments.',
    );
  const segmentsPerPanel = rimFacets / 4;
  const center = 2 + segmentsPerPanel / 2;
  const last = 2 + segmentsPerPanel;
  const spanId = `3–${last + 1}`;
  const formed: Point3[] = [
    { x: -half, y: -half, z: 0 },
    { x: half, y: -half, z: 0 },
    ...Array.from({ length: segmentsPerPanel + 1 }, (_, index) => {
      const angle = (-3 * Math.PI) / 4 + (index * 2 * Math.PI) / rimFacets;
      return {
        x: radius * Math.cos(angle),
        y: radius * Math.sin(angle),
        z: heightMm,
      };
    }),
  ];
  const flat: PatternPoint[] = formed.map(() => ({ x: 0, y: 0 }));
  flat[0] = { x: -half, y: 0 };
  flat[1] = { x: half, y: 0 };
  flat[center] = { x: 0, y: Math.hypot(heightMm, half - radius) };
  const distance = (a: Point3, b: Point3) =>
    Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
  const triangles: [number, number, number][] = [[0, 1, center]];
  const foldPairs: [number, number][] = [];
  for (const [anchor, side] of [
    [0, 1],
    [1, -1],
  ]) {
    for (let step = 1; step <= segmentsPerPanel / 2; step++) {
      const previous = center - side * (step - 1);
      const next = center - side * step;
      flat[next] = unfold(
        flat[anchor],
        flat[previous],
        distance(formed[anchor], formed[next]),
        distance(formed[previous], formed[next]),
        side,
      );
      triangles.push([anchor, previous, next]);
      foldPairs.push([anchor, previous]);
    }
  }
  if (
    !flat.every((point) => Number.isFinite(point.x) && Number.isFinite(point.y))
  )
    throw new RangeError('Pattern exceeds numeric range.');
  const edge = (from: number, to: number) => ({
    kind: 'line' as const,
    start: flat[from],
    end: flat[to],
  });
  const perimeter = [
    0,
    1,
    ...Array.from({ length: segmentsPerPanel + 1 }, (_, i) => last - i),
  ];
  const midpoint = {
    x: (flat[0].x + flat[1].x) / 2,
    y: (flat[0].y + flat[1].y) / 2,
  };
  const drawing: PatternDrawing = {
    outline: perimeter.map((from, index) =>
      edge(from, perimeter[(index + 1) % perimeter.length]),
    ),
    folds: foldPairs.map(([from, to]) => edge(from, to)),
    construction: [
      edge(2, last),
      { kind: 'line', start: midpoint, end: flat[center] },
    ],
    labels: [
      ...(
        [
          [0, 2, '3–1'],
          [1, last, `2–${last + 1}`],
        ] as const
      ).map(([from, to, measurementId]) => ({
        text: 'A',
        measurementId,
        point: {
          x: (flat[from].x + flat[to].x) / 2,
          y: (flat[from].y + flat[to].y) / 2,
        },
      })),
      { text: 'M', point: midpoint },
      {
        text: 'h',
        measurementId: 'h',
        point: { x: midpoint.x + 2, y: flat[center].y / 2 },
      },
      {
        text: spanId,
        measurementId: spanId,
        point: { x: midpoint.x, y: flat[2].y },
        align: 'center',
      },
    ],
    vertices: flat.map((point, index) => ({ id: String(index + 1), point })),
    coordinatePoints: [
      ...flat.map((point, index) => ({ id: String(index + 1), point })),
      { id: 'M', point: midpoint },
    ],
    measurements: [
      {
        id: 'Hflat',
        kind: 'height',
        unit: 'mm',
        value:
          Math.max(...flat.map((p) => p.y)) - Math.min(...flat.map((p) => p.y)),
      },
      ...perimeter.map((from, index) => {
        const to = perimeter[(index + 1) % perimeter.length];
        return {
          id: `${from + 1}–${to + 1}`,
          kind: 'edge' as const,
          unit: 'mm' as const,
          value: Math.hypot(
            flat[to].x - flat[from].x,
            flat[to].y - flat[from].y,
          ),
        };
      }),
      ...foldPairs.map(([from, to]) => ({
        id: `${from + 1}–${to + 1}`,
        kind: 'fold' as const,
        unit: 'mm' as const,
        value: Math.hypot(flat[to].x - flat[from].x, flat[to].y - flat[from].y),
      })),
      {
        id: 'h',
        kind: 'construction',
        unit: 'mm',
        value: Math.hypot(
          flat[center].x - midpoint.x,
          flat[center].y - midpoint.y,
        ),
      },
      {
        id: spanId,
        kind: 'construction',
        unit: 'mm',
        value: Math.hypot(flat[last].x - flat[2].x, flat[last].y - flat[2].y),
      },
    ],
  };
  const formedPanels = Array.from({ length: 4 }, (_, index) =>
    formed.map((point) => ({
      x:
        point.x * Math.cos((index * Math.PI) / 2) -
        point.y * Math.sin((index * Math.PI) / 2),
      y:
        point.x * Math.sin((index * Math.PI) / 2) +
        point.y * Math.cos((index * Math.PI) / 2),
      z: point.z,
    })),
  );
  return {
    allowance: 'zero-allowance' as const,
    copies: 4,
    rimFacets,
    segmentsPerPanel,
    actualDeviationMm: deviation(rimFacets),
    centerPointId: center + 1,
    lastPointId: last + 1,
    flatVertices: flat,
    formedPanels,
    triangles,
    drawing,
  };
}
