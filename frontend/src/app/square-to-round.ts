import type { PatternPoint, Point3 } from './pattern-geometry';
import type { PatternDrawing } from './pattern-drawing';

export interface SquareToRoundDimensions {
  squareWidthMm: number;
  roundDiameterMm: number;
  heightMm: number;
}

/** Locate the next developed vertex from its two true triangle-edge lengths. */
function unfold(anchor: PatternPoint, previous: PatternPoint, radius: number, chord: number, side: number): PatternPoint {
  const distance = Math.hypot(previous.x - anchor.x, previous.y - anchor.y);
  const along = (radius * radius - chord * chord + distance * distance) / (2 * distance);
  const across = Math.sqrt(Math.max(0, radius * radius - along * along));
  const dx = (previous.x - anchor.x) / distance;
  const dy = (previous.y - anchor.y) / distance;
  return { x: anchor.x + along * dx - side * across * dy, y: anchor.y + along * dy + side * across * dx };
}

export function calculateSquareToRound(dimensions: SquareToRoundDimensions) {
  const { squareWidthMm, roundDiameterMm, heightMm } = dimensions;
  if (!Object.values(dimensions).every((value) => Number.isFinite(value) && value > 0)) {
    throw new RangeError('Dimensions must be finite and positive.');
  }
  if (roundDiameterMm >= squareWidthMm) throw new RangeError('Round outlet must be smaller than square inlet.');
  const half = squareWidthMm / 2;
  const radius = roundDiameterMm / 2;
  const formed: Point3[] = [
    { x: -half, y: -half, z: 0 }, { x: half, y: -half, z: 0 },
    ...Array.from({ length: 5 }, (_, index) => {
      const angle = -3 * Math.PI / 4 + index * Math.PI / 8;
      return { x: radius * Math.cos(angle), y: radius * Math.sin(angle), z: heightMm };
    }),
  ];
  const flat: PatternPoint[] = [
    { x: -half, y: 0 }, { x: half, y: 0 },
    { x: 0, y: 0 }, { x: 0, y: 0 },
    { x: 0, y: Math.hypot(heightMm, half - radius) },
    { x: 0, y: 0 }, { x: 0, y: 0 },
  ];
  const distance = (a: Point3, b: Point3) => Math.hypot(a.x - b.x, a.y - b.y, a.z - b.z);
  for (const [anchor, previous, next, side] of [[0, 4, 3, 1], [0, 3, 2, 1], [1, 4, 5, -1], [1, 5, 6, -1]]) {
    flat[next] = unfold(flat[anchor], flat[previous], distance(formed[anchor], formed[next]), distance(formed[previous], formed[next]), side);
  }
  if (!flat.every((point) => Number.isFinite(point.x) && Number.isFinite(point.y))) throw new RangeError('Pattern exceeds numeric range.');
  const triangles: readonly (readonly [number, number, number])[] = [[0, 1, 4], [0, 4, 3], [0, 3, 2], [1, 4, 5], [1, 5, 6]];
  const edge = (from: number, to: number) => ({ kind: 'line' as const, start: flat[from], end: flat[to] });
  const perimeter = [0, 1, 6, 5, 4, 3, 2];
  const foldPairs = [[0, 4], [0, 3], [1, 4], [1, 5]] as const;
  const midpoint = { x: (flat[0].x + flat[1].x) / 2, y: (flat[0].y + flat[1].y) / 2 };
  const drawing: PatternDrawing = {
    outline: perimeter.map((from, index) => edge(from, perimeter[(index + 1) % perimeter.length])),
    folds: foldPairs.map(([from, to]) => edge(from, to)),
    construction: [edge(2, 6), { kind: 'line', start: midpoint, end: flat[4] }],
    labels: [
      ...([[0, 2, '3–1'], [1, 6, '2–7']] as const).map(([from, to, measurementId]) => ({ text: 'A', measurementId, point: { x: (flat[from].x + flat[to].x) / 2, y: (flat[from].y + flat[to].y) / 2 } })),
      { text: 'M', point: midpoint },
      { text: 'h', measurementId: 'h', point: { x: midpoint.x + 2, y: flat[4].y / 2 } },
      { text: '3–7', measurementId: '3–7', point: { x: midpoint.x, y: flat[4].y * 0.84 }, align: 'center' },
    ],
    vertices: flat.map((point, index) => ({ id: String(index + 1), point })),
    coordinatePoints: [...flat.map((point, index) => ({ id: String(index + 1), point })), { id: 'M', point: midpoint }],
    measurements: [
      { id: 'Hflat', kind: 'height', unit: 'mm', value: Math.max(...flat.map((p) => p.y)) - Math.min(...flat.map((p) => p.y)) },
      ...perimeter.map((from, index) => {
        const to = perimeter[(index + 1) % perimeter.length];
        return { id: `${from + 1}–${to + 1}`, kind: 'edge' as const, unit: 'mm' as const, value: Math.hypot(flat[to].x - flat[from].x, flat[to].y - flat[from].y) };
      }),
      ...foldPairs.map(([from, to]) => ({
        id: `${from + 1}–${to + 1}`, kind: 'fold' as const, unit: 'mm' as const,
        value: Math.hypot(flat[to].x - flat[from].x, flat[to].y - flat[from].y),
      })),
      { id: 'h', kind: 'construction', unit: 'mm', value: Math.hypot(flat[4].x - midpoint.x, flat[4].y - midpoint.y) },
      { id: '3–7', kind: 'construction', unit: 'mm', value: Math.hypot(flat[6].x - flat[2].x, flat[6].y - flat[2].y) },
    ],
  };
  const formedPanels = Array.from({ length: 4 }, (_, index) => formed.map((point) => ({
    x: point.x * Math.cos(index * Math.PI / 2) - point.y * Math.sin(index * Math.PI / 2),
    y: point.x * Math.sin(index * Math.PI / 2) + point.y * Math.cos(index * Math.PI / 2),
    z: point.z,
  })));
  return { allowance: 'zero-allowance' as const, copies: 4, rimFacets: 16, flatVertices: flat, formedPanels, triangles, drawing };
}
