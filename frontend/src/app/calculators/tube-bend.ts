import { finiteResult, positive, requireCondition } from './validation';
import { line, rectangle } from './drawings';
import type { PatternDrawing } from '../pattern-drawing';
export function calculateTubeBend(
  leg1Mm: number,
  leg2Mm: number,
  turnDegrees: number,
  radiusMm: number,
) {
  positive(leg1Mm, leg2Mm, radiusMm);
  requireCondition(
    Number.isFinite(turnDegrees) && turnDegrees > 0 && turnDegrees < 180,
    'angle',
  );
  const theta = (turnDegrees * Math.PI) / 180;
  const setbackMm = radiusMm * Math.tan(theta / 2);
  requireCondition(leg1Mm >= setbackMm && leg2Mm >= setbackMm);
  const straight1Mm = leg1Mm - setbackMm,
    straight2Mm = leg2Mm - setbackMm,
    arcMm = radiusMm * theta,
    stockMm = straight1Mm + straight2Mm + arcMm;
  finiteResult(setbackMm, arcMm, stockMm);
  const start = { x: -leg1Mm, y: 0 },
    t1 = { x: -setbackMm, y: 0 },
    t2 = { x: setbackMm * Math.cos(theta), y: setbackMm * Math.sin(theta) },
    end = { x: leg2Mm * Math.cos(theta), y: leg2Mm * Math.sin(theta) };
  const drawing: PatternDrawing = {
    closed: false,
    outline: [
      line(start, t1),
      {
        kind: 'arc',
        center: { x: -setbackMm, y: radiusMm },
        radiusMm,
        startAngleRadians: -Math.PI / 2,
        sweepAngleRadians: theta,
        start: t1,
        end: t2,
        lengthMm: arcMm,
      },
      line(t2, end),
    ],
    construction: [line(start, { x: 0, y: 0 }), line({ x: 0, y: 0 }, end)],
    vertices: [
      { id: 'T1', point: t1 },
      { id: 'T2', point: t2 },
    ],
    labels: [
      { text: 'T1', point: t1 },
      { text: 'T2', point: t2 },
      { text: 'S', point: { x: -setbackMm / 2, y: 0 } },
      { text: 'R', point: { x: -setbackMm, y: radiusMm / 2 } },
    ],
  };
  const height = stockMm / 15;
  const blankDrawing: PatternDrawing = {
    ...rectangle(stockMm, height),
    folds: [straight1Mm, straight1Mm + arcMm].map((x) =>
      line({ x, y: 0 }, { x, y: height }),
    ),
    labels: [
      { text: 'L', point: { x: stockMm / 2, y: 0 } },
      { text: 'T1', point: { x: straight1Mm, y: height } },
      { text: 'T2', point: { x: straight1Mm + arcMm, y: height } },
    ],
  };
  return {
    setbackMm,
    straight1Mm,
    straight2Mm,
    arcMm,
    stockMm,
    tangent1Mm: straight1Mm,
    tangent2Mm: straight1Mm + arcMm,
    drawing,
    blankDrawing,
  };
}
