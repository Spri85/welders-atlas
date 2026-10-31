import {
  positive,
  nonnegative,
  requireCondition,
  finiteResult,
} from './validation';
import { line } from './drawings';
import type { PatternDrawing } from '../pattern-drawing';

export interface PipeOffsetInputs {
  shiftMm: number;
  angleDegrees: number;
  takeoffAMm: number;
  takeoffBMm: number;
}

export function calculatePipeOffset({
  shiftMm,
  angleDegrees,
  takeoffAMm,
  takeoffBMm,
}: PipeOffsetInputs) {
  positive(shiftMm);
  nonnegative(takeoffAMm, takeoffBMm);
  requireCondition(
    Number.isFinite(angleDegrees) && angleDegrees > 0 && angleDegrees <= 90,
    'angle',
  );
  const radians = (angleDegrees * Math.PI) / 180;
  const travelMm = shiftMm / Math.sin(radians);
  const advanceMm = angleDegrees === 90 ? 0 : travelMm * Math.cos(radians);
  const cutMm = travelMm - takeoffAMm - takeoffBMm;
  finiteResult(travelMm, advanceMm, cutMm);
  const a = { x: 0, y: 0 };
  const b = { x: advanceMm, y: shiftMm };
  const lead = shiftMm / 3;
  const from = { x: -lead, y: 0 };
  const to = { x: advanceMm + lead, y: shiftMm };
  const direction = { x: advanceMm / travelMm, y: shiftMm / travelMm };
  const faceA = { x: takeoffAMm * direction.x, y: takeoffAMm * direction.y };
  const faceB = {
    x: b.x - takeoffBMm * direction.x,
    y: b.y - takeoffBMm * direction.y,
  };
  const faceMark = (point: { x: number; y: number }) =>
    line(
      {
        x: point.x - (direction.y * lead) / 5,
        y: point.y + (direction.x * lead) / 5,
      },
      {
        x: point.x + (direction.y * lead) / 5,
        y: point.y - (direction.x * lead) / 5,
      },
    );
  const drawing: PatternDrawing = {
    closed: false,
    outline: [line(from, a), line(a, b), line(b, to)],
    folds: [faceMark(faceA), faceMark(faceB)],
    construction: [line(a, { x: b.x, y: 0 }), line({ x: b.x, y: 0 }, b)],
    labels: [
      { text: 'θ', point: { x: lead / 2, y: shiftMm / 12 } },
      { text: 'T', point: { x: b.x / 2, y: b.y / 2 } },
      { text: 'a', point: faceA },
      { text: 'b', point: faceB },
      { text: 'X', point: { x: b.x / 2, y: 0 } },
      { text: 'S', point: { x: b.x, y: b.y / 2 } },
    ],
  };
  return {
    travelMm,
    advanceMm,
    cutMm,
    overlapMm: Math.max(0, -cutMm),
    drawing,
  };
}
