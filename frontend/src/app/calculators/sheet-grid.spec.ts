import { describe, expect, it } from 'vitest';
import { calculateSheetGrid as calc } from './sheet-grid';
describe('G17 sheet grid', () => {
  it('selects the 16-blank worked layout and keeps last spacing off the scrap', () => {
    const r = calc(1000, 600, 240, 140, 10, 5, true);
    expect(r.count).toBe(16);
    expect(r.rotatedCount).toBe(12);
    expect(r.remainderWidthMm).toBe(5);
    expect(r.remainderHeightMm).toBe(5);
  });
  it('handles rotation-only fits, ties, zero spacing and no fit', () => {
    expect(calc(100, 200, 180, 80, 0, 0, true).count).toBe(1);
    expect(calc(100, 200, 180, 80, 0, 0, false).count).toBe(0);
    expect(calc(200, 200, 100, 100, 0, 0, true).rotated).toBe(false);
    expect(calc(200, 200, 300, 300, 0, 0, true).count).toBe(0);
  });
  it('rejects invalid dimensions and negative spacing', () => {
    expect(() => calc(0, 600, 240, 140, 10, 5, true)).toThrow();
    expect(() => calc(1000, 600, 240, 140, 10, -1, true)).toThrow();
  });
});

it('keeps exact-fit counts across decimal inch conversion without accepting oversized blanks', () => {
  const result = calc(2.4 * 25.4, 25.4, 0.4 * 25.4, 25.4, 0, 0, false);
  expect(result.columns).toBe(6);
  expect(result.count).toBe(6);
  expect(result.remainderWidthMm).toBeCloseTo(0, 10);
  expect(calc(0.6, 1, 0.1, 1, 0, 0, false).count).toBe(6);
  expect(
    calc(2.4 * 25.4 - 0.001, 25.4, 0.4 * 25.4, 25.4, 0, 0, false).count,
  ).toBe(5);
});
