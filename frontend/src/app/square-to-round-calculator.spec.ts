import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { SquareToRoundCalculator } from './square-to-round-calculator';

describe('square-to-round controls', () => {
  it('updates the panel and formed view, preserves dimensions across units and hides invalid results', async () => {
    const fixture = TestBed.createComponent(SquareToRoundCalculator);
    fixture.componentRef.setInput('language', 'en');
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement;
    expect(root.textContent).toContain('Cut 4 identical panels');
    const initial = root.querySelector('polyline')!.getAttribute('points');
    const input = root.querySelector<HTMLInputElement>('#heightMm')!;
    input.value = '200';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(root.querySelector('polyline')!.getAttribute('points')).not.toBe(initial);
    const result = fixture.componentInstance.calculation().result;
    const radios = root.querySelectorAll<HTMLInputElement>('input[type=radio]');
    radios[1].click();
    await fixture.whenStable();
    expect(fixture.componentInstance.calculation().result).toBe(result);
    expect(input.valueAsNumber).toBeCloseTo(200 / 25.4, 12);
    radios[0].click();
    await fixture.whenStable();
    expect(input.valueAsNumber).toBe(200);
    input.value = '';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(root.querySelector('svg')).toBeNull();
    expect(root.querySelector<HTMLButtonElement>('.export')!.disabled).toBe(true);
    expect(root.querySelector('#square-error')).not.toBeNull();
  });
});
