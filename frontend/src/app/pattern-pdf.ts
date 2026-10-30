import { jsPDF } from 'jspdf';
import { arcPoints, type PatternDrawing } from './pattern-drawing';
import { layoutPatternTiles, type PaperSize } from './pattern-tiles';
import { exportCopy, type Language } from './export-copy';
import { drawingCopy } from './drawing-copy';
import { drawingCoordinates, drawingMeasurements, formatPatternMeasurement } from './pattern-measurements';

export interface PdfOptions {
  paper: PaperSize;
  language: Language;
  title: string;
  summary: string;
  unit: 'mm' | 'in';
}

function drawDimensionReference(pdf: jsPDF, drawing: PatternDrawing, options: PdfOptions): void {
  const text = drawingCopy[options.language];
  const printing = exportCopy[options.language];
  const format = (value: number, unit: 'mm' | 'degree') => formatPatternMeasurement(value, unit, options.unit, options.language);
  pdf.setFontSize(11);
  pdf.text(options.title, 10, 10);
  pdf.text(text.reference, 10, 18);
  pdf.setFontSize(7);
  pdf.text(pdf.splitTextToSize(options.summary, pdf.internal.pageSize.getWidth() - 20), 10, 26);
  pdf.setFontSize(9);
  pdf.text(text.dimensions, 10, 45);
  pdf.setFontSize(8);
  pdf.text(text.id, 10, 53);
  pdf.text(text.kind, 45, 53);
  pdf.text(text.size, 135, 53);
  let y = 60;
  for (const item of drawingMeasurements(drawing)) {
    pdf.text(item.id, 10, y);
    pdf.text(text[item.kind], 45, y);
    pdf.text(format(item.value, item.unit), 135, y);
    y += 6;
  }
  const coordinates = drawingCoordinates(drawing);
  if (coordinates.length) {
    y += 9;
    pdf.setFontSize(9);
    pdf.text(text.coordinates, 10, y);
    pdf.setFontSize(7);
    pdf.text(text.origin, 10, y + 6);
    y += 14;
    pdf.setFontSize(8);
    pdf.text(text.id, 10, y);
    pdf.text('X', 65, y);
    pdf.text('Y', 135, y);
    for (const point of coordinates) {
      y += 6;
      pdf.text(point.id, 10, y);
      pdf.text(format(point.x, 'mm'), 65, y);
      pdf.text(format(point.y, 'mm'), 135, y);
    }
  }
  pdf.setFontSize(7);
  pdf.text(printing.zero, 10, pdf.internal.pageSize.getHeight() - 15);
  pdf.text(printing.unverified, 10, pdf.internal.pageSize.getHeight() - 9);
}

export function createPatternPdf(drawing: PatternDrawing, options: PdfOptions, font: string): jsPDF {
  const layout = layoutPatternTiles(drawing, options.paper);
  if (layout.tiles.length >= 200) throw new RangeError('Pattern and reference exceed 200 pages.');
  const text = exportCopy[options.language];
  const pdf = new jsPDF({ unit: 'mm', format: [layout.page.width, layout.page.height], precision: 6, putOnlyUsedFonts: true });
  pdf.addFileToVFS('NotoSans-Regular.ttf', font);
  pdf.addFont('NotoSans-Regular.ttf', 'NotoSans', 'normal');
  pdf.setFont('NotoSans');
  pdf.viewerPreferences({ PrintScaling: 'None' });
  pdf.setDocumentProperties({ title: options.title, creator: 'Welder’s Atlas' });
  drawDimensionReference(pdf, drawing, options);
  const outline = drawing.outline.flatMap((segment) => segment.kind === 'arc' ? arcPoints(segment) : [segment.start, segment.end]);

  for (const tile of layout.tiles) {
    pdf.addPage([layout.page.width, layout.page.height]);
    pdf.setFontSize(11);
    pdf.text(`${options.title} | ${options.unit} | ${tile.row + 1}-${tile.column + 1}`, 10, 10);
    pdf.setFontSize(7);
    pdf.text(text.actualSize, 10, 16);
    pdf.text(text.assemble, 10, 20);
    pdf.text(pdf.splitTextToSize(options.summary, layout.width), 10, 25);
    pdf.text(`${text.row} ${tile.row + 1}/${layout.rows} | ${text.column} ${tile.column + 1}/${layout.columns}`, 10, 38);

    pdf.saveGraphicsState();
    pdf.rect(layout.margin, layout.top, layout.width, layout.height, null);
    pdf.clip().discardPath();
    pdf.setLineWidth(0.2);
    pdf.setDrawColor(0);
    const start = tile.project(outline[0]);
    pdf.moveTo(start.x, start.y);
    for (const point of outline.slice(1)) {
      const projected = tile.project(point);
      pdf.lineTo(projected.x, projected.y);
    }
    pdf.close().stroke();
    pdf.setLineDashPattern([2, 1], 0);
    for (const line of drawing.folds ?? []) {
      const from = tile.project(line.start);
      const to = tile.project(line.end);
      pdf.line(from.x, from.y, to.x, to.y);
    }
    pdf.setLineDashPattern([], 0);
    pdf.setFontSize(9);
    for (const label of drawing.labels ?? []) {
      const point = tile.project(label.point);
      pdf.text(label.text, point.x, point.y);
    }
    for (const vertex of drawing.vertices ?? []) {
      const point = tile.project(vertex.point);
      pdf.circle(point.x, point.y, 0.5);
      if (!drawing.labels?.some((label) => label.text === vertex.id)) {
        pdf.text(vertex.id, point.x + 1, point.y - 1);
      }
    }
    pdf.restoreGraphicsState();

    pdf.setDrawColor(150);
    pdf.setLineWidth(0.1);
    pdf.rect(layout.margin, layout.top, layout.width, layout.height);
    for (const x of [layout.margin + 5, layout.margin + layout.width - 5]) {
      for (const y of [layout.top + 5, layout.top + layout.height - 5]) {
        pdf.line(x - 2, y, x + 2, y);
        pdf.line(x, y - 2, x, y + 2);
      }
    }
    pdf.setDrawColor(0);
    const scaleY = layout.page.height - 20;
    pdf.line(10, scaleY, 60, scaleY);
    pdf.line(10, scaleY - 1, 10, scaleY + 1);
    pdf.line(60, scaleY - 1, 60, scaleY + 1);
    pdf.setFontSize(7);
    pdf.text(text.scale, 65, scaleY + 1);
    pdf.text(text.cut, 10, layout.page.height - 15);
    pdf.text(text.zero, 10, layout.page.height - 11);
    pdf.text(text.unverified, 10, layout.page.height - 7);
  }
  return pdf;
}
