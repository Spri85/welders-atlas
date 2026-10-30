import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { BranchSaddleCalculator } from './branch-saddle-calculator';

describe('branch saddle controls', () => {
  it('shows A/B heights on the flat outline and recalculates them after an edit', async () => {
    const fixture = TestBed.createComponent(BranchSaddleCalculator);
    fixture.componentRef.setInput('language', 'en');
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement;
    root.querySelectorAll<HTMLButtonElement>('.view-buttons button')[1].click();
    await fixture.whenStable();
    expect(root.querySelector('svg text[aria-label="B = 30 mm"]')).not.toBeNull();
    expect(root.querySelectorAll('table[aria-label="Vertex coordinates"] tbody tr')).toHaveLength(25);
    const field = root.querySelector<HTMLInputElement>('#branchDiameterMm')!;
    field.value = '100';
    field.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(root.querySelector('svg text[aria-label="B = 70 mm"]')).not.toBeNull();
    expect(root.querySelector('svg text[aria-label="A = 20 mm"]')).not.toBeNull();
    root.querySelectorAll<HTMLInputElement>('input[type=radio]')[1].click();
    await fixture.whenStable();
    expect(root.querySelector('svg text[aria-label="B = 2.7559 in"]')).not.toBeNull();
  });

  it('shows reference dimensions, accepts equal pipes and hides stale results for an oversized branch', async () => {
    const fixture = TestBed.createComponent(BranchSaddleCalculator);
    fixture.componentRef.setInput('language', 'en');
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement;
    expect(root.textContent).toContain('188.5 mm');
    expect(root.textContent).toContain('10 mm');
    const field = root.querySelector<HTMLInputElement>('#branchDiameterMm')!;
    field.value = '100';
    field.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(root.querySelector('svg')).not.toBeNull();
    expect(fixture.componentInstance.calculation().result!.notchDepthMm).toBe(50);
    field.value = '101';
    field.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(root.querySelector('svg')).toBeNull();
    expect(root.querySelector('.measurements')).toBeNull();
    expect(root.querySelector<HTMLButtonElement>('.export')!.disabled).toBe(true);
  });
});
