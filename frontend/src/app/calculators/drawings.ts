import type { PatternPoint } from '../pattern-geometry';
import type { DrawingLine, PatternDrawing } from '../pattern-drawing';

export const line = (start: PatternPoint, end: PatternPoint): DrawingLine => ({
  kind: 'line',
  start,
  end,
});

export function polygon(points: readonly PatternPoint[]): PatternDrawing {
  return {
    outline: points.map((point, index) =>
      line(point, points[(index + 1) % points.length]),
    ),
  };
}

export function rectangle(width: number, height: number): PatternDrawing {
  return polygon([
    { x: 0, y: 0 },
    { x: width, y: 0 },
    { x: width, y: height },
    { x: 0, y: height },
  ]);
}

export function circle(center: PatternPoint, radius: number): PatternDrawing {
  return {
    outline: Array.from({ length: 4 }, (_, index) => {
      const startAngleRadians = (index * Math.PI) / 2;
      const point = (angle: number) => ({
        x: center.x + radius * Math.cos(angle),
        y: center.y + radius * Math.sin(angle),
      });
      return {
        kind: 'arc',
        center,
        radiusMm: radius,
        startAngleRadians,
        sweepAngleRadians: Math.PI / 2,
        start: point(startAngleRadians),
        end: point(startAngleRadians + Math.PI / 2),
        lengthMm: (radius * Math.PI) / 2,
      };
    }),
  };
}
