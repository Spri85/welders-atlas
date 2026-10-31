import {
  finiteResult,
  nonnegative,
  positive,
  requireCondition,
} from './validation';
import { line, polygon } from './drawings';
import type { PatternDrawing } from '../pattern-drawing';
export function calculateSingleV(
  thicknessMm: number,
  rootFaceMm: number,
  rootOpeningMm: number,
  includedDegrees: number,
) {
  positive(thicknessMm);
  nonnegative(rootFaceMm, rootOpeningMm);
  requireCondition(rootFaceMm < thicknessMm);
  requireCondition(
    Number.isFinite(includedDegrees) &&
      includedDegrees > 0 &&
      includedDegrees < 180,
    'angle',
  );
  const halfDegrees = includedDegrees / 2;
  const depthMm = thicknessMm - rootFaceMm;
  const setbackMm = depthMm * Math.tan((halfDegrees * Math.PI) / 180);
  const mouthMm = rootOpeningMm + 2 * setbackMm;
  finiteResult(depthMm, setbackMm, mouthMm);
  const edge = rootOpeningMm / 2,
    outer = edge + setbackMm + 2 * thicknessMm;
  const left = [
    { x: -outer, y: 0 },
    { x: -edge, y: 0 },
    { x: -edge, y: rootFaceMm },
    { x: -edge - setbackMm, y: thicknessMm },
    { x: -outer, y: thicknessMm },
  ];
  const drawing: PatternDrawing = {
    ...polygon(left),
    contours: [polygon(left.map((p) => ({ x: -p.x, y: p.y }))).outline],
    construction: [-edge, edge].map((x) =>
      line({ x, y: rootFaceMm }, { x, y: thicknessMm }),
    ),
    labels: [
      { text: 'θ', point: { x: 0, y: rootFaceMm + depthMm / 3 } },
      { text: 't', point: { x: -outer, y: thicknessMm / 2 } },
      { text: 'f', point: { x: edge, y: rootFaceMm / 2 } },
      { text: 'g', point: { x: 0, y: 0 } },
      { text: 's', point: { x: -edge - setbackMm / 2, y: thicknessMm } },
      {
        text: 'α',
        point: { x: -edge - setbackMm * 0.35, y: rootFaceMm + depthMm * 0.7 },
      },
      {
        text: 'α',
        point: { x: edge + setbackMm * 0.35, y: rootFaceMm + depthMm * 0.7 },
      },
    ],
  };
  return { halfDegrees, depthMm, setbackMm, mouthMm, drawing };
}
