import { positive, nonnegative, requireCondition, finiteResult } from './validation';
import { line, polygon } from './drawings';
import type { PatternDrawing } from '../pattern-drawing';

export interface RectangularFrameInputs {
  widthMm: number; heightMm: number; tubeWidthMm: number;
  corner: 'butt' | 'miter'; gapMm?: number;
  measuredDiagonalAMm?: number; measuredDiagonalBMm?: number;
}

export function calculateRectangularFrame(input: RectangularFrameInputs) {
  const { widthMm: w, heightMm: h, tubeWidthMm: t, corner, gapMm: gap = 0, measuredDiagonalAMm: measuredA, measuredDiagonalBMm: measuredB } = input;
  positive(w, h, t);
  nonnegative(gap);
  requireCondition(corner === 'butt' || corner === 'miter');
  requireCondition(w > 2 * t && h > 2 * t);
  requireCondition((measuredA === undefined) === (measuredB === undefined), 'pair');
  if (measuredA !== undefined && measuredB !== undefined) positive(measuredA, measuredB);
  const uprightMm = corner === 'butt' ? h - 2 * t - 2 * gap : h;
  positive(uprightMm);
  const targetDiagonalMm = Math.hypot(w, h);
  finiteResult(targetDiagonalMm);
  const cuts = [
    { id: 'R', quantity: 2, longPointMm: w, shortPointMm: corner === 'butt' ? w : w - 2 * t },
    { id: 'U', quantity: 2, longPointMm: uprightMm, shortPointMm: corner === 'butt' ? uprightMm : h - 2 * t },
  ];
  let members;
  if (corner === 'butt') {
    members = [
      [{ x: 0, y: 0 }, { x: w, y: 0 }, { x: w, y: t }, { x: 0, y: t }],
      [{ x: 0, y: h - t }, { x: w, y: h - t }, { x: w, y: h }, { x: 0, y: h }],
      [{ x: 0, y: t + gap }, { x: t, y: t + gap }, { x: t, y: h - t - gap }, { x: 0, y: h - t - gap }],
      [{ x: w - t, y: t + gap }, { x: w, y: t + gap }, { x: w, y: h - t - gap }, { x: w - t, y: h - t - gap }],
    ];
  } else {
    members = [
      [{ x: 0, y: 0 }, { x: w, y: 0 }, { x: w - t, y: t }, { x: t, y: t }],
      [{ x: 0, y: h }, { x: w, y: h }, { x: w - t, y: h - t }, { x: t, y: h - t }],
      [{ x: 0, y: 0 }, { x: t, y: t }, { x: t, y: h - t }, { x: 0, y: h }],
      [{ x: w, y: 0 }, { x: w - t, y: t }, { x: w - t, y: h - t }, { x: w, y: h }],
    ];
  }
  const drawing: PatternDrawing = {
    ...polygon(members[0]), contours: members.slice(1).map((member) => polygon(member).outline),
    construction: [line({ x: 0, y: 0 }, { x: w, y: h })],
    labels: [
      { text: 'R', point: { x: w / 2, y: t / 2 } }, { text: 'R', point: { x: w / 2, y: h - t / 2 } },
      { text: 'U', point: { x: t / 2, y: h / 2 } }, { text: 'U', point: { x: w - t / 2, y: h / 2 } },
      { text: 'D', point: { x: w / 2, y: h / 2 } },
    ],
  };
  return {
    cuts, targetDiagonalMm, drawing,
    measuredDifferenceMm: measuredA !== undefined && measuredB !== undefined ? Math.abs(measuredA - measuredB) : undefined,
    deviationAMm: measuredA === undefined ? undefined : measuredA - targetDiagonalMm,
    deviationBMm: measuredB === undefined ? undefined : measuredB - targetDiagonalMm,
  };
}
