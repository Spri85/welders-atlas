export interface ReducerDimensions {
  inletDiameterMm: number;
  outletDiameterMm: number;
  axialLengthMm: number;
}

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

export interface PatternSeam {
  kind: 'line';
  seamId: 'seam';
  start: PatternPoint;
  end: PatternPoint;
  lengthMm: number;
}

export interface CenteredRoundReducerPattern {
  slantHeightMm: number;
  outerRadiusMm: number;
  innerRadiusMm: number;
  sectorAngle: { radians: number; degrees: number };
  outline: {
    kind: 'annular-sector';
    units: 'mm';
    allowance: 'zero-allowance';
    closed: true;
    segments: [PatternArc, PatternSeam, PatternArc, PatternSeam];
  };
}

/** Coordinates use millimetres, with positive angles counterclockwise from +x. */
export function calculateCenteredRoundReducer(
  dimensions: ReducerDimensions,
): CenteredRoundReducerPattern {
  const { inletDiameterMm, outletDiameterMm, axialLengthMm } = dimensions;
  if (![inletDiameterMm, outletDiameterMm, axialLengthMm].every(
    (value) => Number.isFinite(value) && value > 0,
  )) {
    throw new RangeError('Reducer dimensions must be finite and greater than zero.');
  }
  if (outletDiameterMm >= inletDiameterMm) {
    throw new RangeError('Outlet diameter must be smaller than inlet diameter.');
  }

  const radialDifferenceMm = (inletDiameterMm - outletDiameterMm) / 2;
  const slantHeightMm = Math.hypot(axialLengthMm, radialDifferenceMm);
  const outerRadiusMm = slantHeightMm * ((inletDiameterMm / 2) / radialDifferenceMm);
  const innerRadiusMm = slantHeightMm * ((outletDiameterMm / 2) / radialDifferenceMm);
  const radians = 2 * Math.PI * (radialDifferenceMm / slantHeightMm);
  if (![slantHeightMm, outerRadiusMm, innerRadiusMm, radians].every(
    (value) => Number.isFinite(value) && value > 0,
  )) {
    throw new RangeError('Reducer pattern exceeds numeric range.');
  }

  const center = { x: 0, y: 0 };
  const outerStart = { x: outerRadiusMm, y: 0 };
  const outerEnd = { x: outerRadiusMm * Math.cos(radians), y: outerRadiusMm * Math.sin(radians) };
  const innerEnd = { x: innerRadiusMm * Math.cos(radians), y: innerRadiusMm * Math.sin(radians) };
  const innerStart = { x: innerRadiusMm, y: 0 };

  return {
    slantHeightMm,
    outerRadiusMm,
    innerRadiusMm,
    sectorAngle: { radians, degrees: radians * 180 / Math.PI },
    outline: {
      kind: 'annular-sector',
      units: 'mm',
      allowance: 'zero-allowance',
      closed: true,
      segments: [
        {
          kind: 'arc', center, radiusMm: outerRadiusMm,
          start: outerStart, end: outerEnd,
          startAngleRadians: 0, sweepAngleRadians: radians,
          lengthMm: outerRadiusMm * radians,
        },
        { kind: 'line', seamId: 'seam', start: outerEnd, end: innerEnd, lengthMm: slantHeightMm },
        {
          kind: 'arc', center, radiusMm: innerRadiusMm,
          start: innerEnd, end: innerStart,
          startAngleRadians: radians, sweepAngleRadians: -radians,
          lengthMm: innerRadiusMm * radians,
        },
        { kind: 'line', seamId: 'seam', start: innerStart, end: outerStart, lengthMm: slantHeightMm },
      ],
    },
  };
}
