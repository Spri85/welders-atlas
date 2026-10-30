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
