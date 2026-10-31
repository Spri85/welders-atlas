import { finiteResult, integer, nonnegative, positive } from './validation';
import { rectangle } from './drawings';
import type { PatternDrawing } from '../pattern-drawing';
export function calculateSheetGrid(
  sheetWidthMm: number,
  sheetHeightMm: number,
  partWidthMm: number,
  partHeightMm: number,
  marginMm: number,
  spacingMm: number,
  allowRotation: boolean,
) {
  positive(sheetWidthMm, sheetHeightMm, partWidthMm, partHeightMm);
  nonnegative(marginMm, spacingMm);
  const usableWidthMm = Math.max(0, sheetWidthMm - 2 * marginMm),
    usableHeightMm = Math.max(0, sheetHeightMm - 2 * marginMm);
  const fitCount = (available: number, part: number) => {
    const ratio = (available + spacingMm) / (part + spacingMm);
    const tolerance = 8 * Number.EPSILON * Math.max(1, Math.abs(ratio));
    return Math.max(0, Math.floor(ratio + tolerance));
  };
  const fit = (width: number, height: number, rotated: boolean) => {
    const columns = fitCount(usableWidthMm, width);
    const rows = fitCount(usableHeightMm, height);
    return { columns, rows, count: columns * rows, width, height, rotated };
  };
  const entered = fit(partWidthMm, partHeightMm, false),
    rotated = fit(partHeightMm, partWidthMm, true);
  const chosen =
    allowRotation && rotated.count > entered.count ? rotated : entered;
  integer(chosen.count, 0);
  const usedWidth = chosen.columns
    ? chosen.columns * chosen.width + (chosen.columns - 1) * spacingMm
    : 0;
  const usedHeight = chosen.rows
    ? chosen.rows * chosen.height + (chosen.rows - 1) * spacingMm
    : 0;
  const remainderWidthMm = Math.max(0, usableWidthMm - usedWidth),
    remainderHeightMm = Math.max(0, usableHeightMm - usedHeight);
  finiteResult(remainderWidthMm, remainderHeightMm);
  const contours = Array.from({ length: chosen.count }, (_, i) => {
    const x = marginMm + (i % chosen.columns) * (chosen.width + spacingMm),
      y =
        marginMm + Math.floor(i / chosen.columns) * (chosen.height + spacingMm);
    return rectangle(chosen.width, chosen.height).outline.map((e) => ({
      ...e,
      start: { x: e.start.x + x, y: e.start.y + y },
      end: { x: e.end.x + x, y: e.end.y + y },
    }));
  });
  const drawing: PatternDrawing = {
    ...rectangle(sheetWidthMm, sheetHeightMm),
    contours,
    labels: [
      ...(chosen.count
        ? [
            {
              text: chosen.rotated ? 'h' : 'w',
              point: { x: marginMm + chosen.width / 2, y: marginMm },
            },
            {
              text: chosen.rotated ? 'w' : 'h',
              point: { x: marginMm, y: marginMm + chosen.height / 2 },
            },
          ]
        : []),
      ...(marginMm > 0
        ? [{ text: 'm', point: { x: marginMm / 2, y: sheetHeightMm * 0.75 } }]
        : []),
      ...(spacingMm > 0 && chosen.count > 1
        ? [
            {
              text: 's',
              point:
                chosen.columns > 1
                  ? {
                      x: marginMm + chosen.width + spacingMm / 2,
                      y: marginMm + chosen.height / 2,
                    }
                  : {
                      x: marginMm + chosen.width / 2,
                      y: marginMm + chosen.height + spacingMm / 2,
                    },
            },
          ]
        : []),
      { text: 'W', point: { x: sheetWidthMm / 2, y: 0 } },
      { text: 'H', point: { x: 0, y: sheetHeightMm / 2 } },
    ],
  };
  return {
    ...chosen,
    enteredCount: entered.count,
    rotatedCount: rotated.count,
    usableWidthMm,
    usableHeightMm,
    remainderWidthMm,
    remainderHeightMm,
    drawing,
  };
}
