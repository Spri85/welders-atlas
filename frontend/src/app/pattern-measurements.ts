import { drawingBounds, type PatternDrawing, type PatternMeasurement } from './pattern-drawing';
import type { Language } from './export-copy';

const lengthUnits = {
  en: { mm: 'mm', in: 'in' },
  ua: { mm: 'мм', in: 'дюйм' },
  ru: { mm: 'мм', in: 'дюйм' },
};

export function drawingMeasurements(drawing: PatternDrawing): readonly PatternMeasurement[] {
  const bounds = drawingBounds(drawing);
  return [
    { id: 'W', kind: 'width', value: bounds.width, unit: 'mm' },
    { id: 'H', kind: 'height', value: bounds.height, unit: 'mm' },
    ...(drawing.measurements ?? []),
  ];
}

export function drawingCoordinates(drawing: PatternDrawing) {
  const bounds = drawingBounds(drawing);
  return (drawing.vertices ?? []).map((vertex) => ({
    id: vertex.id, x: vertex.point.x - bounds.minX, y: vertex.point.y - bounds.minY,
  }));
}

export function formatPatternMeasurement(value: number, measurementUnit: 'mm' | 'degree', unit: 'mm' | 'in', language: Language): string {
  const converted = measurementUnit === 'degree' || unit === 'mm' ? value : value / 25.4;
  const number = new Intl.NumberFormat(language === 'ua' ? 'uk' : language, { maximumFractionDigits: measurementUnit === 'mm' && unit === 'in' ? 4 : 2 }).format(converted);
  if (measurementUnit === 'degree') return `${number}°`;
  return `${number} ${lengthUnits[language][unit]}`;
}
