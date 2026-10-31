import type { DrawingLine, PatternArc, PatternPoint } from './pattern-geometry';
export type { DrawingLine } from './pattern-geometry';

export interface PatternDrawing {
  closed?: boolean;
  outline: readonly (PatternArc | DrawingLine)[];
  contours?: readonly (readonly (PatternArc | DrawingLine)[])[];
  folds?: readonly DrawingLine[];
  construction?: readonly DrawingLine[];
  labels?: readonly PatternLabel[];
  vertices?: readonly { id: string; point: PatternPoint }[];
  coordinatePoints?: readonly { id: string; point: PatternPoint }[];
  coordinateOrigin?: 'lower-left' | 'upper-left' | 'origin';
  measurements?: readonly PatternMeasurement[];
}

export interface PatternLabel {
  point: PatternPoint;
  text: string;
  measurementId?: string;
  align?: 'left' | 'center' | 'right';
}

export interface PatternMeasurement {
  id: string;
  kind: 'width' | 'height' | 'depth' | 'stationHeight' | 'construction' | 'edge' | 'fold' | 'radius' | 'arc' | 'angle' | 'length';
  value: number;
  unit: 'mm' | 'degree';
}

export function drawingBounds(drawing: PatternDrawing, includeGuides = drawing.closed === false) {
  const segments = [drawing.outline, ...(drawing.contours ?? [])].flat();
  const points = segments.flatMap((segment) => [segment.start, segment.end]);
  if (includeGuides) {
    points.push(...[...(drawing.construction ?? []), ...(drawing.folds ?? [])].flatMap((segment) => [segment.start, segment.end]));
  }
  for (const segment of segments) {
    if (segment.kind !== 'arc') continue;
    const from = Math.min(segment.startAngleRadians, segment.startAngleRadians + segment.sweepAngleRadians);
    const to = Math.max(segment.startAngleRadians, segment.startAngleRadians + segment.sweepAngleRadians);
    for (let angle = Math.ceil(from / (Math.PI / 2)) * Math.PI / 2; angle <= to; angle += Math.PI / 2) {
      points.push({
        x: segment.center.x + segment.radiusMm * Math.cos(angle),
        y: segment.center.y + segment.radiusMm * Math.sin(angle),
      });
    }
  }
  const minX = Math.min(...points.map((point) => point.x));
  const maxX = Math.max(...points.map((point) => point.x));
  const minY = Math.min(...points.map((point) => point.y));
  const maxY = Math.max(...points.map((point) => point.y));
  return { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY };
}

/** Vector chords stay within 0.01 mm of the calculated arc. */
export function arcPoints(arc: PatternArc): PatternPoint[] {
  const maxAngle = Math.min(Math.PI / 4, Math.sqrt(8 * 0.01 / arc.radiusMm));
  const count = Math.ceil(Math.abs(arc.sweepAngleRadians) / maxAngle);
  if (!Number.isFinite(count) || count > 100_000) throw new RangeError('Arc exceeds export limits.');
  return Array.from({ length: count + 1 }, (_, index) => {
    if (index === 0) return arc.start;
    if (index === count) return arc.end;
    const angle = arc.startAngleRadians + arc.sweepAngleRadians * index / count;
    return {
      x: arc.center.x + arc.radiusMm * Math.cos(angle),
      y: arc.center.y + arc.radiusMm * Math.sin(angle),
    };
  });
}

export function drawingSvgPath(drawing: PatternDrawing, project: (point: PatternPoint) => PatternPoint): string {
  const start = project(drawing.outline[0].start);
  const commands = [`M ${start.x} ${start.y}`];
  for (const segment of drawing.outline) {
    const end = project(segment.end);
    if (segment.kind === 'line') {
      commands.push(`L ${end.x} ${end.y}`);
    } else {
      const center = project(segment.center);
      const radius = Math.hypot(project(segment.start).x - center.x, project(segment.start).y - center.y);
      commands.push(`A ${radius} ${radius} 0 ${Math.abs(segment.sweepAngleRadians) > Math.PI ? 1 : 0} ${segment.sweepAngleRadians < 0 ? 1 : 0} ${end.x} ${end.y}`);
    }
  }
  const contours = (drawing.contours ?? []).map((outline) => drawingSvgPath({ outline }, project));
  return [commands.join(' ') + (drawing.closed === false ? '' : ' Z'), ...contours].join(' ');
}
