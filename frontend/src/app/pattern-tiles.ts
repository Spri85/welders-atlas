import { drawingBounds, type PatternDrawing } from './pattern-drawing';
import type { PatternPoint } from './centered-round-reducer';

export type PaperSize = 'a4' | 'letter';
export const paperSizes = { a4: { width: 210, height: 297 }, letter: { width: 215.9, height: 279.4 } };

export function layoutPatternTiles(drawing: PatternDrawing, paper: PaperSize) {
  const bounds = drawingBounds(drawing);
  const page = paperSizes[paper];
  const margin = 10;
  const top = 42;
  const width = page.width - 2 * margin;
  const height = page.height - top - 27;
  const overlap = 10;
  const columns = Math.max(1, Math.ceil((bounds.width + 10 - overlap) / (width - overlap)));
  const rows = Math.max(1, Math.ceil((bounds.height + 10 - overlap) / (height - overlap)));
  if (![bounds.width, bounds.height].every((value) => Number.isFinite(value) && value > 0)
    || !Number.isSafeInteger(columns * rows) || columns * rows > 200) {
    throw new RangeError('Pattern exceeds 200 pages.');
  }
  const tiles = Array.from({ length: columns * rows }, (_, index) => {
    const row = Math.floor(index / columns);
    const column = index % columns;
    const origin = { x: column * (width - overlap), y: row * (height - overlap) };
    const project = (point: PatternPoint): PatternPoint => ({
      x: margin + point.x - bounds.minX + 5 - origin.x,
      y: top + bounds.maxY - point.y + 5 - origin.y,
    });
    return { row, column, origin, project };
  });
  return { page, margin, top, width, height, overlap, columns, rows, tiles };
}
