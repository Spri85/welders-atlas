import {
  finiteResult,
  integer,
  positive,
  requireCondition,
} from './validation';
import { circle, line } from './drawings';
import type { PatternDrawing } from '../pattern-drawing';
export function calculateBoltCircle(
  pitchDiameterMm: number,
  holeDiameterMm: number,
  count: number,
  firstAngleDegrees: number,
) {
  positive(pitchDiameterMm, holeDiameterMm);
  integer(count, 3);
  requireCondition(Number.isFinite(firstAngleDegrees), 'angle');
  const spacingDegrees = 360 / count;
  const chordMm = pitchDiameterMm * Math.sin(Math.PI / count);
  requireCondition(holeDiameterMm < chordMm);
  const first = ((firstAngleDegrees % 360) + 360) % 360;
  const radius = pitchDiameterMm / 2;
  const holes = Array.from({ length: count }, (_, i) => {
    const angle = (((first + i * spacingDegrees) % 360) * Math.PI) / 180;
    return {
      id: String(i + 1),
      point: { x: radius * Math.cos(angle), y: radius * Math.sin(angle) },
    };
  });
  finiteResult(chordMm, ...holes.flatMap((h) => [h.point.x, h.point.y]));
  const outlines = holes.map(
    (h) => circle(h.point, holeDiameterMm / 2).outline,
  );
  const cross = holeDiameterMm * 0.7;
  const drawing: PatternDrawing = {
    outline: outlines[0],
    contours: outlines.slice(1),
    coordinateOrigin: 'origin',
    coordinatePoints: holes,
    construction: [
      line({ x: -radius, y: 0 }, { x: radius, y: 0 }),
      line({ x: 0, y: -radius }, { x: 0, y: radius }),
      ...holes.flatMap(({ point: p }) => [
        line({ x: p.x - cross, y: p.y }, { x: p.x + cross, y: p.y }),
        line({ x: p.x, y: p.y - cross }, { x: p.x, y: p.y + cross }),
      ]),
    ],
    labels: [
      ...holes.map((h) => ({
        text: h.id,
        point: {
          x: h.point.x * (1 - (holeDiameterMm / 2 + 3) / radius),
          y: h.point.y * (1 - (holeDiameterMm / 2 + 3) / radius),
        },
      })),
      { text: 'O', point: { x: 0, y: 0 } },
      { text: '+X', point: { x: radius, y: 0 } },
      { text: '+Y', point: { x: 0, y: radius } },
    ],
    measurements: [
      { id: 'P', kind: 'length', value: pitchDiameterMm, unit: 'mm' },
      { id: 'd', kind: 'length', value: holeDiameterMm, unit: 'mm' },
      { id: 'α', kind: 'angle', value: spacingDegrees, unit: 'degree' },
      { id: 'C', kind: 'length', value: chordMm, unit: 'mm' },
    ],
  };
  return { spacingDegrees, chordMm, holes, drawing };
}
