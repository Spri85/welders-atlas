import { describe, expect, it } from 'vitest';
import { calculateStockMass as calc } from './stock-mass';
const plate = {
  mode: 'plate' as const,
  lengthMm: 1000,
  widthMm: 500,
  thicknessMm: 6,
  densityKgPerM3: 7850,
  quantity: 4,
  pricePerKg: 2,
};
describe('G19 stock mass', () => {
  it('calculates plate and supplier sections', () => {
    const r = calc(plate);
    expect(r.eachKg).toBeCloseTo(23.55, 10);
    expect(r.totalKg).toBeCloseTo(94.2, 10);
    expect(r.cost).toBeCloseTo(188.4, 10);
    expect(
      calc({ mode: 'section', lengthMm: 3000, kgPerMetre: 5, quantity: 2 })
        .totalKg,
    ).toBe(30);
  });
  it('distinguishes omitted price from zero', () => {
    expect(calc({ ...plate, pricePerKg: undefined }).cost).toBeUndefined();
    expect(calc({ ...plate, pricePerKg: 0 }).cost).toBe(0);
  });
  it('rejects invalid density, quantities and catalog mass', () => {
    expect(() => calc({ ...plate, densityKgPerM3: 0 })).toThrow();
    expect(() => calc({ ...plate, quantity: 1.5 })).toThrow();
    expect(() =>
      calc({ mode: 'section', lengthMm: 3000, kgPerMetre: NaN, quantity: 2 }),
    ).toThrow();
  });
});
