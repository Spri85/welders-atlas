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
