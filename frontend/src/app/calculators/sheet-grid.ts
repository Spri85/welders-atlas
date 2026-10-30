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
  const fit = (width: number, height: number, rotated: boolean) => {
    const columns = Math.max(
      0,
      Math.floor((usableWidthMm + spacingMm) / (width + spacingMm)),
    );
    const rows = Math.max(
      0,
      Math.floor((usableHeightMm + spacingMm) / (height + spacingMm)),
    );
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
  const remainderWidthMm = usableWidthMm - usedWidth,
    remainderHeightMm = usableHeightMm - usedHeight;
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
