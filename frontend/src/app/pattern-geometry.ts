export interface PatternPoint {
  x: number;
  y: number;
}

export interface PatternArc {
  kind: 'arc';
  center: PatternPoint;
  radiusMm: number;
  start: PatternPoint;
  end: PatternPoint;
  startAngleRadians: number;
  sweepAngleRadians: number;
  lengthMm: number;
}

export interface Point3 { x: number; y: number; z: number }

export interface DrawingLine {
  kind: 'line';
  start: PatternPoint;
  end: PatternPoint;
}

export function modelDimension(start: Point3, end: Point3, label: string) {
  return {
    points: [start, { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2, z: (start.z + end.z) / 2 }, end],
    label,
    construction: true,
  };
}
