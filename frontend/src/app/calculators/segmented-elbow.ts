import {
  finiteResult,
  integer,
  positive,
  requireCondition,
} from './validation';
import { calculateMiteredCorner } from './mitered-corner';
import { line, polygon } from './drawings';
import type { PatternDrawing } from '../pattern-drawing';
import { modelDimension, type Point3 } from '../pattern-geometry';
export function calculateSegmentedElbow(
  diameterMm: number,
  throatRadiusMm: number,
  turnDegrees: number,
  count: number,
) {
  positive(diameterMm, throatRadiusMm);
  integer(count, 3, 100);
  requireCondition(
    Number.isFinite(turnDegrees) && turnDegrees > 0 && turnDegrees <= 180,
    'angle',
  );
  const jointDegrees = turnDegrees / (count - 1);
  const offSquareDegrees = jointDegrees / 2;
  const alpha = (offSquareDegrees * Math.PI) / 180;
  const centerRadiusMm = throatRadiusMm + diameterMm / 2;
  const halfInsideMm = throatRadiusMm * Math.tan(alpha);
  const halfOutsideMm = (throatRadiusMm + diameterMm) * Math.tan(alpha);
  finiteResult(halfInsideMm, halfOutsideMm, centerRadiusMm);
  const miter = calculateMiteredCorner({
    diameterMm,
    turnDegrees: jointDegrees,
  });
  const surfacePoint = (index: number, angle: number, end: boolean): Point3 => {
    const beta = (index * jointDegrees * Math.PI) / 180;
    const r = diameterMm / 2;
    const local = (centerRadiusMm - r * Math.cos(angle)) * Math.tan(alpha);
    const along = end
      ? index === count - 1
        ? 0
        : local
      : index === 0
        ? 0
        : -local;
    return {
      x:
        centerRadiusMm * Math.sin(beta) +
        along * Math.cos(beta) -
        r * Math.cos(angle) * Math.sin(beta),
      y:
        centerRadiusMm * (1 - Math.cos(beta)) +
        along * Math.sin(beta) +
        r * Math.cos(angle) * Math.cos(beta),
      z: r * Math.sin(angle),
    };
  };
  const pieces = Array.from({ length: count }, (_, index) => {
    const factor = index === 0 || index === count - 1 ? 1 : 2;
    const bottom = miter.profile.map((p) => ({
      x: p.x,
      y: index === 0 ? 0 : -(halfInsideMm + p.y),
    }));
    const top = miter.profile.map((p) => ({
      x: p.x,
      y: index === count - 1 ? 0 : halfInsideMm + p.y,
    }));
    const drawing: PatternDrawing = {
      ...polygon([...bottom, ...top.slice().reverse()]),
      folds: [1, 2, 3].map((q) => line(bottom[q * 180], top[q * 180])),
      labels: [
        { text: 'I', measurementId: 'I', point: { x: 0, y: 0 } },
        {
          text: 'O',
          measurementId: 'O',
          point: { x: miter.wrapWidthMm / 2, y: 0 },
        },
        { text: 'S', point: { x: miter.wrapWidthMm, y: 0 } },
        ...['0°', '90°', '180°', '270°', '360°'].map((text, q) => ({
          text,
          point: bottom[q * 180],
        })),
      ],
      measurements: [
        { id: 'I', kind: 'length', value: factor * halfInsideMm, unit: 'mm' },
        { id: 'O', kind: 'length', value: factor * halfOutsideMm, unit: 'mm' },
        { id: 'α', kind: 'angle', value: offSquareDegrees, unit: 'degree' },
      ],
    };
    return {
      number: index + 1,
      insideMm: factor * halfInsideMm,
      outsideMm: factor * halfOutsideMm,
      startCut: index === 0 ? 'square' : 'miter',
      endCut: index === count - 1 ? 'square' : 'miter',
      drawing,
    };
  });
  const ring = (i: number, end: boolean) =>
    Array.from({ length: 73 }, (_, k) =>
      surfacePoint(i, (k * Math.PI) / 36, end),
    );
  const model: {
    points: Point3[];
    seam?: boolean;
    label?: string;
    construction?: boolean;
  }[] = pieces.flatMap((_, i) => [
    { points: ring(i, false) },
    { points: ring(i, true) },
    ...Array.from({ length: 8 }, (_, k) => ({
      points: [
        surfacePoint(i, (k * Math.PI) / 4, false),
        surfacePoint(i, (k * Math.PI) / 4, true),
      ],
      seam: k === 0,
    })),
  ]);
  model.push(
    modelDimension(
      surfacePoint(0, 0, false),
      surfacePoint(0, Math.PI, false),
      'D',
    ),
  );
  model.push({
    points: Array.from({ length: 25 }, (_, i) => {
      const angle = (((turnDegrees * Math.PI) / 180) * i) / 24;
      return {
        x: throatRadiusMm * 0.5 * Math.sin(angle),
        y: centerRadiusMm - throatRadiusMm * 0.5 * Math.cos(angle),
        z: 0,
      };
    }),
    label: 'θ',
    construction: true,
  });
  const mid = (turnDegrees * Math.PI) / 360;
  model.push({
    points: [
      { x: 0, y: centerRadiusMm, z: 0 },
      {
        x: throatRadiusMm * Math.sin(mid),
        y: centerRadiusMm - throatRadiusMm * Math.cos(mid),
        z: 0,
      },
    ],
    label: 'R',
  });
  return {
    jointDegrees,
    offSquareDegrees,
    centerRadiusMm,
    halfInsideMm,
    halfOutsideMm,
    pieces,
    model,
    surfacePoint,
    stations: miter.stations.map((s) => ({
      ...s,
      goreLengthMm: halfInsideMm + s.riseMm,
    })),
  };
}
