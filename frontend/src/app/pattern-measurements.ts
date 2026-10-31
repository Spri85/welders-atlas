import { drawingBounds, type PatternDrawing, type PatternLabel, type PatternMeasurement } from './pattern-drawing';
import type { Language } from './export-copy';

const lengthUnits = {
  en: { mm: 'mm', in: 'in' },
  ua: { mm: 'мм', in: 'дюйм' },
  ru: { mm: 'мм', in: 'дюйм' },
};

export function drawingMeasurements(drawing: PatternDrawing): readonly PatternMeasurement[] {
  const bounds = drawingBounds(drawing);
  const measurements = drawing.measurements ?? [];
  return [
    ...(!measurements.some((item) => item.kind === 'width')
      ? [{ id: 'W', kind: 'width' as const, value: bounds.width, unit: 'mm' as const }]
      : []),
    ...(!measurements.some((item) => item.kind === 'height')
      ? [{ id: 'H', kind: 'height' as const, value: bounds.height, unit: 'mm' as const }]
      : []),
    ...measurements,
  ];
}

export function drawingCoordinates(drawing: PatternDrawing) {
  const bounds = drawingBounds(drawing);
  return (drawing.coordinatePoints ?? drawing.vertices ?? []).map((vertex) => ({
    id: vertex.id, x: drawing.coordinateOrigin === 'origin' ? vertex.point.x : vertex.point.x - bounds.minX,
    y: drawing.coordinateOrigin === 'origin' ? vertex.point.y : drawing.coordinateOrigin === 'upper-left' ? bounds.maxY - vertex.point.y : vertex.point.y - bounds.minY,
  }));
}

export function drawingLabelText(drawing: PatternDrawing, label: PatternLabel, unit: 'mm' | 'in', language: Language): string {
  const measurement = drawing.measurements?.find((item) => item.id === label.measurementId);
  if (!measurement) return label.text;
  return `${label.text} = ${formatPatternMeasurement(measurement.value, measurement.unit, unit, language)}`;
}

export function formatPatternMeasurement(value: number, measurementUnit: 'mm' | 'degree', unit: 'mm' | 'in', language: Language): string {
  const converted = measurementUnit === 'degree' || unit === 'mm' ? value : value / 25.4;
  const number = new Intl.NumberFormat(language === 'ua' ? 'uk' : language, { maximumFractionDigits: measurementUnit === 'mm' && unit === 'in' ? 4 : 2 }).format(converted);
  if (measurementUnit === 'degree') return `${number}°`;
  return `${number} ${lengthUnits[language][unit]}`;
}
