import { finiteResult, integer, nonnegative, positive } from './validation';
import { line, rectangle } from './drawings';
import type { PatternDrawing } from '../pattern-drawing';
export type StockMassInputs = (
  | {
      mode: 'plate';
      lengthMm: number;
      widthMm: number;
      thicknessMm: number;
      densityKgPerM3: number;
    }
  | { mode: 'section'; lengthMm: number; kgPerMetre: number }
) & { quantity: number; pricePerKg?: number };
export function calculateStockMass(v: StockMassInputs) {
  positive(v.lengthMm);
  integer(v.quantity);
  if (v.pricePerKg !== undefined) nonnegative(v.pricePerKg);
  let eachKg: number;
  let drawing: PatternDrawing;
  if (v.mode === 'plate') {
    positive(v.widthMm, v.thicknessMm, v.densityKgPerM3);
    eachKg =
      ((v.lengthMm * v.widthMm * v.thicknessMm) / 1e9) * v.densityKgPerM3;
    drawing = {
      ...rectangle(v.lengthMm, v.widthMm),
      labels: [
        { text: 'L', point: { x: v.lengthMm / 2, y: 0 } },
        { text: 'W', point: { x: 0, y: v.widthMm / 2 } },
      ],
    };
  } else {
    positive(v.kgPerMetre);
    eachKg = (v.lengthMm / 1000) * v.kgPerMetre;
    drawing = {
      closed: false,
      outline: [line({ x: 0, y: 0 }, { x: v.lengthMm, y: 0 })],
      construction: [0, v.lengthMm].map((x) =>
        line({ x, y: -v.lengthMm / 40 }, { x, y: v.lengthMm / 40 }),
      ),
      labels: [{ text: 'L', point: { x: v.lengthMm / 2, y: 0 } }],
    };
  }
  const totalKg = eachKg * v.quantity;
  const cost = v.pricePerKg === undefined ? undefined : totalKg * v.pricePerKg;
  finiteResult(eachKg, totalKg, cost ?? 0);
  const sectionDrawing: PatternDrawing | undefined =
    v.mode === 'plate'
      ? {
          ...rectangle(v.widthMm, v.thicknessMm),
          labels: [
            { text: 'W', point: { x: v.widthMm / 2, y: 0 } },
            { text: 't', point: { x: v.widthMm, y: v.thicknessMm / 2 } },
          ],
        }
      : undefined;
  return { eachKg, totalKg, cost, drawing, sectionDrawing };
}
