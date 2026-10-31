import {
  finiteResult,
  nonnegative,
  positive,
  requireCondition,
} from './validation';
import { circle, line } from './drawings';
export function calculatePositionerSpeed(
  diameterMm: number,
  speedMmPerMin: number,
  minRpm?: number,
  maxRpm?: number,
) {
  positive(diameterMm, speedMmPerMin);
  if (minRpm !== undefined) nonnegative(minRpm);
  if (maxRpm !== undefined) positive(maxRpm);
  requireCondition(
    minRpm === undefined || maxRpm === undefined || minRpm <= maxRpm,
  );
  const rpm = speedMmPerMin / (Math.PI * diameterMm);
  positive(rpm);
  const secondsPerTurn = 60 / rpm;
  finiteResult(rpm, secondsPerTurn);
  const status =
    minRpm !== undefined && rpm < minRpm
      ? 'slow'
      : maxRpm !== undefined && rpm > maxRpm
        ? 'fast'
        : minRpm !== undefined || maxRpm !== undefined
          ? 'within'
          : 'unspecified';
  const drawing = {
    ...circle({ x: 0, y: 0 }, diameterMm / 2),
    closed: false,
    construction: [
      line({ x: -diameterMm / 2, y: 0 }, { x: diameterMm / 2, y: 0 }),
    ],
    labels: [
      { text: 'v', point: { x: 0, y: diameterMm / 2 } },
      { text: 'D', point: { x: 0, y: 0 } },
      { text: 'N', point: { x: diameterMm / 2, y: 0 } },
    ],
  };
  return { rpm, secondsPerTurn, status, drawing } as const;
}
