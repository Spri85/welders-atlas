import { finiteResult, positive } from './validation';
import { line, polygon } from './drawings';
import type { PatternDrawing } from '../pattern-drawing';
export function calculateSquareTransition(
  inletMm: number,
  outletMm: number,
  heightMm: number,
) {
  positive(inletMm, outletMm, heightMm);
  const insetMm = Math.abs(inletMm - outletMm) / 2;
  const faceHeightMm = Math.hypot(heightMm, insetMm);
  const seamMm = Math.hypot(faceHeightMm, insetMm);
  finiteResult(faceHeightMm, seamMm);
  const points = [
    { x: -inletMm / 2, y: 0 },
    { x: inletMm / 2, y: 0 },
    { x: outletMm / 2, y: faceHeightMm },
    { x: -outletMm / 2, y: faceHeightMm },
  ];
  const drawing: PatternDrawing = {
    ...polygon(points),
    construction: [line({ x: 0, y: 0 }, { x: 0, y: faceHeightMm })],
    vertices: points.map((point, i) => ({ id: String(i + 1), point })),
    labels: [
      { text: 'A', measurementId: 'A', point: { x: 0, y: 0 } },
      { text: 'B', measurementId: 'B', point: { x: 0, y: faceHeightMm } },
      { text: 'L', measurementId: 'L', point: { x: 0, y: faceHeightMm / 2 } },
      {
        text: 'C',
        measurementId: 'C',
        point: { x: (inletMm + outletMm) / 4, y: faceHeightMm / 2 },
      },
    ],
    measurements: [
      { id: 'A', kind: 'length', value: inletMm, unit: 'mm' },
      { id: 'B', kind: 'length', value: outletMm, unit: 'mm' },
      { id: 'L', kind: 'length', value: faceHeightMm, unit: 'mm' },
      { id: 'C', kind: 'length', value: seamMm, unit: 'mm' },
    ],
  };
  const ring = (side: number, z: number) => [
    { x: -side / 2, y: -side / 2, z },
    { x: side / 2, y: -side / 2, z },
    { x: side / 2, y: side / 2, z },
    { x: -side / 2, y: side / 2, z },
  ];
  const inlet = ring(inletMm, 0),
    outlet = ring(outletMm, heightMm);
  const model = [
    { points: [...inlet, inlet[0]] },
    { points: [...outlet, outlet[0]] },
    ...inlet.map((p, i) => ({
      points: [p, outlet[i]],
      seam: true,
      label: 'C',
    })),
  ];
  return {
    allowance: 'zero' as const,
    insetMm,
    faceHeightMm,
    seamMm,
    drawing,
    inlet,
    outlet,
    model,
  };
}
