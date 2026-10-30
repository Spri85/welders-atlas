import {
  finiteResult,
  nonnegative,
  positive,
  requireCondition,
} from './validation';
import { line, polygon, rectangle } from './drawings';
import type { PatternDrawing } from '../pattern-drawing';
export interface BracketBlankInputs {
  leg1Mm: number;
  leg2Mm: number;
  thicknessMm: number;
  insideRadiusMm: number;
  bendDegrees: number;
  allowance: { kFactor: number } | { measuredMm: number };
}
export function calculateBracketBlank(v: BracketBlankInputs) {
  positive(v.leg1Mm, v.leg2Mm, v.thicknessMm);
  nonnegative(v.insideRadiusMm);
  requireCondition(
    Number.isFinite(v.bendDegrees) && v.bendDegrees > 0 && v.bendDegrees < 180,
    'angle',
  );
  const theta = (v.bendDegrees * Math.PI) / 180;
  const outsideR = v.insideRadiusMm + v.thicknessMm;
  const setbackMm = outsideR * Math.tan(theta / 2);
  let allowanceMm: number;
  if ('kFactor' in v.allowance) {
    const k = v.allowance.kFactor;
    requireCondition(Number.isFinite(k) && k >= 0 && k <= 1, 'fraction');
    allowanceMm = theta * (v.insideRadiusMm + k * v.thicknessMm);
  } else {
    allowanceMm = v.allowance.measuredMm;
    nonnegative(allowanceMm);
    requireCondition(
      allowanceMm >= theta * v.insideRadiusMm &&
        allowanceMm <= theta * outsideR,
    );
  }
  requireCondition(v.leg1Mm >= setbackMm && v.leg2Mm >= setbackMm);
  const deductionMm = 2 * setbackMm - allowanceMm;
  const blankMm = v.leg1Mm + v.leg2Mm - deductionMm;
  const centerMm = v.leg1Mm - setbackMm + allowanceMm / 2;
  positive(blankMm);
  finiteResult(setbackMm, allowanceMm, deductionMm, blankMm, centerMm);
  const width = Math.max(v.leg1Mm, v.leg2Mm) / 4;
  const drawing: PatternDrawing = {
    ...rectangle(blankMm, width),
    folds: [line({ x: centerMm, y: 0 }, { x: centerMm, y: width })],
    construction: [
      v.leg1Mm - setbackMm,
      v.leg1Mm - setbackMm + allowanceMm,
    ].map((x) => line({ x, y: 0 }, { x, y: width })),
    labels: [
      { text: 'L', point: { x: blankMm / 2, y: 0 } },
      { text: 'B', point: { x: centerMm, y: width / 2 } },
    ],
  };
  const arc = (r: number) =>
    Array.from({ length: 73 }, (_, i) => {
      const a = (theta * i) / 72;
      return { x: -setbackMm + r * Math.sin(a), y: outsideR - r * Math.cos(a) };
    });
  const end = { x: v.leg2Mm * Math.cos(theta), y: v.leg2Mm * Math.sin(theta) };
  const sectionDrawing: PatternDrawing = {
    ...polygon([
      { x: -v.leg1Mm, y: 0 },
      ...arc(outsideR),
      end,
      {
        x: end.x - v.thicknessMm * Math.sin(theta),
        y: end.y + v.thicknessMm * Math.cos(theta),
      },
      ...arc(v.insideRadiusMm).reverse(),
      { x: -v.leg1Mm, y: v.thicknessMm },
    ]),
    construction: [
      line({ x: -v.leg1Mm, y: 0 }, { x: 0, y: 0 }),
      line({ x: 0, y: 0 }, end),
    ],
    labels: [
      { text: '1', point: { x: -v.leg1Mm / 2, y: 0 } },
      { text: '2', point: end },
      { text: 'r', point: { x: -setbackMm, y: outsideR } },
    ],
  };
  return {
    setbackMm,
    allowanceMm,
    deductionMm,
    blankMm,
    centerMm,
    drawing,
    sectionDrawing,
  };
}
