import { Component, computed, input } from '@angular/core';
import type { PatternDrawing } from './pattern-drawing';
import { drawingCoordinates, drawingMeasurements, formatPatternMeasurement } from './pattern-measurements';
import { drawingCopy } from './drawing-copy';
import type { Language } from './export-copy';

@Component({
  selector: 'app-pattern-dimensions',
  template: `
    <h3>{{ text().dimensions }}</h3>
    <table [attr.aria-label]="text().dimensions">
      <thead><tr><th scope="col">{{ text().id }}</th><th scope="col">{{ text().kind }}</th><th scope="col">{{ text().size }}</th></tr></thead>
      <tbody>
        @for (item of measurements(); track item.id) {
          <tr><th scope="row">{{ item.id }}</th><td>{{ text()[item.kind] }}</td><td>{{ format(item.value, item.unit) }}</td></tr>
        }
      </tbody>
    </table>
    @if (coordinates().length) {
      <h3>{{ text().coordinates }}</h3>
      <p>{{ drawing().coordinateOrigin === 'upper-left' ? text().upperOrigin : text().origin }}</p>
      <table [attr.aria-label]="text().coordinates">
        <thead><tr><th scope="col">{{ text().id }}</th><th scope="col">X</th><th scope="col">Y</th></tr></thead>
        <tbody>
          @for (point of coordinates(); track point.id) {
            <tr><th scope="row">{{ point.id }}</th><td>{{ format(point.x, 'mm') }}</td><td>{{ format(point.y, 'mm') }}</td></tr>
          }
        </tbody>
      </table>
    }
  `,
  styles: `
    :host { display: block; margin-block: 24px; }
    h3 { font-size: 18px; margin-block: 24px 12px; }
    p { font-size: 13px; line-height: 1.6; color: #526267; }
    table { width: 100%; border-collapse: collapse; font-size: 14px; }
    th, td { padding: 10px 6px; text-align: left; border-bottom: 1px solid #d8ddd8; overflow-wrap: anywhere; }
    th { font-weight: 600; }
    td:last-child { font-variant-numeric: tabular-nums; }
  `,
})
export class PatternDimensions {
  readonly drawing = input.required<PatternDrawing>();
  readonly language = input<Language>('ua');
  readonly unit = input<'mm' | 'in'>('mm');
  readonly text = computed(() => drawingCopy[this.language()]);
  readonly measurements = computed(() => drawingMeasurements(this.drawing()));
  readonly coordinates = computed(() => drawingCoordinates(this.drawing()));

  format(value: number, measurementUnit: 'mm' | 'degree'): string {
    return formatPatternMeasurement(value, measurementUnit, this.unit(), this.language());
  }
}
