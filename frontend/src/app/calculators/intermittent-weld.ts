import {
  finiteResult,
  integer,
  nonnegative,
  positive,
  requireCondition,
} from './validation';
import { line, rectangle } from './drawings';
import type { PatternDrawing } from '../pattern-drawing';
export function calculateIntermittentWeld(
  jointMm: number,
  firstStartMm: number,
  segmentMm: number,
  pitchMm: number,
  requiredClearanceMm?: number,
) {
  positive(jointMm, segmentMm, pitchMm);
  nonnegative(firstStartMm);
  requireCondition(pitchMm > segmentMm);
  if (requiredClearanceMm !== undefined) nonnegative(requiredClearanceMm);
  const tolerance = 1e-10 * Math.max(1, jointMm);
  const available = jointMm - firstStartMm - segmentMm;
  const count =
    available < -tolerance
      ? 0
      : Math.floor((available + tolerance) / pitchMm) + 1;
  integer(count, 0);
  const segments = Array.from({ length: count }, (_, i) => ({
    id: String(i + 1),
    startMm: firstStartMm + i * pitchMm,
    endMm: firstStartMm + i * pitchMm + segmentMm,
  }));
  const totalWeldMm = count * segmentMm;
  const endClearanceMm = count
    ? Math.max(0, jointMm - segments.at(-1)!.endMm)
    : jointMm;
  const clearanceMatches =
    requiredClearanceMm === undefined
      ? undefined
      : Math.abs(endClearanceMm - requiredClearanceMm) <= tolerance;
  finiteResult(totalWeldMm, endClearanceMm);
  const h = jointMm / 40;
  const contours = segments.map((s) =>
    rectangle(segmentMm, h).outline.map((e) => ({
      ...e,
      start: { x: e.start.x + s.startMm, y: e.start.y },
      end: { x: e.end.x + s.startMm, y: e.end.y },
    })),
  );
  const drawing: PatternDrawing = {
    closed: false,
    outline: [line({ x: 0, y: 0 }, { x: jointMm, y: 0 })],
    contours,
    construction: [
      line({ x: 0, y: -h }, { x: 0, y: h }),
      line({ x: jointMm, y: -h }, { x: jointMm, y: h }),
    ],
    labels: [
      { text: 'J', point: { x: jointMm / 2, y: -h } },
      ...(count
        ? [
            { text: 'ℓ', point: { x: firstStartMm + segmentMm / 2, y: 4 * h } },
            ...(firstStartMm > 0
              ? [{ text: 's₀', point: { x: firstStartMm / 2, y: -2 * h } }]
              : []),
            ...(count > 1
              ? [
                  {
                    text: 'p',
                    point: { x: firstStartMm + pitchMm / 2, y: -h / 2 },
                  },
                ]
              : []),
          ]
        : []),
      ...segments.map((s) => ({
        text: s.id,
        measurementId: s.id,
        point: { x: (s.startMm + s.endMm) / 2, y: h },
      })),
    ],
    measurements: segments.map((s) => ({
      id: s.id,
      kind: 'length',
      value: s.startMm,
      unit: 'mm',
    })),
  };
  return {
    segments,
    count,
    totalWeldMm,
    endClearanceMm,
    clearanceMatches,
    drawing,
  };
}
