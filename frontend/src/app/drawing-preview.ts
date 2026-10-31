import { InputReferenceKey, type InputReference } from './input-reference-key';
import { Component, computed, input, signal } from '@angular/core';
import { drawingBounds, drawingSvgPath, type PatternDrawing } from './pattern-drawing';
import type { Point3 } from './pattern-geometry';
import { reducerCopy } from './reducer-copy';
import type { Language } from './export-copy';
import { PatternDimensions } from './pattern-dimensions';
import { drawingCoordinates, drawingLabelText, formatPatternMeasurement } from './pattern-measurements';
import { MeasurementTooltip } from './measurement-tooltip';

export interface ModelLine { points: readonly Point3[]; seam?: boolean; construction?: boolean; label?: string }

@Component({
  selector: 'app-drawing-preview',
  imports: [PatternDimensions, MeasurementTooltip, InputReferenceKey],
  template: `
    @if (model().length) { <div class="view-buttons" role="group" [attr.aria-label]="text().view">
      <button type="button" [attr.aria-pressed]="activeView() === 'formed'" (click)="view.set('formed')">{{ text().formed }}</button>
      <button type="button" [attr.aria-pressed]="activeView() === 'flat'" (click)="view.set('flat')">{{ text().flat }}</button>
    </div> }
    @if (activeView() === 'flat' && instructions()) { <p class="instructions">{{ instructions() }}</p> }
    <svg viewBox="0 0 560 360" role="img" [attr.aria-label]="title()">
      <title>{{ title() }} — {{ activeView() === 'formed' ? text().formed : text().flat }}</title>
      @if (activeView() === 'flat') {
        @if (flat(); as drawing) {
          <path class="blank" fill-rule="evenodd" [class.open]="drawing.open" [attr.d]="drawing.path" />
          @for (line of drawing.folds; track $index) {
            <line class="fold" [attr.x1]="line.start.x" [attr.y1]="line.start.y" [attr.x2]="line.end.x" [attr.y2]="line.end.y" />
          }
          @for (line of drawing.construction; track $index) {
            <line class="construction" [attr.x1]="line.start.x" [attr.y1]="line.start.y" [attr.x2]="line.end.x" [attr.y2]="line.end.y" />
          }
          @for (label of drawing.labels; track $index) {
            <text [class.measurement-label]="label.measurementId" [class.construction-label]="label.construction" [attr.text-anchor]="label.anchor"
              [measurementTooltip]="label.tooltip" [attr.x]="label.point.x + 4" [attr.y]="label.point.y - 4">{{ label.text }}</text>
          }
          @for (vertex of drawing.vertices; track vertex.id) {
            <circle class="vertex" [attr.cx]="vertex.point.x" [attr.cy]="vertex.point.y" r="2.5" />
            @if (vertex.showLabel) {
              <text class="vertex-label" [measurementTooltip]="vertex.tooltip" [attr.x]="vertex.point.x + 5" [attr.y]="vertex.point.y - 7">{{ vertex.id }}</text>
            }
          }
          @if (showDimensions()) { <line class="dimension-line" [attr.x1]="drawing.left" [attr.x2]="drawing.right" y1="329" y2="329" />
          <text class="dimension-label" x="280" y="350" text-anchor="middle" [measurementTooltip]="drawing.widthId + ' = ' + measurement(drawing.width)">{{ drawing.widthId }}</text>
          <line class="dimension-line" x1="24" x2="24" [attr.y1]="drawing.top" [attr.y2]="drawing.bottom" />
          <text class="dimension-label" x="-180" y="15" transform="rotate(-90)" text-anchor="middle" [measurementTooltip]="drawing.heightId + ' = ' + measurement(drawing.height)">{{ drawing.heightId }}</text> }
        }
      } @else {
        @for (line of formed(); track $index) {
          <polyline [class.seam]="line.seam" [class.construction]="line.construction" [attr.points]="line.points" />
          @if (line.label) { <text [measurementTooltip]="labelHint(line.label)" [attr.x]="line.labelPoint.x + 5" [attr.y]="line.labelPoint.y - 5">{{ line.label }}</text> }
        }
      }
    </svg>
    <app-input-reference-key [parameters]="parameters()" [language]="language()" />
    @if (activeView() === 'formed') {
      <label>{{ text().rotation }} <output>{{ rotation() }}°</output>
        <input #rotate type="range" min="0" max="360" [attr.aria-label]="text().rotation" [value]="rotation()" (input)="rotation.set(rotate.valueAsNumber)">
      </label>
      <label>{{ text().tilt }} <output>{{ tilt() }}°</output>
        <input #incline type="range" min="15" max="165" [attr.aria-label]="text().tilt" [value]="tilt()" (input)="tilt.set(incline.valueAsNumber)">
      </label>
    }
    @if (activeView() === 'flat' && showDimensions()) {
      <app-pattern-dimensions [drawing]="drawing()" [language]="language()" [unit]="unit()" />
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
    .blank.open { fill: none; stroke-width: 2; }
    .fold, .seam { stroke: #a24c21; stroke-dasharray: 5 3; stroke-width: 1.5; }
    .construction { stroke: #366780; stroke-dasharray: 8 3 1 3; stroke-width: 1; }
    .construction-label { fill: #366780; }
    .instructions { font-size: 14px; line-height: 1.6; color: #526267; }
    text { fill: #8a491f; font-size: 16px; font-weight: 700; paint-order: stroke; stroke: #fafaf7; stroke-width: 3px; }
    .vertex { fill: #172a30; }
    .vertex-label { fill: #172a30; font-size: 14px; }
    .dimension-label { fill: #526267; font-size: 13px; font-weight: 400; }
    .measurement-label { font-size: 14px; }
    .dimension-line { stroke: #526267; stroke-width: 1; }
    label { display: flex; flex-wrap: wrap; gap: 12px; align-items: center; font-size: 14px; }
    input { flex: 1; min-width: 100px; min-height: 44px; accent-color: #8a491f; }
  `,
})
export class DrawingPreview {
  readonly drawing = input.required<PatternDrawing>();
  readonly model = input<readonly ModelLine[]>([]);
  readonly language = input<Language>('ua');
  readonly unit = input<'mm' | 'in'>('mm');
  readonly title = input.required<string>();
  readonly instructions = input('');
  readonly parameters = input<readonly InputReference[]>([]);
  readonly showDimensions = input(true);
  readonly hints = input<Readonly<Partial<Record<string, string>>>>({});
  readonly text = computed(() => reducerCopy[this.language()]);
  readonly view = signal<'formed' | 'flat'>('formed');
  readonly activeView = computed(() => this.model().length ? this.view() : 'flat');
  readonly rotation = signal(30);
  readonly tilt = signal(65);
  readonly flat = computed(() => {
    const drawing = this.drawing();
    const bounds = drawingBounds(drawing, true);
    const cutBounds = drawingBounds(drawing);
    const coordinateHints = new Map(drawingCoordinates(drawing).map((point) => [point.id,
      `${point.id} · X = ${this.measurement(point.x)} · Y = ${this.measurement(point.y)}`,
    ]));
    const scale = Math.min(460 / Math.max(bounds.width, 1e-9), 270 / Math.max(bounds.height, 1e-9));
    const project = (point: { x: number; y: number }) => ({
      x: 280 + (point.x - bounds.minX - bounds.width / 2) * scale,
      y: 180 - (point.y - bounds.minY - bounds.height / 2) * scale,
    });
    return {
      path: drawingSvgPath(drawing, project),
      open: drawing.closed === false,
      folds: (drawing.folds ?? []).map((line) => ({ start: project(line.start), end: project(line.end) })),
      construction: (drawing.construction ?? []).map((line) => ({ start: project(line.start), end: project(line.end) })),
      labels: (drawing.labels ?? []).map((label) => ({
        ...label, point: project(label.point),
        tooltip: this.hints()[label.text] ?? this.parameterHint(label.text) ?? (label.measurementId ? drawingLabelText(drawing, label, this.unit(), this.language()) : coordinateHints.get(label.text) ?? label.text),
        anchor: ({ left: 'start', center: 'middle', right: 'end' } as const)[label.align ?? 'left'],
        construction: drawing.measurements?.some((item) => item.id === label.measurementId && item.kind === 'construction'),
      })),
      vertices: (drawing.vertices ?? []).map((vertex) => ({
        ...vertex, point: project(vertex.point), showLabel: !drawing.labels?.some((label) => label.text === vertex.id),
        tooltip: coordinateHints.get(vertex.id) ?? vertex.id,
      })),
      width: cutBounds.width, height: cutBounds.height,
      widthId: drawing.measurements?.find((item) => item.kind === 'width')?.id ?? 'W',
      heightId: drawing.measurements?.find((item) => item.kind === 'height')?.id ?? 'H',
      left: project({ x: cutBounds.minX, y: 0 }).x, right: project({ x: cutBounds.maxX, y: 0 }).x,
      top: project({ x: 0, y: cutBounds.maxY }).y, bottom: project({ x: 0, y: cutBounds.minY }).y,
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

  labelHint(id: string): string {
    const label = this.drawing().labels?.find((label) => label.text === id)
      ?? { point: { x: 0, y: 0 }, text: id, measurementId: id };
    return this.hints()[id] ?? this.parameterHint(id) ?? drawingLabelText(this.drawing(), label, this.unit(), this.language());
  }

  private parameterHint(id: string): string | undefined {
    const parameter = this.parameters().find((item) => item.id === id);
    return parameter ? `${parameter.label} = ${parameter.value}` : undefined;
  }

  measurement(mm: number): string {
    return formatPatternMeasurement(mm, 'mm', this.unit(), this.language());
  }
}
