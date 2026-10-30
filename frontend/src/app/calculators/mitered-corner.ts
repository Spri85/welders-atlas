import type { Point3 } from '../pattern-geometry';
import type { PatternDrawing } from '../pattern-drawing';
import { positive, requireCondition, finiteResult } from './validation';
import { line, polygon } from './drawings';

export interface MiteredCornerInputs {
  diameterMm: number;
  turnDegrees: number;
}

export function calculateMiteredCorner({
  diameterMm,
  turnDegrees,
}: MiteredCornerInputs) {
  positive(diameterMm);
  requireCondition(
    Number.isFinite(turnDegrees) && turnDegrees > 0 && turnDegrees < 180,
    'angle',
  );
  const offSquareDegrees = turnDegrees / 2;
  const riseMm = diameterMm * Math.tan((offSquareDegrees * Math.PI) / 180);
  const wrapWidthMm = Math.PI * diameterMm;
  finiteResult(riseMm, wrapWidthMm);
  const riseAt = (angle: number) => (riseMm * (1 - Math.cos(angle))) / 2;
  const profile = Array.from({ length: 721 }, (_, index) => ({
    x: (wrapWidthMm * index) / 720,
    y: riseAt((index * Math.PI) / 360),
  }));
  const stations = Array.from({ length: 25 }, (_, index) => ({
    angleDegrees: index * 15,
    distanceMm: (wrapWidthMm * index) / 24,
    riseMm: riseAt((index * Math.PI) / 12),
  }));
  const drawing: PatternDrawing = {
    ...polygon(profile),
    construction: [line({ x: 0, y: 0 }, { x: wrapWidthMm, y: 0 })],
    folds: [1, 2, 3].map((quarter) =>
      line({ x: (wrapWidthMm * quarter) / 4, y: 0 }, profile[quarter * 180]),
    ),
    labels: [
      ...[0, 1, 2, 3, 4].map((quarter) => ({
        text: `${quarter * 90}°`,
        point: { x: (wrapWidthMm * quarter) / 4, y: riseMm * 0.05 },
      })),
      {
        text: 'h',
        measurementId: 'h',
        point: { x: wrapWidthMm / 2, y: riseMm / 2 },
      },
      { text: 'Q', point: { x: wrapWidthMm / 2, y: 0 } },
    ],
    measurements: [
      { id: 'h', kind: 'length', value: riseMm, unit: 'mm' },
      { id: 'α', kind: 'angle', value: offSquareDegrees, unit: 'degree' },
    ],
  };
  const radius = diameterMm / 2;
  const length = diameterMm + riseMm;
  const turn = (turnDegrees * Math.PI) / 180;
  const cut = (angle: number): Point3 => ({
    x: (-riseMm / 2) * Math.cos(angle),
    y: radius * Math.cos(angle),
    z: radius * Math.sin(angle),
  });
  const incoming = (angle: number): Point3 => ({
    x: -length,
    y: radius * Math.cos(angle),
    z: radius * Math.sin(angle),
  });
  const outgoing = (angle: number): Point3 => ({
    x: length * Math.cos(turn) - radius * Math.cos(angle) * Math.sin(turn),
    y: length * Math.sin(turn) + radius * Math.cos(angle) * Math.cos(turn),
    z: radius * Math.sin(angle),
  });
  const ring = (pointAt: (angle: number) => Point3) =>
    Array.from({ length: 73 }, (_, index) => pointAt((index * Math.PI) / 36));
  const assembly = [
    ring(incoming),
    ring(cut),
    ring(outgoing),
    ...Array.from({ length: 8 }, (_, index) => [
      incoming((index * Math.PI) / 4),
      cut((index * Math.PI) / 4),
      outgoing((index * Math.PI) / 4),
    ]),
  ];
  return {
    offSquareDegrees,
    riseMm,
    wrapWidthMm,
    stations,
    profile,
    drawing,
    assembly,
  };
}
