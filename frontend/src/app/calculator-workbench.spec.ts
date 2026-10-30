import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { CalculatorWorkbench } from './calculator-workbench';
import { calculatorTools } from './calculator-registry';

describe('calculator workbench integration', () => {
  it.each(calculatorTools)(
    '$ticket updates its result or validation after a numeric edit',
    async (tool) => {
      const fixture = TestBed.createComponent(CalculatorWorkbench);
      fixture.componentRef.setInput('tool', tool);
      fixture.componentRef.setInput('language', 'en');
      await fixture.whenStable();
      expect(fixture.componentInstance.calculation().error).toBeNull();
      const root: HTMLElement = fixture.nativeElement;
      expect(root.querySelector('svg')).not.toBeNull();
      const first = tool.fields.find(
        (field) => !field.choices && !field.optional,
      )!;
      const entry = root.querySelector<HTMLInputElement>(`#tool-${first.id}`)!;
      entry.value = '0';
      entry.dispatchEvent(new Event('input'));
      await fixture.whenStable();
      expect(root.querySelector('#tool-error')).not.toBeNull();
      expect(root.querySelector('svg')).toBeNull();
    },
  );
});

describe('shared calculator units and translations', () => {
  it.each(calculatorTools)(
    '$ticket preserves canonical values when switching display units and language',
    async (tool) => {
      const fixture = TestBed.createComponent(CalculatorWorkbench);
      fixture.componentRef.setInput('tool', tool);
      fixture.componentRef.setInput('language', 'en');
      await fixture.whenStable();
      const root: HTMLElement = fixture.nativeElement;
      const initial = { ...fixture.componentInstance.values() };
      const metrics = fixture.componentInstance.calculation().result!.metrics;
      const radios = root.querySelectorAll<HTMLInputElement>(
        'input[name=tool-units]',
      );
      radios[1].click();
      await fixture.whenStable();
      const length = tool.fields.find(
        (field) =>
          (field.unit === 'mm' || field.unit === 'mm/min') &&
          (!field.when || field.when(initial)),
      );
      if (length)
        expect(
          +root.querySelector<HTMLInputElement>(`#tool-${length.id}`)!.value,
        ).toBeCloseTo(initial[length.id] / 25.4, 10);
      expect(fixture.componentInstance.values()).toEqual(initial);
      expect(fixture.componentInstance.calculation().result!.metrics).toEqual(
        metrics,
      );
      radios[0].click();
      for (const language of ['ua', 'ru', 'en'] as const) {
        fixture.componentRef.setInput('language', language);
        await fixture.whenStable();
        expect(root.querySelector('h2')!.textContent).toBe(
          tool.title[language],
        );
        expect(fixture.componentInstance.calculation().error).toBeNull();
        expect(fixture.componentInstance.values()).toEqual(initial);
      }
    },
  );
});
