import { Component, computed, input, signal } from '@angular/core';
import { calculateBranchSaddle, type BranchSaddleDimensions } from './branch-saddle';
import { branchSaddleCopy } from './branch-saddle-copy';
import { reducerCopy } from './reducer-copy';
import { DrawingPreview, type ModelLine } from './drawing-preview';
import { PatternExport } from './pattern-export';
import type { Language } from './export-copy';

@Component({
  selector: 'app-branch-saddle-calculator',
  imports: [DrawingPreview, PatternExport],
  templateUrl: './branch-saddle-calculator.html',
  styleUrl: './calculator.css',
})
export class BranchSaddleCalculator {
  readonly language = input<Language>('ua');
  readonly text = computed(() => branchSaddleCopy[this.language()]);
  readonly common = computed(() => reducerCopy[this.language()]);
  readonly unit = signal<'mm' | 'in'>('mm');
  readonly factor = computed(() => this.unit() === 'mm' ? 1 : 25.4);
  readonly unitLabel = computed(() => this.unit() === 'mm' ? this.common().unitMm : this.common().unitIn);
  readonly dimensions = signal<BranchSaddleDimensions>({ mainDiameterMm: 100, branchDiameterMm: 60 });
  readonly fields = [{ key: 'mainDiameterMm', label: 'main' }, { key: 'branchDiameterMm', label: 'branch' }] as const;
  readonly calculation = computed(() => {
    const values = this.dimensions();
    if (!Object.values(values).every((value) => Number.isFinite(value) && value > 0)) return { result: null, error: this.common().positive };
    if (values.branchDiameterMm > values.mainDiameterMm) return { result: null, error: this.text().smaller };
    try {
      return { result: calculateBranchSaddle(values), error: null };
    } catch (error) {
      if (!(error instanceof RangeError)) throw error;
      return { result: null, error: this.common().range };
    }
  });
  readonly model = computed<ModelLine[]>(() => {
    const result = this.calculation().result;
    if (!result) return [];
    const mainRadius = this.dimensions().mainDiameterMm / 2;
    const branchRadius = this.dimensions().branchDiameterMm / 2;
    const ring = (x: number) => Array.from({ length: 73 }, (_, index) => ({ x, y: mainRadius * Math.cos(index * Math.PI / 36), z: mainRadius * Math.sin(index * Math.PI / 36) }));
    const top = (index: number) => ({ x: branchRadius * Math.cos(index * Math.PI / 360), y: branchRadius * Math.sin(index * Math.PI / 360), z: mainRadius + result.referenceBandMm });
    return [
      { points: ring(-mainRadius * 1.4) }, { points: ring(mainRadius * 1.4) },
      ...Array.from({ length: 8 }, (_, index) => {
        const angle = index * Math.PI / 4;
        return { points: [-1, 1].map((side) => ({ x: side * mainRadius * 1.4, y: mainRadius * Math.cos(angle), z: mainRadius * Math.sin(angle) })) };
      }),
      { points: result.intersection },
      { points: Array.from({ length: 73 }, (_, index) => top(index * 10)) },
      ...Array.from({ length: 8 }, (_, index) => ({ points: [result.intersection[index * 90], top(index * 90)], seam: index === 0, label: index === 0 ? 'A' : undefined })),
    ];
  });
  readonly summary = computed(() => `${this.text().main} ${this.measurement(this.dimensions().mainDiameterMm)} / ${this.text().branch} ${this.measurement(this.dimensions().branchDiameterMm)}. ${this.text().reference}`);

  inputValue(field: keyof BranchSaddleDimensions): number | string {
    const value = this.dimensions()[field];
    return Number.isFinite(value) ? value / this.factor() : '';
  }

  update(field: keyof BranchSaddleDimensions, value: number): void {
    this.dimensions.update((values) => ({ ...values, [field]: value * this.factor() }));
  }

  measurement(mm: number): string {
    return `${new Intl.NumberFormat(this.language() === 'ua' ? 'uk' : this.language(), { maximumFractionDigits: 2 }).format(mm / this.factor())} ${this.unitLabel()}`;
  }
}
