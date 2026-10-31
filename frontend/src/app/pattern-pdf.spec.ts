import { describe, expect, it, vi } from 'vitest';
import { calculateSquareToRound } from './square-to-round';
import { drawingMeasurements } from './pattern-measurements';
import { exportCopy } from './export-copy';
import { createPatternPdf } from './pattern-pdf';

const calls = vi.hoisted(
  () => [] as { page: number; text: string | string[]; x: number; y: number }[],
);
vi.mock('jspdf', () => ({
  jsPDF: class {
    constructor(options: { format: number[] }) {
      let page = 1;
      const [width, height] = options.format;
      const pdf = new Proxy(
        {},
        {
          get(_target, key) {
            if (key === 'internal')
              return {
                pageSize: { getWidth: () => width, getHeight: () => height },
              };
            if (key === 'getNumberOfPages') return () => page;
            if (key === 'addPage')
              return () => {
                page++;
                return pdf;
              };
            if (key === 'splitTextToSize') return (text: string) => [text];
            if (key === 'text')
              return (text: string | string[], x: number, y: number) => {
                calls.push({ page, text, x, y });
                return pdf;
              };
            return () => pdf;
          },
        },
      );
      return pdf;
    }
  },
}));

describe('adaptive pattern PDF reference pagination', () => {
  it.each(['a4', 'letter'] as const)(
    'keeps all dimension and coordinate rows on %s pages',
    (paper) => {
      calls.length = 0;
      const result = calculateSquareToRound({
        squareWidthMm: 2000,
        roundDiameterMm: 1500,
        heightMm: 150,
        maxDeviationMm: 0.1,
      });
      createPatternPdf(
        result.drawing,
        {
          paper,
          language: 'en',
          title: 'Adaptive transition',
          summary: 'Calculated segments',
          unit: 'mm',
        },
        '',
      );
      const pageHeight = paper === 'a4' ? 297 : 279.4;
      const firstTilePage = calls.find(
        (call) => call.text === exportCopy.en.actualSize,
      )!.page;
      const referenceCalls = calls.filter((call) => call.page < firstTilePage);
      for (const call of referenceCalls) {
        expect(call.y).toBeGreaterThan(0);
        expect(call.y).toBeLessThan(pageHeight);
      }
      const dimensionIds = drawingMeasurements(result.drawing).map(
        (item) => item.id,
      );
      for (const id of dimensionIds)
        expect(
          referenceCalls.filter((call) => call.x === 10 && call.text === id),
        ).toHaveLength(1);
      const dimensionPages = new Set(
        referenceCalls
          .filter(
            (call) => call.x === 10 && dimensionIds.includes(String(call.text)),
          )
          .map((call) => call.page),
      );
      expect(dimensionPages.size).toBeGreaterThan(1);
      for (const vertex of result.drawing.coordinatePoints!)
        expect(
          referenceCalls.filter(
            (call) => call.x === 10 && call.text === vertex.id,
          ),
        ).toHaveLength(1);
    },
  );
});
