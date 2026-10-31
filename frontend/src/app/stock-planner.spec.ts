import { TestBed } from '@angular/core/testing';
import { expect, it } from 'vitest';
import { StockPlanner } from './stock-planner';
it('G8 recalculates and clears the plan after invalid entry', async () => {
  const f = TestBed.createComponent(StockPlanner);
  f.componentRef.setInput('language', 'en');
  await f.whenStable();
  expect(f.componentInstance.result()!.bars[0].remainderMm).toBe(194);
  const e: HTMLInputElement = f.nativeElement.querySelector(
    'input[aria-label="Lp1 · Required parts 1 Length"]',
  );
  e.value = '300';
  e.dispatchEvent(new Event('input'));
  await f.whenStable();
  expect(f.componentInstance.result()!.bars[0].remainderMm).toBe(394);
  e.value = '';
  e.dispatchEvent(new Event('input'));
  await f.whenStable();
  expect(f.nativeElement.querySelector('[role=alert]')).not.toBeNull();
  expect(f.nativeElement.querySelector('svg')).toBeNull();
});

it('keeps dynamic row references linked after add/remove and slash-containing IDs', async () => {
  const f = TestBed.createComponent(StockPlanner);
  f.componentRef.setInput('language', 'en');
  f.componentInstance.rows.set({
    parts: [
      { id: 'part/one', group: 'steel', lengthMm: 200, quantity: 1 },
      { id: 'part/two', group: 'steel', lengthMm: 300, quantity: 1 },
    ],
    stock: [{ id: 'stock/one', group: 'steel', lengthMm: 1000, quantity: 1 }],
  });
  await f.whenStable();
  expect(
    f.componentInstance.drawing().labels?.map((label) => label.text),
  ).toEqual(['Ls1', 'Lp2', 'Lp1']);
  f.componentInstance.rows.update((rows) => ({
    ...rows,
    parts: rows.parts.slice(1),
  }));
  await f.whenStable();
  expect(
    f.componentInstance.drawing().labels?.map((label) => label.text),
  ).toEqual(['Ls1', 'Lp1']);
  expect(
    f.componentInstance.inputReferences().map((ref) => ref.id),
  ).not.toContain('Lp2');
});
