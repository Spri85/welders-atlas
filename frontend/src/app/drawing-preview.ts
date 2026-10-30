import { Component, computed, input, signal } from '@angular/core';
import { drawingBounds, drawingSvgPath, type PatternDrawing } from './pattern-drawing';
import type { Point3 } from './pattern-geometry';
import { reducerCopy } from './reducer-copy';
import type { Language } from './export-copy';

export interface ModelLine { points: readonly Point3[]; seam?: boolean; label?: string }

@Component({
  selector: 'app-drawing-preview',
  template: `
    <div class="view-buttons" role="group" [attr.aria-label]="text().view">
      <button type="button" [attr.aria-pressed]="view() === 'formed'" (click)="view.set('formed')">{{ text().formed }}</button>
      <button type="button" [attr.aria-pressed]="view() === 'flat'" (click)="view.set('flat')">{{ text().flat }}</button>
    </div>
    <svg viewBox="0 0 560 360" role="img" [attr.aria-label]="title()">
      <title>{{ title() }} — {{ view() === 'formed' ? text().formed : text().flat }}</title>
      @if (view() === 'flat') {
        @if (flat(); as drawing) {
          <path class="blank" [attr.d]="drawing.path" />
          @for (line of drawing.folds; track $index) {
            <line class="fold" [attr.x1]="line.start.x" [attr.y1]="line.start.y" [attr.x2]="line.end.x" [attr.y2]="line.end.y" />
          }
          @for (label of drawing.labels; track $index) {
            <text [attr.x]="label.point.x + 4" [attr.y]="label.point.y - 4">{{ label.text }}</text>
          }
        }
      } @else {
        @for (line of formed(); track $index) {
          <polyline [class.seam]="line.seam" [attr.points]="line.points" />
          @if (line.label) { <text [attr.x]="line.labelPoint.x + 5" [attr.y]="line.labelPoint.y - 5">{{ line.label }}</text> }
        }
      }
    </svg>
    @if (view() === 'formed') {
      <label>{{ text().rotation }} <output>{{ rotation() }}°</output>
        <input #rotate type="range" min="0" max="360" [attr.aria-label]="text().rotation" [value]="rotation()" (input)="rotation.set(rotate.valueAsNumber)">
      </label>
      <label>{{ text().tilt }} <output>{{ tilt() }}°</output>
        <input #incline type="range" min="15" max="165" [attr.aria-label]="text().tilt" [value]="tilt()" (input)="tilt.set(incline.valueAsNumber)">
      </label>
    }
  `,
  styles: `
    :host { display: block; min-width: 0; }
    .view-buttons { display: flex; gap: 8px; flex-wrap: wrap; }
    button { min-height: 44px; padding: 8px 16px; font: inherit; border: 1px solid #a6b0ab; border-radius: 3px; background: transparent; cursor: pointer; }
    button[aria-pressed=true] { background: #172a30; color: #fff; }
    :is(button, input):focus-visible { outline: 3px solid #bd5c2b; outline-offset: 3px; }
    svg { width: 100%; height: auto; display: block; background: #fafaf7; border: 1px solid #d8ddd8; border-radius: 4px; margin-block: 16px; }
    polyline, line { fill: none; stroke: #526267; stroke-width: 1; }
    .blank { fill: #e5ebe6; stroke: #526267; stroke-width: 1.5; }
    .fold, .seam { stroke: #a24c21; stroke-dasharray: 5 3; stroke-width: 1.5; }
    text { fill: #8a491f; font-size: 16px; font-weight: 700; paint-order: stroke; stroke: #fafaf7; stroke-width: 3px; }
    label { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; font-size: 14px; }
    input { flex: 1; min-width: 100px; min-height: 44px; accent-color: #8a491f; }
  `,
})
export class DrawingPreview {
  readonly drawing = input.required<PatternDrawing>();
  readonly model = input.required<readonly ModelLine[]>();
  readonly language = input<Language>('ua');
  readonly title = input.required<string>();
  readonly text = computed(() => reducerCopy[this.language()]);
  readonly view = signal<'formed' | 'flat'>('formed');
  readonly rotation = signal(30);
  readonly tilt = signal(65);
  readonly flat = computed(() => {
    const drawing = this.drawing();
    const bounds = drawingBounds(drawing);
    const scale = Math.min(460 / bounds.width, 270 / bounds.height);
    const project = (point: { x: number; y: number }) => ({
      x: 280 + (point.x - bounds.minX - bounds.width / 2) * scale,
      y: 180 - (point.y - bounds.minY - bounds.height / 2) * scale,
    });
    return {
      path: drawingSvgPath(drawing, project),
      folds: (drawing.folds ?? []).map((line) => ({ start: project(line.start), end: project(line.end) })),
      labels: (drawing.labels ?? []).map((label) => ({ ...label, point: project(label.point) })),
    };
  });
  readonly formed = computed(() => {
    const points = this.model().flatMap((line) => line.points);
    const centerZ = (Math.max(...points.map((point) => point.z)) + Math.min(...points.map((point) => point.z))) / 2;
    const extent = Math.max(...points.map((point) => Math.hypot(point.x, point.y, point.z - centerZ)));
    const scale = 140 / extent;
    const rotation = this.rotation() * Math.PI / 180;
    const tilt = this.tilt() * Math.PI / 180;
    const project = (point: Point3) => {
      const x = point.x * Math.cos(rotation) - point.y * Math.sin(rotation);
      const y = point.x * Math.sin(rotation) + point.y * Math.cos(rotation);
      return { x: 280 + x * scale, y: 180 + (y * Math.cos(tilt) - (point.z - centerZ) * Math.sin(tilt)) * scale };
    };
    return this.model().map((line) => ({
      ...line,
      points: line.points.map((point) => { const p = project(point); return `${p.x},${p.y}`; }).join(' '),
      labelPoint: project(line.points[Math.floor(line.points.length / 2)]),
    }));
  });
}
