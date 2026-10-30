import { finiteResult, nonnegative, positive } from './validation';
import { circle, line } from './drawings';
import type { PatternDrawing } from '../pattern-drawing';
export function calculateCircularKerf(
  diameterMm: number,
  kerfMm: number,
  keepDisc: boolean,
  controllerCompensation: boolean,
) {
  positive(diameterMm);
  nonnegative(kerfMm);
  const referencePathMm = diameterMm + (keepDisc ? kerfMm : -kerfMm);
  positive(referencePathMm);
  const programmedMm = controllerCompensation ? diameterMm : referencePathMm;
  finiteResult(referencePathMm, programmedMm);
  const r = referencePathMm / 2;
  const path = Array.from({ length: 181 }, (_, i) => ({
    x: r * Math.cos((i * Math.PI) / 90),
    y: r * Math.sin((i * Math.PI) / 90),
  }));
  const drawing: PatternDrawing = {
    ...circle({ x: 0, y: 0 }, diameterMm / 2),
    closed: false,
    construction: path.slice(1).map((p, i) => line(path[i], p)),
    labels: [
      { text: 'D', point: { x: -diameterMm / 4, y: 0 } },
      { text: 'P', point: { x: r, y: 0 } },
      {
        text: 'S',
        point: {
          x: keepDisc ? diameterMm * 0.65 : 0,
          y: keepDisc ? 0 : diameterMm / 4,
        },
      },
    ],
  };
  return { referencePathMm, programmedMm, drawing };
}
