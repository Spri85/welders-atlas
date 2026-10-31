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
        const fields = tool.fields.filter(
          (field) => !field.when || field.when(initial),
        );
        const references = root.querySelectorAll('[data-input-reference]');
        expect(references).toHaveLength(fields.length);
        for (const [index, field] of fields.entries()) {
          expect(references[index].textContent).toContain(
            field.label[language],
          );
          expect(
            references[index].querySelector('dd')?.textContent,
          ).not.toMatch(/NaN|undefined|Infinity/);
        }
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

it.each(['en', 'ua', 'ru'] as const)(
  'connects square transition input references to formed, flat and side views in %s',
  async (language) => {
    const fixture = TestBed.createComponent(CalculatorWorkbench);
    fixture.componentRef.setInput(
      'tool',
      calculatorTools.find((tool) => tool.id === 'square-transition')!,
    );
    fixture.componentRef.setInput('language', language);
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement;
    for (const [field, letter] of [
      ['inlet', 'A'],
      ['outlet', 'B'],
      ['height', 'H'],
    ]) {
      expect(
        root.querySelector(`label[for=tool-${field}]`)?.textContent?.trim(),
      ).toMatch(new RegExp(`^${letter} ·`));
    }
    const primary = root.querySelector('app-drawing-preview')!;
    const label = (scope: Element, id: string) =>
      Array.from(scope.querySelectorAll('svg text')).find(
        (node) => node.textContent === id,
      );
    for (const [id, expected] of [
      ['A', '300'],
      ['B', '180'],
      ['H', '80'],
      ['L', '100'],
    ]) {
      expect(label(primary, id)?.getAttribute('aria-label')).toContain(
        expected,
      );
    }
    expect(root.querySelector('[data-metric=H]')?.textContent).toContain('80');
    expect(root.querySelector('[data-metric=L]')?.textContent).toContain('100');
    const radios = root.querySelectorAll<HTMLInputElement>(
      'input[name=tool-units]',
    );
    radios[1].click();
    await fixture.whenStable();
    expect(label(primary, 'H')?.getAttribute('aria-label')).toMatch(
      /3[.,]1496/,
    );
    expect(label(primary, 'L')?.getAttribute('aria-label')).toMatch(/3[.,]937/);
    radios[0].click();
    const height = root.querySelector<HTMLInputElement>('#tool-height')!;
    await fixture.whenStable();
    height.value = '120';
    height.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    expect(label(primary, 'H')?.getAttribute('aria-label')).toContain('120');
    expect(label(primary, 'L')?.getAttribute('aria-label')).toMatch(
      /134[.,]16/,
    );
    primary.querySelectorAll<HTMLButtonElement>('button')[1].click();
    await fixture.whenStable();
    expect(label(primary, 'H')).toBeUndefined();
    expect(label(primary, 'L')?.getAttribute('aria-label')).toMatch(
      /134[.,]16/,
    );
    const side = root.querySelectorAll('app-drawing-preview')[1];
    expect(label(side, 'H')?.getAttribute('aria-label')).toContain('120');
  },
);

it('updates the diagram key for conditional fields, optional values and units', async () => {
  const fixture = TestBed.createComponent(CalculatorWorkbench);
  fixture.componentRef.setInput(
    'tool',
    calculatorTools.find((tool) => tool.id === 'stock-mass')!,
  );
  fixture.componentRef.setInput('language', 'en');
  await fixture.whenStable();
  const root: HTMLElement = fixture.nativeElement;
  const mode = root.querySelector<HTMLSelectElement>('#tool-mode')!;
  mode.value = '1';
  mode.dispatchEvent(new Event('change'));
  await fixture.whenStable();
  const refs = fixture.componentInstance.inputReferences();
  expect(refs.map((ref) => ref.id)).toContain('μ');
  expect(refs.map((ref) => ref.id)).not.toContain('W');
  expect(refs.find((ref) => ref.id === 'J')?.value).toBe(
    mode.selectedOptions[0].textContent?.trim(),
  );
});

it('keeps per-cycle gas times distinct from timeline totals and displays omitted inputs as a dash', async () => {
  const fixture = TestBed.createComponent(CalculatorWorkbench);
  fixture.componentRef.setInput(
    'tool',
    calculatorTools.find((tool) => tool.id === 'gas-budget')!,
  );
  fixture.componentRef.setInput('language', 'en');
  await fixture.whenStable();
  const root: HTMLElement = fixture.nativeElement;
  expect(
    root.querySelector('[data-input-reference="t₁"] dd')?.textContent,
  ).toBe('1 s');
  expect(root.querySelector('[data-metric=P]')?.textContent?.trim()).toBe(
    '0.5 min',
  );
  const pre = root.querySelector<HTMLInputElement>('#tool-pre')!;
  pre.value = '2';
  pre.dispatchEvent(new Event('input'));
  const available = root.querySelector<HTMLInputElement>('#tool-available')!;
  available.value = '';
  available.dispatchEvent(new Event('input'));
  await fixture.whenStable();
  expect(
    root.querySelector('[data-input-reference="t₁"] dd')?.textContent,
  ).toBe('2 s');
  expect(root.querySelector('[data-metric=P]')?.textContent?.trim()).toBe(
    '1 min',
  );
  expect(
    root.querySelector('[data-input-reference="V₀"] dd')?.textContent,
  ).toBe('—');
  expect(fixture.componentInstance.calculation().error).toBeNull();
});
