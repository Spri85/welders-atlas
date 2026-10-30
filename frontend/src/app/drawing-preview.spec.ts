import { TestBed } from '@angular/core/testing';
import { expect, it } from 'vitest';
import { DrawingPreview } from './drawing-preview';
import { calculateSquareToRound } from './square-to-round';

it('uses the same measurement for formed and flat reference tooltips', async () => {
  const result = calculateSquareToRound({
    squareWidthMm: 200,
    roundDiameterMm: 100,
    heightMm: 150,
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
