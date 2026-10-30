import {
  finiteResult,
  integer,
  nonnegative,
  positive,
  requireCondition,
} from './validation';
import { line, rectangle } from './drawings';
import type { PatternDrawing } from '../pattern-drawing';
export function calculateGasBudget(
  flowLitresPerMin: number,
  arcMinutes: number,
  cycles: number,
  preSeconds: number,
  postSeconds: number,
  availableLitres?: number,
) {
  positive(flowLitresPerMin);
  nonnegative(arcMinutes, preSeconds, postSeconds);
  integer(cycles, 0);
  requireCondition(arcMinutes === 0 || cycles > 0);
  if (availableLitres !== undefined) nonnegative(availableLitres);
  const preMinutes = (cycles * preSeconds) / 60,
    postMinutes = (cycles * postSeconds) / 60;
  const gasMinutes = arcMinutes + preMinutes + postMinutes;
  const jobLitres = flowLitresPerMin * gasMinutes;
  const balanceLitres =
    availableLitres === undefined ? undefined : availableLitres - jobLitres;
  finiteResult(
    preMinutes,
    postMinutes,
    gasMinutes,
    jobLitres,
    balanceLitres ?? 0,
  );
  const width = Math.max(gasMinutes, 1),
    height = width / 8;
  const drawing: PatternDrawing = gasMinutes
    ? {
        ...rectangle(gasMinutes, height),
        construction: [preMinutes, preMinutes + arcMinutes].map((x) =>
          line({ x, y: 0 }, { x, y: height }),
        ),
        labels: [
          { text: 'P', point: { x: preMinutes / 2, y: height / 2 } },
          {
            text: 'A',
            point: { x: preMinutes + arcMinutes / 2, y: height / 2 },
          },
          {
            text: 'Q',
            point: {
              x: preMinutes + arcMinutes + postMinutes / 2,
              y: height / 2,
            },
          },
        ],
      }
    : {
        closed: false,
        outline: [line({ x: 0, y: 0 }, { x: 1, y: 0 })],
        labels: [{ text: 'T', point: { x: 0.5, y: 0 } }],
      };
  return {
    preMinutes,
    postMinutes,
    gasMinutes,
    jobLitres,
    balanceLitres,
    drawing,
  };
}
