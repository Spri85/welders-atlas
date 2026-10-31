import { modelDimension } from './pattern-geometry';
import { Component, computed, input, signal } from '@angular/core';
import {
  calculateSquareToRound,
  type SquareToRoundDimensions,
} from './square-to-round';
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
  readonly factor = computed(() => (this.unit() === 'mm' ? 1 : 25.4));
  readonly unitLabel = computed(() =>
    this.unit() === 'mm' ? this.common().unitMm : this.common().unitIn,
  );
  readonly dimensions = signal<SquareToRoundDimensions>({
    squareWidthMm: 200,
    roundDiameterMm: 100,
    heightMm: 150,
    maxDeviationMm: 1,
  });
  readonly fields = [
    { key: 'squareWidthMm', label: 'width', reference: 'S' },
    { key: 'roundDiameterMm', label: 'outlet', reference: 'D' },
    { key: 'heightMm', label: 'height', reference: 'H' },
    { key: 'maxDeviationMm', label: 'deviation', reference: 'ε' },
  ] as const;
  readonly inputReferences = computed(() =>
    this.fields.map((field) => ({
      id: field.reference,
      label: this.text()[field.label],
      value: this.measurement(this.dimensions()[field.key]),
    })),
  );
  readonly calculation = computed(() => {
    const values = this.dimensions();
    if (
      !Object.values(values).every(
        (value) => Number.isFinite(value) && value > 0,
      )
    )
      return { result: null, error: this.common().positive };
    if (values.roundDiameterMm >= values.squareWidthMm)
      return { result: null, error: this.text().smaller };
    try {
      return { result: calculateSquareToRound(values), error: null };
    } catch (error) {
      if (!(error instanceof RangeError)) throw error;
      return { result: null, error: this.text().range };
    }
  });
  readonly model = computed<ModelLine[]>(() => {
    const result = this.calculation().result;
    if (!result) return [];
    const model: ModelLine[] = result.formedPanels.flatMap((panel) => [
      ...result.triangles.map((triangle) => ({
        points: [...triangle.map((index) => panel[index]), panel[triangle[0]]],
      })),
      { points: [panel[0], panel[2]], seam: true, label: 'A' },
    ]);
    const {
      squareWidthMm: side,
      roundDiameterMm: diameter,
      heightMm: height,
    } = this.dimensions();
    return [
      ...model,
      modelDimension(
        { x: -side / 2, y: -side / 2, z: 0 },
        { x: side / 2, y: -side / 2, z: 0 },
        'S',
      ),
      modelDimension(
        { x: -diameter / 2, y: 0, z: height },
        { x: diameter / 2, y: 0, z: height },
        'D',
      ),
      modelDimension(
        { x: side * 0.6, y: -side * 0.6, z: 0 },
        { x: side * 0.6, y: -side * 0.6, z: height },
        'H',
      ),
      {
        points: [
          { x: side / 2, y: -side / 2, z: 0 },
          { x: side * 0.6, y: -side * 0.6, z: 0 },
        ],
        construction: true,
      },
      {
        points: [
          { x: diameter / 2, y: 0, z: height },
          { x: side * 0.6, y: -side * 0.6, z: height },
        ],
        construction: true,
      },
    ];
  });
  readonly vertexLabelIds = computed(() => {
    const result = this.calculation().result;
    if (!result) return [];
    const stride = Math.ceil(result.segmentsPerPanel / 8);
    return result.flatVertices.flatMap((_, index) =>
      index < 2 ||
      index + 1 === result.centerPointId ||
      index + 1 === result.lastPointId ||
      (index - 2) % stride === 0
        ? [String(index + 1)]
        : [],
    );
  });
  readonly layoutInstructions = computed(() => {
    const result = this.calculation().result;
    return result
      ? `${this.text().layout(result.centerPointId, result.lastPointId)}${result.segmentsPerPanel > 8 ? ' ' + this.text().pointLabels : ''}`
      : '';
  });
  readonly segmentationSummary = computed(() => {
    const result = this.calculation().result;
    return result
      ? `${this.text().facets}: ${result.rimFacets}; ${this.text().perPanel}: ${result.segmentsPerPanel}; ε ≤ ${this.measurement(this.dimensions().maxDeviationMm)}; ${this.text().actualDeviation}: ${this.measurement(result.actualDeviationMm)}.`
      : '';
  });
  readonly summary = computed(
    () =>
      `S ${this.measurement(this.dimensions().squareWidthMm)} / D ${this.measurement(this.dimensions().roundDiameterMm)} / H ${this.measurement(this.dimensions().heightMm)}. ${this.segmentationSummary()} ${this.text().approximation}`,
  );

  inputValue(field: keyof SquareToRoundDimensions): number | string {
    const value = this.dimensions()[field];
    return Number.isFinite(value) ? value / this.factor() : '';
  }

  update(field: keyof SquareToRoundDimensions, value: number): void {
    this.dimensions.update((values) => ({
      ...values,
      [field]: value * this.factor(),
    }));
  }

  measurement(mm: number): string {
    return `${new Intl.NumberFormat(this.language() === 'ua' ? 'uk' : this.language(), { maximumSignificantDigits: 6 }).format(mm / this.factor())} ${this.unitLabel()}`;
  }
}
