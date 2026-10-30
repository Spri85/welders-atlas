import { finiteResult, positive, requireCondition } from './validation';
import { line } from './drawings';
import type { PatternDrawing } from '../pattern-drawing';
export function calculateMeasuredRadius(chordMm: number, riseMm: number) {
  positive(chordMm, riseMm);
  requireCondition(riseMm <= chordMm / 2);
  const radiusMm = (chordMm * (chordMm / riseMm)) / 8 + riseMm / 2;
  const angleRadians = 4 * Math.atan((2 * riseMm) / chordMm);
  const arcMm = radiusMm * angleRadians;
  finiteResult(radiusMm, angleRadians, arcMm);
  const start = { x: -chordMm / 2, y: 0 },
    end = { x: chordMm / 2, y: 0 };
  const drawing: PatternDrawing = {
    closed: false,
    outline: [
      {
        kind: 'arc',
        center: { x: 0, y: riseMm - radiusMm },
        radiusMm,
        startAngleRadians: Math.atan2(radiusMm - riseMm, -chordMm / 2),
        sweepAngleRadians: -angleRadians,
        start,
        end,
        lengthMm: arcMm,
      },
    ],
    construction: [line(start, end), line({ x: 0, y: 0 }, { x: 0, y: riseMm })],
    labels: [
      { text: 'c', point: { x: 0, y: 0 } },
      { text: 'h', point: { x: 0, y: riseMm / 2 } },
      { text: 'R', point: { x: chordMm / 4, y: riseMm } },
    ],
  };
  return { radiusMm, angleRadians, arcMm, drawing };
}
