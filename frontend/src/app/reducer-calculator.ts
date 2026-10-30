import { Component, computed, input, signal } from '@angular/core';
import { calculateCenteredRoundReducer, type PatternPoint, type ReducerDimensions } from './centered-round-reducer';
import { reducerCopy } from './reducer-copy';
import { PatternExport } from './pattern-export';
import { drawingBounds, drawingSvgPath, type PatternDrawing } from './pattern-drawing';
import { PatternDimensions } from './pattern-dimensions';

type Unit = 'mm' | 'in';
type Dimension = keyof ReducerDimensions;

@Component({
  selector: 'app-reducer-calculator',
  imports: [PatternExport, PatternDimensions],
  templateUrl: './reducer-calculator.html',
  styleUrls: ['./calculator.css', './reducer-calculator.css'],
})
export class ReducerCalculator {
  readonly language = input<'ua' | 'ru' | 'en'>('ua');
  readonly text = computed(() => reducerCopy[this.language()]);
  readonly unit = signal<Unit>('mm');
  readonly unitFactor = computed(() => this.unit() === 'mm' ? 1 : 25.4);
  readonly unitLabel = computed(() => this.unit() === 'mm' ? this.text().unitMm : this.text().unitIn);
  readonly view = signal<'formed' | 'flat'>('formed');
  readonly rotation = signal(30);
  readonly tilt = signal(65);
  readonly dimensions = signal<ReducerDimensions>({
    inletDiameterMm: 200, outletDiameterMm: 100, axialLengthMm: 150,
  });
  readonly fields = [
    { key: 'inletDiameterMm', label: 'inlet' },
    { key: 'outletDiameterMm', label: 'outlet' },
    { key: 'axialLengthMm', label: 'length' },
  ] as const;

  readonly calculation = computed(() => {
    const dimensions = this.dimensions();
    if (!Object.values(dimensions).every((value) => Number.isFinite(value) && value > 0)) {
      return { pattern: null, error: 'positive' } as const;
    }
    if (dimensions.outletDiameterMm >= dimensions.inletDiameterMm) {
      return { pattern: null, error: 'smaller' } as const;
    }
    try {
      return { pattern: calculateCenteredRoundReducer(dimensions), error: null } as const;
    } catch (error) {
      if (!(error instanceof RangeError)) throw error;
      return { pattern: null, error: 'range' } as const;
    }
  });

  readonly printDrawing = computed<PatternDrawing | null>(() => {
    const pattern = this.calculation().pattern;
    if (!pattern) return null;
    return {
      outline: pattern.outline.segments,
      labels: pattern.outline.segments.filter((segment) => segment.kind === 'line').map((seam) => ({
        text: 'A', point: { x: (seam.start.x + seam.end.x) / 2 + 2, y: (seam.start.y + seam.end.y) / 2 + 2 },
      })),
      measurements: [
        { id: 'A', kind: 'edge', value: pattern.slantHeightMm, unit: 'mm' },
        { id: 'R', kind: 'radius', value: pattern.outerRadiusMm, unit: 'mm' },
        { id: 'r', kind: 'radius', value: pattern.innerRadiusMm, unit: 'mm' },
        { id: 'L (R)', kind: 'arc', value: pattern.outline.segments[0].lengthMm, unit: 'mm' },
        { id: 'L (r)', kind: 'arc', value: pattern.outline.segments[2].lengthMm, unit: 'mm' },
        { id: 'θ', kind: 'angle', value: pattern.sectorAngle.degrees, unit: 'degree' },
      ],
    };
  });

  readonly flat = computed(() => {
    const drawing = this.printDrawing();
    if (!drawing) return null;
    const { minX, maxX, minY, maxY } = drawingBounds(drawing);
    const scale = Math.min(440 / (maxX - minX), 230 / (maxY - minY));
    const project = (point: PatternPoint): PatternPoint => ({
      x: 280 + (point.x - minX - (maxX - minX) / 2) * scale,
      y: 180 - (point.y - minY - (maxY - minY) / 2) * scale,
    });
    return {
      path: drawingSvgPath(drawing, project),
      seams: drawing.outline.filter((segment) => segment.kind === 'line')
        .map((seam) => ({ start: project(seam.start), end: project(seam.end) })),
    };
  });

  readonly formed = computed(() => {
    if (!this.calculation().pattern) return null;
    const { inletDiameterMm, outletDiameterMm, axialLengthMm } = this.dimensions();
    const scale = 220 / Math.hypot(inletDiameterMm, axialLengthMm);
    const tilt = this.tilt() * Math.PI / 180;
    const rotation = this.rotation() * Math.PI / 180;
    const project = (radius: number, height: number, angle: number): PatternPoint => ({
      x: 280 + radius * Math.cos(angle + rotation) * scale,
      y: 180 + (radius * Math.sin(angle + rotation) * Math.cos(tilt) - height * Math.sin(tilt)) * scale,
    });
    const inlet = (angle: number) => project(inletDiameterMm / 2, -axialLengthMm / 2, angle);
    const outlet = (angle: number) => project(outletDiameterMm / 2, axialLengthMm / 2, angle);
    const ring = (pointAt: (angle: number) => PatternPoint) => Array.from({ length: 73 }, (_, index) => {
      const point = pointAt(index * Math.PI / 36);
      return `${point.x},${point.y}`;
    }).join(' ');
    return {
      inlet: ring(inlet), outlet: ring(outlet),
      generators: Array.from({ length: 12 }, (_, index) => ({
        start: inlet(index * Math.PI / 6), end: outlet(index * Math.PI / 6),
      })),
      seam: { start: inlet(0), end: outlet(0) },
    };
  });

  inputValue(field: Dimension): number | string {
    const value = this.dimensions()[field];
    return Number.isFinite(value) ? value / this.unitFactor() : '';
  }

  updateDimension(field: Dimension, value: number): void {
    this.dimensions.update((dimensions) => ({ ...dimensions, [field]: value * this.unitFactor() }));
  }

  invalidField(field: Dimension): boolean {
    const value = this.dimensions()[field];
    return !Number.isFinite(value) || value <= 0
      || (field === 'outletDiameterMm' && this.calculation().error === 'smaller');
  }

  format(value: number): string {
    return new Intl.NumberFormat(this.language() === 'ua' ? 'uk' : this.language(), {
      maximumFractionDigits: 2,
    }).format(value);
  }

  measurement(mm: number): string {
    return `${this.format(mm / this.unitFactor())} ${this.unitLabel()}`;
  }
}
