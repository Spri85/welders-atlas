export type CalculationErrorCode =
  | 'positive'
  | 'nonnegative'
  | 'integer'
  | 'angle'
  | 'geometry'
  | 'range'
  | 'pair'
  | 'fraction'
  | 'limit';

export class CalculationError extends RangeError {
  constructor(readonly code: CalculationErrorCode) {
    super(code);
  }
}

export function requireCondition(
  condition: boolean,
  code: CalculationErrorCode = 'geometry',
): void {
  if (!condition) throw new CalculationError(code);
}

export function positive(...values: number[]): void {
  requireCondition(
    values.every((value) => Number.isFinite(value) && value > 0),
    'positive',
  );
}

export function nonnegative(...values: number[]): void {
  requireCondition(
    values.every((value) => Number.isFinite(value) && value >= 0),
    'nonnegative',
  );
}

export function integer(value: number, minimum = 1, maximum = 10_000): void {
  requireCondition(Number.isSafeInteger(value) && value >= minimum, 'integer');
  requireCondition(value <= maximum, 'limit');
}

export function finiteResult(...values: number[]): void {
  requireCondition(values.every(Number.isFinite), 'range');
}
