import { TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';
import { By } from '@angular/platform-browser';
import { PatternExport } from './pattern-export';
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
      if (tool.printable) {
        expect(
          root.querySelector<HTMLButtonElement>(
            '.calculator-heading button.export',
          )?.disabled,
        ).toBe(true);
      }
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

it('exports each selected template and keeps selection valid when piece count or tool changes', async () => {
  const tool = calculatorTools.find((tool) => tool.id === 'segmented-elbow')!;
  const fixture = TestBed.createComponent(CalculatorWorkbench);
  fixture.componentRef.setInput('tool', tool);
  fixture.componentRef.setInput('language', 'en');
  await fixture.whenStable();
  const root: HTMLElement = fixture.nativeElement;
  const selector = root.querySelector<HTMLSelectElement>('#export-template')!;
  const exporter = fixture.debugElement.query(By.directive(PatternExport))
    .componentInstance as PatternExport;
  expect(selector.options).toHaveLength(4);
  for (let index = 0; index < 4; index++) {
    selector.value = String(index);
    selector.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    const template =
      fixture.componentInstance.calculation().result!.templates![index];
    expect(exporter.drawing()).toBe(template.drawing);
    expect(exporter.title()).toBe(template.title.en);
  }
  fixture.componentRef.setInput('language', 'ua');
  await fixture.whenStable();
  expect(selector.value).toBe('3');
  expect(exporter.title()).toBe(
    fixture.componentInstance.templates()[3].title.ua,
  );
  const count = root.querySelector<HTMLInputElement>('#tool-count')!;
  count.value = '3';
  count.dispatchEvent(new Event('input'));
  await fixture.whenStable();
  expect(selector.value).toBe('2');
  expect(exporter.drawing()).toBe(
    fixture.componentInstance.templates()[2].drawing,
  );
  fixture.componentRef.setInput(
    'tool',
    calculatorTools.find((tool) => tool.id === 'plate-opening')!,
  );
  await fixture.whenStable();
  expect(selector.value).toBe('0');
  expect(selector.options).toHaveLength(2);
  selector.value = '1';
  selector.dispatchEvent(new Event('change'));
  await fixture.whenStable();
  expect(exporter.drawing()).toBe(
    fixture.componentInstance.templates()[1].drawing,
  );
});
