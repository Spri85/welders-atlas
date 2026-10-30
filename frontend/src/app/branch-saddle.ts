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
  const stations = Array.from({ length: 5 }, (_, index) => ({
    angle: index * 90,
    id: index % 2 === 0 ? 'A' : 'B',
    start: profile[index * 180],
    end: { x: wrapLengthMm * index / 4, y: bandTop },
  }));
  const labelAlignments = ['left', 'center', 'center', 'center', 'right'] as const;
  const drawing: PatternDrawing = {
    outline: perimeter.map((start, index) => ({ kind: 'line', start, end: perimeter[(index + 1) % perimeter.length] })),
    folds: stations.map((station) => ({ kind: 'line', start: station.start, end: station.end })),
    labels: [
      ...stations.map((station, index) => ({ text: `${station.angle}°`, point: { x: station.start.x + (index === 4 ? -10 : 1), y: bandTop - 3 } })),
      ...stations.map((station, index) => ({
        text: station.id,
        measurementId: station.id,
        point: { x: station.start.x, y: (station.start.y + station.end.y) / 2 },
        align: labelAlignments[index],
      })),
    ],
    vertices: Array.from({ length: 5 }, (_, index) => ({ id: `${index * 90}°`, point: profile[index * 180] })),
    coordinateOrigin: 'upper-left',
    coordinatePoints: Array.from({ length: 25 }, (_, index) => ({ id: `${index * 15}°`, point: profile[index * 30] })),
    measurements: [
      { id: '0°–360°', kind: 'length', value: wrapLengthMm, unit: 'mm' },
      { id: '0°–90°', kind: 'length', value: wrapLengthMm / 4, unit: 'mm' },
      { id: 'Δ', kind: 'depth', value: notchDepthMm, unit: 'mm' },
      { id: 'A', kind: 'stationHeight', value: stations[0].end.y - stations[0].start.y, unit: 'mm' },
      { id: 'B', kind: 'stationHeight', value: stations[1].end.y - stations[1].start.y, unit: 'mm' },
      { id: 'P (15°)', kind: 'length', value: wrapLengthMm / 24, unit: 'mm' },
    ],
  };
  return { allowance: 'zero-allowance' as const, notchDepthMm, wrapLengthMm, referenceBandMm, sampleStepDegrees: 0.5, profile, intersection, drawing };
}
