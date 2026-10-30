import { finiteResult, positive, requireCondition } from './validation';
import { line } from './drawings';
import type { PatternDrawing } from '../pattern-drawing';
export function calculateArcEnergy(
  volts: number,
  amps: number,
  speedMmPerMin: number,
  thermalEfficiency?: number,
) {
  positive(volts, amps, speedMmPerMin);
  if (thermalEfficiency !== undefined)
    requireCondition(
      Number.isFinite(thermalEfficiency) &&
        thermalEfficiency > 0 &&
        thermalEfficiency <= 1,
      'fraction',
    );
  const arcKjPerMm = (60 * volts * amps) / (1000 * speedMmPerMin);
  const effectiveKjPerMm =
    thermalEfficiency === undefined
      ? undefined
      : arcKjPerMm * thermalEfficiency;
  finiteResult(arcKjPerMm, effectiveKjPerMm ?? 0);
  const h = speedMmPerMin / 5;
  const drawing: PatternDrawing = {
    closed: false,
    outline: [line({ x: 0, y: 0 }, { x: speedMmPerMin, y: 0 })],
    construction: [
      line({ x: speedMmPerMin / 2, y: 0 }, { x: speedMmPerMin / 2, y: h }),
    ],
    labels: [
      { text: 'v', point: { x: speedMmPerMin / 4, y: 0 } },
      { text: 'U', point: { x: speedMmPerMin * 0.45, y: h } },
      { text: 'I', point: { x: speedMmPerMin * 0.6, y: h } },
      { text: 'E', point: { x: speedMmPerMin * 0.75, y: 0 } },
    ],
  };
  return { arcKjPerMm, effectiveKjPerMm, drawing };
}
