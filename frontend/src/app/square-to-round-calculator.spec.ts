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
    expect(root.querySelector('polyline')!.getAttribute('points')).not.toBe(
      initial,
    );
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
    expect(root.querySelector<HTMLButtonElement>('.export')!.disabled).toBe(
      true,
    );
    expect(root.querySelector('#square-error')).not.toBeNull();
  });
});

it('recalculates segmentation, instructions and export while preserving tolerance across units and languages', async () => {
  const fixture = TestBed.createComponent(SquareToRoundCalculator);
  fixture.componentRef.setInput('language', 'en');
  await fixture.whenStable();
  const root: HTMLElement = fixture.nativeElement;
  const enter = async (id: string, value: string) => {
    const input = root.querySelector<HTMLInputElement>(`#${id}`)!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
  };
  expect(root.querySelector<HTMLInputElement>('#maxDeviationMm')!.value).toBe(
    '1',
  );
  await enter('squareWidthMm', '2000');
  await enter('roundDiameterMm', '1500');
  expect(root.querySelector('[data-result=segments]')!.textContent).toBe('64');
  expect(root.querySelector('[data-result=per-panel]')!.textContent).toBe('16');
  expect(fixture.componentInstance.layoutInstructions()).toContain('Place 11');
  expect(fixture.componentInstance.layoutInstructions()).toContain('3–19');
  expect(fixture.componentInstance.summary()).toContain('64');
  root.querySelectorAll<HTMLButtonElement>('.view-buttons button')[1].click();
  await fixture.whenStable();
  expect(root.querySelectorAll('svg .vertex')).toHaveLength(19);
  expect(root.querySelectorAll('svg .vertex-label').length).toBeLessThan(19);
  expect(
    Array.from(
      root.querySelectorAll('svg .vertex-label'),
      (node) => node.textContent,
    ),
  ).toContain('11');
  expect(
    Array.from(
      root.querySelectorAll('svg .vertex-label'),
      (node) => node.textContent,
    ),
  ).toContain('19');
  const oldDrawing = fixture.componentInstance.calculation().result!.drawing;
  await enter('maxDeviationMm', '4');
  expect(root.querySelector('[data-result=segments]')!.textContent).toBe('32');
  expect(fixture.componentInstance.calculation().result!.drawing).not.toBe(
    oldDrawing,
  );
  expect(fixture.componentInstance.layoutInstructions()).toContain('3–11');
  root.querySelectorAll<HTMLInputElement>('input[type=radio]')[1].click();
  await fixture.whenStable();
  expect(
    root.querySelector<HTMLInputElement>('#maxDeviationMm')!.valueAsNumber,
  ).toBeCloseTo(4 / 25.4, 12);
  for (const language of ['ua', 'ru', 'en']) {
    fixture.componentRef.setInput('language', language);
    await fixture.whenStable();
    expect(root.querySelector('[data-result=segments]')!.textContent).toBe(
      '32',
    );
    expect(fixture.componentInstance.dimensions().maxDeviationMm).toBe(4);
    expect(
      root.querySelector('[data-input-reference="ε"]')!.textContent,
    ).toContain(fixture.componentInstance.text().deviation);
  }
  await enter('maxDeviationMm', '');
  expect(root.querySelector('svg')).toBeNull();
  expect(root.querySelector<HTMLButtonElement>('.export')!.disabled).toBe(true);
  await enter('maxDeviationMm', '0.00000000001');
  expect(root.querySelector('#square-error')!.textContent).toContain('1024');
  expect(root.querySelector('svg')).toBeNull();
});
