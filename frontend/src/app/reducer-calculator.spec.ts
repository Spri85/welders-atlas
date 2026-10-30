import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, beforeEach, it, expect } from 'vitest';
import { calculateCenteredRoundReducer } from './centered-round-reducer';
import { ReducerCalculator } from './reducer-calculator';

describe('Reducer calculator', () => {
  let fixture: ComponentFixture<ReducerCalculator>;
  let root: HTMLElement;

  beforeEach(async () => {
    fixture = TestBed.createComponent(ReducerCalculator);
    fixture.componentRef.setInput('language', 'en');
    await fixture.whenStable();
    root = fixture.nativeElement;
  });

  async function enter(id: string, value: string): Promise<void> {
    const input = root.querySelector<HTMLInputElement>(`#${id}`)!;
    input.value = value;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    await fixture.whenStable();
  }

  async function click(selector: string): Promise<void> {
    root.querySelector<HTMLElement>(selector)!.click();
    await fixture.whenStable();
  }

  it('renders the reference measurements and matching seam identifiers in both views', async () => {
    expect(root.querySelector('[data-result=slant]')!.textContent).toContain('158.11 mm');
    expect(root.textContent).toContain('316.23 mm');
    expect(root.textContent).toContain('113.84°');
    expect(root.querySelectorAll('svg .seam-label')).toHaveLength(1);

    await click('.view-buttons button:last-child');
    expect(root.querySelector('[data-view=flat]')).not.toBeNull();
    expect(root.querySelectorAll('svg .seam-label')).toHaveLength(2);
    expect(root.querySelector('svg')!.textContent).toContain('A = 158.11 mm');
    expect(root.textContent).toContain('Zero-allowance pattern');
    expect(root.querySelector<HTMLButtonElement>('.export')!.disabled).toBe(true);
  });

  it.each([
    ['inletDiameterMm', '240'],
    ['outletDiameterMm', '120'],
    ['axialLengthMm', '200'],
  ])('updates both previews and cut dimensions when %s changes', async (field, value) => {
    const initialFormed = root.querySelector('[data-view=formed]')!.innerHTML;
    const initialFlat = fixture.componentInstance.flat()!.path;
    await enter(field, value);
    expect(root.querySelector('[data-view=formed]')!.innerHTML).not.toBe(initialFormed);
    const expected = calculateCenteredRoundReducer(fixture.componentInstance.dimensions());
    expect(root.querySelector('[data-result=slant]')!.textContent)
      .toContain(fixture.componentInstance.measurement(expected.slantHeightMm));

    await click('.view-buttons button:last-child');
    expect(root.querySelector('path')!.getAttribute('d')).not.toBe(initialFlat);
    expect(root.querySelector('path')!.getAttribute('d')).toBe(fixture.componentInstance.flat()!.path);
  });

  it('preserves physical dimensions through unit changes and accepts decimal inch edits', async () => {
    const dimensions = fixture.componentInstance.dimensions();
    const pattern = fixture.componentInstance.calculation().pattern;
    const originalPoints = root.querySelector('polyline')!.getAttribute('points');
    await click('input[value=in]');
    expect(root.querySelector<HTMLInputElement>('#inletDiameterMm')!.valueAsNumber).toBeCloseTo(200 / 25.4, 12);
    expect(root.querySelector('[data-result=slant]')!.textContent).toContain('6.22 in');
    expect(fixture.componentInstance.dimensions()).toBe(dimensions);
    expect(fixture.componentInstance.calculation().pattern).toBe(pattern);
    expect(root.querySelector('polyline')!.getAttribute('points')).toBe(originalPoints);
    await click('input[value=mm]');
    expect(root.querySelector<HTMLInputElement>('#inletDiameterMm')!.valueAsNumber).toBe(200);
    await click('input[value=in]');
    await enter('axialLengthMm', '6.5');
    expect(fixture.componentInstance.dimensions().axialLengthMm).toBeCloseTo(165.1, 12);
    await click('input[value=mm]');
    expect(root.querySelector<HTMLInputElement>('#axialLengthMm')!.valueAsNumber).toBeCloseTo(165.1, 12);
  });

  it.each(['', '0', '-1', '200', '250', '1e999'])('hides stale measurements and previews for invalid outlet %s', async (value) => {
    await click('.view-buttons button:last-child');
    await enter('outletDiameterMm', value);
    expect(root.querySelector('svg')).toBeNull();
    expect(root.querySelector('.measurements')).toBeNull();
    expect(root.querySelector('#reducer-error')!.textContent!.length).toBeGreaterThan(0);
    expect(root.querySelector('#outletDiameterMm')!.getAttribute('aria-invalid')).toBe('true');
    expect(root.querySelector<HTMLButtonElement>('.export')!.disabled).toBe(true);
    await enter('outletDiameterMm', '100');
    expect(root.querySelector('[data-view=flat]')).not.toBeNull();
    expect(root.querySelector('[data-result=slant]')!.textContent).toContain('158.11 mm');
    expect(root.querySelector('#reducer-error')).toBeNull();
  });

  it('rotates and tilts the fitting through labelled native range controls', async () => {
    const initialSeam = root.querySelector('svg .seam')!.getAttribute('x1');
    await enter('rotation', '120');
    expect(root.querySelector('svg .seam')!.getAttribute('x1')).not.toBe(initialSeam);
    const initialRing = root.querySelector('polyline')!.getAttribute('points');
    await enter('tilt', '100');
    expect(root.querySelector('polyline')!.getAttribute('points')).not.toBe(initialRing);
    expect(root.querySelector('label[for=rotation]')!.textContent).toContain('120°');
    expect(root.querySelector('label[for=tilt]')!.textContent).toContain('100°');
    expect(root.querySelector<HTMLInputElement>('#rotation')!.type).toBe('range');
  });

  it.each([
    ['ua', 'Вхідний діаметр', 'Розгортка без припусків', 'Вихідний діаметр має бути меншим за вхідний.'],
    ['ru', 'Входной диаметр', 'Развёртка без припусков', 'Выходной диаметр должен быть меньше входного.'],
    ['en', 'Inlet diameter', 'Zero-allowance pattern', 'Outlet diameter must be smaller than inlet diameter.'],
  ])('translates controls, results and validation in %s', async (language, inlet, allowance, error) => {
    fixture.componentRef.setInput('language', language);
    await fixture.whenStable();
    expect(root.querySelector('label[for=inletDiameterMm]')!.textContent).toContain(inlet);
    expect(root.querySelector('.allowance')!.textContent).toContain(allowance);
    await enter('outletDiameterMm', '200');
    expect(root.querySelector('#reducer-error')!.textContent).toContain(error);
  });

  it('keeps the shallow taper outline finite and inside the preview', async () => {
    await enter('outletDiameterMm', '199');
    await click('.view-buttons button:last-child');
    const flat = fixture.componentInstance.flat()!;
    expect(flat.path).not.toMatch(/NaN|Infinity/);
    for (const seam of flat.seams) {
      for (const point of [seam.start, seam.end]) {
        expect(point.x).toBeGreaterThanOrEqual(0);
        expect(point.x).toBeLessThanOrEqual(560);
        expect(point.y).toBeGreaterThanOrEqual(60);
        expect(point.y).toBeLessThanOrEqual(300);
      }
    }
  });
});
