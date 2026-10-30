import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { BranchSaddleCalculator } from './branch-saddle-calculator';

describe('branch saddle controls', () => {
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
