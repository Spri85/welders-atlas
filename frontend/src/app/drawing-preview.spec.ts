import { TestBed } from '@angular/core/testing';
import { expect, it } from 'vitest';
import { DrawingPreview } from './drawing-preview';
import { calculateGateBars } from './calculators/gate-bars';
import { drawingBounds } from './pattern-drawing';
import { calculateSquareToRound } from './square-to-round';

it('uses the same measurement for formed and flat reference tooltips', async () => {
  const result = calculateSquareToRound({
    squareWidthMm: 200,
    roundDiameterMm: 100,
    heightMm: 150, maxDeviationMm: 1,
  });
  const fixture = TestBed.createComponent(DrawingPreview);
  fixture.componentRef.setInput('drawing', result.drawing);
  fixture.componentRef.setInput('title', 'Square-to-round');
  fixture.componentRef.setInput('language', 'en');
  fixture.componentRef.setInput('model', [
    {
      points: [
        { x: 0, y: 0, z: 0 },
        { x: 20, y: 20, z: 20 },
      ],
      label: 'A',
    },
  ]);
  await fixture.whenStable();
  const root: HTMLElement = fixture.nativeElement;
  const formed = root.querySelector('svg text')!.getAttribute('aria-label');
  expect(formed).toMatch(/^A = [\d.,]+ mm$/);
  fixture.componentInstance.view.set('flat');
  await fixture.whenStable();
  const flat = Array.from(root.querySelectorAll('svg text')).find(
    (node) => node.textContent === 'A',
  )!;
  expect(flat.getAttribute('aria-label')).toBe(formed);
  fixture.componentRef.setInput('unit', 'in');
  await fixture.whenStable();
  expect(flat.getAttribute('aria-label')).toContain('in');
});

it.each([1, 5])(
  'fits the full gate frame for %i bars without changing cut bounds',
  async (count) => {
    const drawing = calculateGateBars(1000, 20, count).drawing;
    const fixture = TestBed.createComponent(DrawingPreview);
    fixture.componentRef.setInput('drawing', drawing);
    fixture.componentRef.setInput('title', 'Gate spacing');
    await fixture.whenStable();
    const flat = fixture.componentInstance.flat();
    for (const edge of flat.construction) {
      for (const point of [edge.start, edge.end]) {
        expect(point.x).toBeGreaterThanOrEqual(50);
        expect(point.x).toBeLessThanOrEqual(510);
        expect(point.y).toBeGreaterThanOrEqual(45);
        expect(point.y).toBeLessThanOrEqual(315);
      }
    }
    expect(drawingBounds(drawing).width).toBe(count === 5 ? 700 : 20);
    expect(flat.width).toBe(count === 5 ? 700 : 20);
  },
);
