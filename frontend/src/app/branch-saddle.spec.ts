import { describe, expect, it } from 'vitest';
import { calculateBranchSaddle } from './branch-saddle';
import { drawingCoordinates, drawingLabelText } from './pattern-measurements';

describe('centered perpendicular branch saddle', () => {
  it('returns the 60 on 100 mm reference notch and wrap', () => {
    const result = calculateBranchSaddle({ mainDiameterMm: 100, branchDiameterMm: 60 });
    expect(result.notchDepthMm.toFixed(2)).toBe('10.00');
    expect(result.wrapLengthMm.toFixed(2)).toBe('188.50');
    expect(result.profile[180].y).toBeCloseTo(0, 10);
    expect(result.profile[360].y).toBeCloseTo(10, 10);
    expect(result.drawing.folds).toHaveLength(5);
    expect(result.drawing.labels!.map((label) => label.text)).toEqual(['0°', '90°', '180°', '270°', '360°', 'A', 'B', 'A', 'B', 'A']);
    expect(result.allowance).toBe('zero-allowance');
  });

  it.each([60, 100])('dimensions A and B from the top datum for branch %s', (branchDiameterMm) => {
    const result = calculateBranchSaddle({ mainDiameterMm: 100, branchDiameterMm });
    const a = result.drawing.measurements!.find((measurement) => measurement.id === 'A')!;
    const b = result.drawing.measurements!.find((measurement) => measurement.id === 'B')!;
    expect(a.value).toBe(20);
    expect(b.value).toBeCloseTo(20 + result.notchDepthMm, 12);
    for (const [index, line] of result.drawing.folds!.entries()) {
      expect(line.end.y - line.start.y).toBeCloseTo(index % 2 === 0 ? a.value : b.value, 12);
    }
    const labels = result.drawing.labels!.filter((label) => label.measurementId);
    expect(labels.map((label) => drawingLabelText(result.drawing, label, 'mm', 'en')))
      .toEqual(['A = 20 mm', `B = ${b.value} mm`, 'A = 20 mm', `B = ${b.value} mm`, 'A = 20 mm']);
  });

  it('provides 15-degree metal-marking stations from the top-left datum', () => {
    const result = calculateBranchSaddle({ mainDiameterMm: 100, branchDiameterMm: 60 });
    const coordinates = drawingCoordinates(result.drawing);
    expect(coordinates).toHaveLength(25);
    expect(coordinates[0]).toEqual({ id: '0°', x: 0, y: 20 });
    expect(coordinates[6]).toEqual({ id: '90°', x: result.wrapLengthMm / 4, y: 30 });
    expect(coordinates[12].y).toBeCloseTo(20, 12);
    expect(coordinates[18].y).toBeCloseTo(30, 12);
    expect(coordinates[24].y).toBeCloseTo(20, 12);
    for (let index = 1; index < coordinates.length; index++) {
      expect(coordinates[index].x - coordinates[index - 1].x).toBeCloseTo(result.wrapLengthMm / 24, 10);
      expect(coordinates[index].y).toBeCloseTo(30 - result.profile[index * 30].y, 12);
    }
  });

  it.each([60, 100, 99.999, 0.01])('matches both cylinder surfaces and joins wrap ends for branch %s', (branchDiameterMm) => {
    const result = calculateBranchSaddle({ mainDiameterMm: 100, branchDiameterMm });
    for (const point of result.intersection) {
      expect(Math.hypot(point.y, point.z)).toBeCloseTo(50, 9);
      expect(Math.hypot(point.x, point.y)).toBeCloseTo(branchDiameterMm / 2, 9);
    }
    expect(result.profile[0].y).toBeCloseTo(result.profile.at(-1)!.y, 12);
    expect(result.profile.at(-1)!.x - result.profile[0].x).toBe(result.wrapLengthMm);
    expect(result.drawing.outline.at(-1)!.end).toEqual(result.drawing.outline[0].start);
    if (branchDiameterMm === 100) expect(result.notchDepthMm).toBe(50);
  });

  it.each(['mainDiameterMm', 'branchDiameterMm'] as const)('rejects invalid %s', (field) => {
    for (const value of [0, -1, NaN, Infinity, -Infinity]) {
      expect(() => calculateBranchSaddle({ mainDiameterMm: 100, branchDiameterMm: 60, [field]: value })).toThrow(RangeError);
    }
  });
  it('rejects an oversized branch', () => {
    expect(() => calculateBranchSaddle({ mainDiameterMm: 100, branchDiameterMm: 101 })).toThrow(RangeError);
  });
});
