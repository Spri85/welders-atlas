import { describe, expect, it } from 'vitest';
import { calculatePositionerSpeed as calc } from './positioner-speed';
describe('G20 positioner speed', () => {
  it('converts linear speed to workpiece rotation', () => {
    const r = calc(100, 300);
    expect(r.rpm).toBeCloseTo(0.95492965855, 10);
    expect(r.secondsPerTurn).toBeCloseTo(62.831853, 5);
    expect(calc(200, 300).rpm).toBe(r.rpm / 2);
  });
  it('flags limits and permits an exact boundary', () => {
    expect(calc(100, 300, 1, 3).status).toBe('slow');
    const n = calc(100, 300).rpm;
    expect(calc(100, 300, n, n).status).toBe('within');
    expect(calc(100, 300, undefined, 0.5).status).toBe('fast');
  });
  it('rejects inverted ranges and zero speed', () => {
    expect(() => calc(100, 300, 3, 1)).toThrow();
    expect(() => calc(100, 0)).toThrow();
  });
});
