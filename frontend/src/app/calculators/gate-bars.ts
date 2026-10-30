import {
  finiteResult,
  integer,
  positive,
  requireCondition,
} from './validation';
import { rectangle } from './drawings';
import type { PatternDrawing } from '../pattern-drawing';

export function calculateGateBars(
  openingMm: number,
  barWidthMm: number,
  count: number,
) {
  positive(openingMm, barWidthMm);
  integer(count);
  requireCondition(openingMm > count * barWidthMm);
  const gapMm = (openingMm - count * barWidthMm) / (count + 1);
  const bars = Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    nearMm: gapMm + i * (barWidthMm + gapMm),
    centerMm: gapMm + i * (barWidthMm + gapMm) + barWidthMm / 2,
  }));
  finiteResult(gapMm, bars.at(-1)!.centerMm);
  const height = openingMm / 4;
  const outlines = bars.map((bar) =>
    rectangle(barWidthMm, height).outline.map((edge) => ({
      ...edge,
      start: { x: edge.start.x + bar.nearMm, y: edge.start.y },
      end: { x: edge.end.x + bar.nearMm, y: edge.end.y },
    })),
  );
  const drawing: PatternDrawing = {
    outline: outlines[0],
    contours: outlines.slice(1),
    construction: rectangle(openingMm, height).outline.filter(
      (edge) => edge.kind === 'line',
    ),
    measurements: bars.map((bar) => ({
      id: String(bar.id),
      kind: 'length',
      value: bar.centerMm,
      unit: 'mm',
    })),
    labels: bars.map((bar) => ({
      point: { x: bar.centerMm, y: height / 2 },
      text: String(bar.id),
      measurementId: String(bar.id),
    })),
  };
  return { gapMm, bars, drawing };
}
