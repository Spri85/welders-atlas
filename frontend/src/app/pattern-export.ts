import { Component, computed, input, signal, viewChild } from '@angular/core';
import { exportCopy, type Language } from './export-copy';
import type { PatternDrawing } from './pattern-drawing';
import type { PaperSize } from './pattern-tiles';
import { PdfExportOptions } from './pdf-export-options';

@Component({
  selector: 'app-pattern-export',
  imports: [PdfExportOptions],
  template: `
    <button class="export" type="button" [disabled]="!drawing() || busy()" (click)="options.open()">
      {{ text().download }}
    </button>
    <app-pdf-export-options #options [language]="language()" [title]="title()" [summary]="summary()"
      [busy]="busy()" [failed]="failed()" [valid]="!!drawing()" (download)="download($event)" />
  `,
  styles: `
    :host { display: block; margin-top: 24px; }
    button { font: inherit; min-height: 44px; border: 1px solid #a6b0ab; border-radius: 3px; padding: 10px 16px; color: #fff; background: #172a30; cursor: pointer; }
    button:disabled { color: #526267; background: #ecefe8; cursor: default; }
    button:focus-visible { outline: 3px solid #bd5c2b; outline-offset: 3px; }
  `,
})
export class PatternExport {
  readonly drawing = input.required<PatternDrawing | null>();
  readonly language = input<Language>('ua');
  readonly title = input.required<string>();
  readonly summary = input('');
  readonly unit = input<'mm' | 'in'>('mm');
  readonly text = computed(() => exportCopy[this.language()]);
  readonly busy = signal(false);
  readonly failed = signal(false);

  private readonly options = viewChild.required(PdfExportOptions);

  async download(paper: PaperSize): Promise<void> {
    const drawing = this.drawing();
    if (!drawing || this.busy()) return;
    const options = { paper, language: this.language(), title: this.title(), summary: this.summary(), unit: this.unit() };
    this.busy.set(true);
    this.failed.set(false);
    try {
      const { createPatternPdf } = await import('./pattern-pdf');
      const response = await fetch(new URL('fonts/NotoSans-Regular.ttf', document.baseURI));
      if (!response.ok) throw new Error('Font unavailable.');
      const bytes = new Uint8Array(await response.arrayBuffer());
      const font = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('');
      createPatternPdf(drawing, options, font).save(`welders-atlas-${options.paper}.pdf`);
      this.options().close();
    } catch {
      this.failed.set(true);
    } finally {
      this.busy.set(false);
    }
  }
}
