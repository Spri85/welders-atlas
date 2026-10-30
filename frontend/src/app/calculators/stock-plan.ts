import { finiteResult, integer, nonnegative, positive, requireCondition } from './validation';
export interface StockItem { id: string; group: string; lengthMm: number; quantity: number }
export interface StockPlanInputs { parts: readonly StockItem[]; stock: readonly StockItem[]; kerfMm: number; trimMm: number; reusableMm: number }
export interface PlannedBar { id: string; group: string; lengthMm: number; cuts: { id: string; lengthMm: number; kerfMm: number }[]; trimMm: number; remainderMm: number; reusable: boolean }

export function calculateStockPlan(input: StockPlanInputs) {
  nonnegative(input.kerfMm, input.trimMm, input.reusableMm);
  requireCondition(input.parts.length > 0 && input.stock.length > 0);
  for (const items of [input.parts, input.stock]) {
    requireCondition(new Set(items.map((item) => item.id.trim())).size === items.length);
    for (const item of items) { requireCondition(!!item.id.trim() && !!item.group.trim()); positive(item.lengthMm); integer(item.quantity); }
    integer(items.reduce((sum, item) => sum + item.quantity, 0));
  }
  const bars: PlannedBar[] = input.stock.flatMap((item) => Array.from({ length: item.quantity }, (_, i) => ({ id: `${item.id}/${i + 1}`, group: item.group.trim(), lengthMm: item.lengthMm, cuts: [], trimMm: 2 * input.trimMm, remainderMm: item.lengthMm - 2 * input.trimMm, reusable: false })));
  requireCondition(bars.every((bar) => bar.remainderMm >= 0));
  const pieces = input.parts.flatMap((part, order) => Array.from({ length: part.quantity }, () => ({ ...part, order })) ).sort((a, b) => b.lengthMm - a.lengthMm || a.order - b.order);
  const unplaced: { id: string; group: string; lengthMm: number; quantity: number }[] = [];
  for (const piece of pieces) {
    const candidates = bars.map((bar, index) => {
      const tolerance = 1e-10 * Math.max(1, bar.lengthMm);
      const exact = Math.abs(bar.remainderMm - piece.lengthMm) <= tolerance;
      const kerf = exact ? 0 : input.kerfMm;
      return { bar, index, kerf, remaining: exact ? 0 : bar.remainderMm - piece.lengthMm - kerf };
    }).filter(({ bar, remaining }) => bar.group === piece.group.trim() && remaining >= 0).sort((a, b) => a.remaining - b.remaining || Number(b.bar.cuts.length > 0) - Number(a.bar.cuts.length > 0) || a.index - b.index);
    const selected = candidates[0];
    if (selected) { selected.bar.cuts.push({ id: piece.id, lengthMm: piece.lengthMm, kerfMm: selected.kerf }); selected.bar.remainderMm = selected.remaining; }
    else { const row = unplaced.find((row) => row.id === piece.id); if (row) row.quantity++; else unplaced.push({ id: piece.id, group: piece.group, lengthMm: piece.lengthMm, quantity: 1 }); }
  }
  const used = bars.filter((bar) => bar.cuts.length);
  for (const bar of used) { bar.reusable = bar.remainderMm > 0 && bar.remainderMm >= input.reusableMm; finiteResult(bar.remainderMm, bar.trimMm); }
  return { bars: used, unusedStock: bars.filter((bar) => !bar.cuts.length).map((bar) => bar.id), unplaced };
}
