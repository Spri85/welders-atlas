import { Component, computed, input, signal } from '@angular/core';
import { calculateSquareToRound, type SquareToRoundDimensions } from './square-to-round';
import { squareToRoundCopy } from './square-to-round-copy';
import { reducerCopy } from './reducer-copy';
import { DrawingPreview, type ModelLine } from './drawing-preview';
import { PatternExport } from './pattern-export';
import type { Language } from './export-copy';

@Component({
  selector: 'app-square-to-round-calculator',
  imports: [DrawingPreview, PatternExport],
  templateUrl: './square-to-round-calculator.html',
  styleUrl: './calculator.css',
})
export class SquareToRoundCalculator {
  readonly language = input<Language>('ua');
  readonly text = computed(() => squareToRoundCopy[this.language()]);
  readonly common = computed(() => reducerCopy[this.language()]);
  readonly unit = signal<'mm' | 'in'>('mm');
  readonly factor = computed(() => this.unit() === 'mm' ? 1 : 25.4);
  readonly unitLabel = computed(() => this.unit() === 'mm' ? this.common().unitMm : this.common().unitIn);
  readonly dimensions = signal<SquareToRoundDimensions>({ squareWidthMm: 200, roundDiameterMm: 100, heightMm: 150 });
  readonly fields = [
    { key: 'squareWidthMm', label: 'width' }, { key: 'roundDiameterMm', label: 'outlet' }, { key: 'heightMm', label: 'height' },
  ] as const;
  readonly calculation = computed(() => {
    const values = this.dimensions();
    if (!Object.values(values).every((value) => Number.isFinite(value) && value > 0)) return { result: null, error: this.common().positive };
    if (values.roundDiameterMm >= values.squareWidthMm) return { result: null, error: this.text().smaller };
    try {
      return { result: calculateSquareToRound(values), error: null };
    } catch (error) {
      if (!(error instanceof RangeError)) throw error;
      return { result: null, error: this.common().range };
    }
  });
  readonly model = computed<ModelLine[]>(() => {
    const result = this.calculation().result;
    if (!result) return [];
    return result.formedPanels.flatMap((panel) => [
      ...result.triangles.map((triangle) => ({ points: [...triangle.map((index) => panel[index]), panel[triangle[0]]] })),
      { points: [panel[0], panel[2]], seam: true, label: 'A' },
    ]);
  });
  readonly summary = computed(() => `${this.text().width} ${this.measurement(this.dimensions().squareWidthMm)} / ${this.text().outlet} ${this.measurement(this.dimensions().roundDiameterMm)} / ${this.text().height} ${this.measurement(this.dimensions().heightMm)}. ${this.text().approximation}`);

  inputValue(field: keyof SquareToRoundDimensions): number | string {
    const value = this.dimensions()[field];
    return Number.isFinite(value) ? value / this.factor() : '';
  }

  update(field: keyof SquareToRoundDimensions, value: number): void {
    this.dimensions.update((values) => ({ ...values, [field]: value * this.factor() }));
  }

  measurement(mm: number): string {
    return `${new Intl.NumberFormat(this.language() === 'ua' ? 'uk' : this.language(), { maximumFractionDigits: 2 }).format(mm / this.factor())} ${this.unitLabel()}`;
  }
}
