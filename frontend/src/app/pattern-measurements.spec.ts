import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { calculateSquareTransition } from './calculators/square-transition';
import { calculateSquareToRound } from './square-to-round';
import { drawingBounds } from './pattern-drawing';
import {
  drawingCoordinates,
  drawingMeasurements,
  formatPatternMeasurement,
} from './pattern-measurements';
import { PatternDimensions } from './pattern-dimensions';

describe('flat pattern dimensions', () => {
  const drawing = calculateSquareToRound({
    squareWidthMm: 200,
    roundDiameterMm: 100,
    heightMm: 150,
  }).drawing;

  it('reports every perimeter and fold edge against its numbered endpoints', () => {
    expect(drawing.vertices).toHaveLength(7);
    expect(drawing.measurements).toHaveLength(14);
    const lines = [...drawing.outline, ...drawing.folds!];
    const edges = drawing.measurements!.filter(
      (item) => item.kind === 'edge' || item.kind === 'fold',
    );
    for (const [index, measurement] of edges.entries()) {
      const line = lines[index];
      expect(measurement.value).toBeCloseTo(
        Math.hypot(line.end.x - line.start.x, line.end.y - line.start.y),
        10,
      );
      const [from, to] = measurement.id.split('–');
      expect(
        drawing.vertices!.find((point) => point.id === from)!.point,
      ).toEqual(line.start);
      expect(drawing.vertices!.find((point) => point.id === to)!.point).toEqual(
        line.end,
      );
    }
  });

  it('uses a shared lower-left origin and includes overall extents', () => {
    const bounds = drawingBounds(drawing);
    const coordinates = drawingCoordinates(drawing);
    expect(coordinates[0]).toEqual({ id: '1', x: 0, y: 0 });
    expect(coordinates[1]).toEqual({ id: '2', x: 200, y: 0 });
    expect(drawingMeasurements(drawing).slice(0, 2)).toEqual([
      { id: 'W', kind: 'width', unit: 'mm', value: bounds.width },
      { id: 'Hflat', kind: 'height', unit: 'mm', value: bounds.height },
    ]);
  });

  it('converts length units and preserves angles', () => {
    expect(formatPatternMeasurement(25.4, 'mm', 'in', 'en')).toBe('1 in');
    expect(formatPatternMeasurement(200, 'mm', 'in', 'en')).toBe('7.874 in');
    expect(formatPatternMeasurement(90, 'degree', 'in', 'en')).toBe('90°');
  });

  it('renders all dimensions and updates translation and units', async () => {
    const fixture = TestBed.createComponent(PatternDimensions);
    fixture.componentRef.setInput('drawing', drawing);
    fixture.componentRef.setInput('language', 'en');
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelectorAll('tbody tr')).toHaveLength(23);
    expect(root.textContent).toContain('200 mm');
    expect(root.textContent).toContain('Fold / reference');
    fixture.componentRef.setInput('unit', 'in');
    fixture.componentRef.setInput('language', 'ua');
    await fixture.whenStable();
    expect(root.textContent).toContain('7,874 дюйм');
    expect(root.textContent).toContain('Координати вершин');
  });
});

it('uses L for square-transition flat height without reusing assembled H in the PDF reference', () => {
  const drawing = calculateSquareTransition(300, 180, 80).drawing;
  const rows = drawingMeasurements(drawing);
  expect(rows.find((row) => row.id === 'L')).toEqual({
    id: 'L',
    kind: 'height',
    unit: 'mm',
    value: 100,
  });
  expect(rows.some((row) => row.id === 'H')).toBe(false);
  expect(rows.filter((row) => row.kind === 'height')).toHaveLength(1);
  expect(rows.find((row) => row.id === 'W')?.value).toBe(300);
});
