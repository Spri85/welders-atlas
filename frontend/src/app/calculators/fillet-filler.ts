import {
  finiteResult,
  integer,
  nonnegative,
  positive,
  requireCondition,
} from './validation';
import { line, polygon } from './drawings';
export interface FilletFillerInputs {
  legMm: number;
  lengthMm: number;
  quantity: number;
  densityGPerCm3: number;
  reinforcementFactor: number;
  efficiencyPercent: number;
  pricePerKg?: number;
}
export function calculateFilletFiller(v: FilletFillerInputs) {
  positive(v.legMm, v.lengthMm, v.densityGPerCm3, v.efficiencyPercent);
  integer(v.quantity);
  requireCondition(
    v.reinforcementFactor >= 1 && Number.isFinite(v.reinforcementFactor),
    'fraction',
  );
  requireCondition(v.efficiencyPercent <= 100, 'fraction');
  if (v.pricePerKg !== undefined) nonnegative(v.pricePerKg);
  const areaMm2 = (v.legMm ** 2 / 2) * v.reinforcementFactor;
  const depositedKg =
    (areaMm2 * v.lengthMm * v.quantity * v.densityGPerCm3) / 1e6;
  const consumableKg = depositedKg / (v.efficiencyPercent / 100);
  const cost =
    v.pricePerKg === undefined ? undefined : consumableKg * v.pricePerKg;
  finiteResult(areaMm2, depositedKg, consumableKg, cost ?? 0);
  const drawing = {
    ...polygon([
      { x: 0, y: 0 },
      { x: v.legMm, y: 0 },
      { x: 0, y: v.legMm },
    ]),
    labels: [
      { text: 'z', point: { x: v.legMm / 2, y: 0 } },
      { text: 'z', point: { x: 0, y: v.legMm / 2 } },
    ],
  };
  const lengthDrawing = {
    closed: false,
    outline: [line({ x: 0, y: 0 }, { x: v.lengthMm, y: 0 })],
    construction: [0, v.lengthMm].map((x) =>
      line({ x, y: -v.lengthMm / 30 }, { x, y: v.lengthMm / 30 }),
    ),
    labels: [{ text: 'L', point: { x: v.lengthMm / 2, y: 0 } }],
  };
  return { areaMm2, depositedKg, consumableKg, cost, drawing, lengthDrawing };
}
