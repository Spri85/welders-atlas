import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { MeasurementTooltip } from './measurement-tooltip';

@Component({ imports: [MeasurementTooltip], template: '<svg><text measurementTooltip="B = 30 mm">B</text></svg>' })
class TooltipHost {}

describe('measurement tooltips', () => {
  it('keeps the identifier visible and reveals the value on hover and keyboard focus', async () => {
    const fixture = TestBed.createComponent(TooltipHost);
    await fixture.whenStable();
    const label: SVGTextElement = fixture.nativeElement.querySelector('text');
    expect(label.textContent).toBe('B');
    label.dispatchEvent(new Event('mouseenter'));
    expect(document.querySelector('[role=tooltip]')!.textContent).toBe('B = 30 mm');
    label.dispatchEvent(new Event('mouseleave'));
    expect(document.querySelector('[role=tooltip]')).toBeNull();
    label.dispatchEvent(new FocusEvent('focus'));
    expect(document.querySelector('[role=tooltip]')!.textContent).toBe('B = 30 mm');
    label.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    expect(document.querySelector('[role=tooltip]')).toBeNull();
    label.dispatchEvent(new FocusEvent('focus'));
    fixture.destroy();
    expect(document.querySelector('[role=tooltip]')).toBeNull();
  });
});
