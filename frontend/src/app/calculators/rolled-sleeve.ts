import {
  finiteResult,
  nonnegative,
  positive,
  requireCondition,
} from './validation';
import { circle, rectangle } from './drawings';
export function calculateRolledSleeve(
  diameterMm: number,
  diameterIsOutside: boolean,
  thicknessMm: number,
  widthMm: number,
  k: number,
  allowanceMm = 0,
) {
  positive(diameterMm, thicknessMm, widthMm);
  nonnegative(allowanceMm);
  requireCondition(Number.isFinite(k) && k >= 0 && k <= 1, 'fraction');
  const insideMm = diameterMm - (diameterIsOutside ? 2 * thicknessMm : 0);
  positive(insideMm);
  const neutralMm = insideMm + 2 * k * thicknessMm;
  const zeroLengthMm = Math.PI * neutralMm;
  const cutLengthMm = zeroLengthMm + allowanceMm;
  finiteResult(neutralMm, zeroLengthMm, cutLengthMm);
  return {
    insideMm,
    neutralMm,
    zeroLengthMm,
    cutLengthMm,
    drawing: {
      ...rectangle(cutLengthMm, widthMm),
      labels: [
        ...(allowanceMm > 0
          ? [
              {
                text: 'A',
                point: { x: zeroLengthMm + allowanceMm / 2, y: widthMm },
              },
            ]
          : []),
        { text: 'L', point: { x: cutLengthMm / 2, y: 0 } },
        { text: 'W', point: { x: 0, y: widthMm / 2 } },
      ],
    },
    sectionDrawing: {
      ...circle({ x: 0, y: 0 }, insideMm / 2 + thicknessMm),
      contours: [circle({ x: 0, y: 0 }, insideMm / 2).outline],
      labels: [
        { text: 'D', point: { x: 0, y: diameterMm / 2 } },
        { text: 't', point: { x: insideMm / 2 + thicknessMm / 2, y: 0 } },
      ],
    },
  };
}
