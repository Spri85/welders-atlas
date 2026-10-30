import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CalculatorWorkbench } from './calculator-workbench';
import { calculatorTools } from './calculator-registry';

describe('calculator workbench integration', () => {
  it.each(calculatorTools)('$ticket updates its result or validation after a numeric edit', async (tool) => {
    const fixture = TestBed.createComponent(CalculatorWorkbench);
    fixture.componentRef.setInput('tool', tool);
    fixture.componentRef.setInput('language', 'en');
    await fixture.whenStable();
    expect(fixture.componentInstance.calculation().error).toBeNull();
    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('svg')).not.toBeNull();
    const first = tool.fields.find((field) => !field.choices && !field.optional)!;
    const entry = root.querySelector<HTMLInputElement>(`#tool-${first.id}`)!;
    entry.value = '0';
    entry.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(root.querySelector('#tool-error')).not.toBeNull();
    expect(root.querySelector('svg')).toBeNull();
  });
});
