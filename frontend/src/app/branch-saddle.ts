import type { PatternDrawing } from './pattern-drawing';
import type { PatternPoint, Point3 } from './pattern-geometry';

export interface BranchSaddleDimensions { mainDiameterMm: number; branchDiameterMm: number }

export function calculateBranchSaddle(dimensions: BranchSaddleDimensions) {
  const { mainDiameterMm, branchDiameterMm } = dimensions;
  if (!Object.values(dimensions).every((value) => Number.isFinite(value) && value > 0)) {
    throw new RangeError('Diameters must be finite and positive.');
  }
  if (branchDiameterMm > mainDiameterMm) throw new RangeError('Branch diameter must not exceed main diameter.');
  const mainRadius = mainDiameterMm / 2;
  const branchRadius = branchDiameterMm / 2;
  const ratio = branchRadius / mainRadius;
  const notchDepthMm = mainRadius * ratio * ratio / (1 + Math.sqrt(Math.max(0, 1 - ratio * ratio)));
  const wrapLengthMm = Math.PI * branchDiameterMm;
  const referenceBandMm = 20;
  if (![notchDepthMm, wrapLengthMm].every((value) => Number.isFinite(value) && value > 0)) {
    throw new RangeError('Pattern exceeds numeric range.');
  }
  const profile: PatternPoint[] = [];
  const intersection: Point3[] = [];
  for (let index = 0; index <= 720; index++) {
    const angle = index * Math.PI / 360;
    const sine = Math.sin(angle);
    const fraction = ratio * ratio * sine * sine;
    // Rationalized cylinder sagitta avoids cancellation for small branches.
    const depth = mainRadius * fraction / (1 + Math.sqrt(Math.max(0, 1 - fraction)));
    profile.push({ x: wrapLengthMm * index / 720, y: notchDepthMm - depth });
    intersection.push({ x: branchRadius * Math.cos(angle), y: branchRadius * sine, z: mainRadius - depth });
  }
  const bandTop = notchDepthMm + referenceBandMm;
  const perimeter = [...profile, { x: wrapLengthMm, y: bandTop }, { x: 0, y: bandTop }];
  const drawing: PatternDrawing = {
    outline: perimeter.map((start, index) => ({ kind: 'line', start, end: perimeter[(index + 1) % perimeter.length] })),
    folds: Array.from({ length: 5 }, (_, index) => ({
      kind: 'line', start: profile[index * 180], end: { x: wrapLengthMm * index / 4, y: bandTop },
    })),
    labels: [
      ...Array.from({ length: 5 }, (_, index) => ({ text: `${index * 90}°`, point: { x: wrapLengthMm * index / 4 + (index === 4 ? -10 : 1), y: bandTop - 3 } })),
      { text: 'A', point: { x: 1, y: notchDepthMm + 7 } },
      { text: 'A', point: { x: wrapLengthMm - 5, y: notchDepthMm + 7 } },
    ],
  };
  return { allowance: 'zero-allowance' as const, notchDepthMm, wrapLengthMm, referenceBandMm, sampleStepDegrees: 0.5, profile, intersection, drawing };
}
