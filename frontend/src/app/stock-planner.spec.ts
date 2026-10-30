import { TestBed } from '@angular/core/testing';
import { expect, it } from 'vitest';
import { StockPlanner } from './stock-planner';
it('G8 recalculates and clears the plan after invalid entry', async () => {
  const f = TestBed.createComponent(StockPlanner);
  f.componentRef.setInput('language', 'en');
  await f.whenStable();
  expect(f.componentInstance.result()!.bars[0].remainderMm).toBe(194);
  const e: HTMLInputElement = f.nativeElement.querySelector(
    'input[aria-label="Required parts 1 Length"]',
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
