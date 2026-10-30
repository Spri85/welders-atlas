import { Component, computed, input, signal } from '@angular/core';
import { exportCopy, type Language } from './export-copy';
import type { PatternDrawing } from './pattern-drawing';
import type { PaperSize } from './pattern-tiles';

@Component({
  selector: 'app-pattern-export',
  template: `
    <label>{{ text().paper }}
      <select #size [value]="paper()" (change)="selectPaper(size.value)">
        <option value="a4">A4</option><option value="letter">US Letter</option>
      </select>
    </label>
    <button class="export" type="button" [disabled]="!drawing() || busy()" (click)="download()">
      {{ busy() ? text().busy : text().download }}
    </button>
    <p>{{ text().actualSize }}</p>
    <p role="status">{{ failed() ? text().error : text().unverified }}</p>
  `,
  styles: `
    :host { display: block; margin-top: 24px; }
    label { display: block; font-size: 14px; }
    select, button { font: inherit; min-height: 44px; border: 1px solid #a6b0ab; border-radius: 3px; padding: 8px; }
    select { margin: 0 0 12px 10px; background: #fff; }
    button { color: #fff; background: #172a30; cursor: pointer; }
    button:disabled { color: #526267; background: #ecefe8; cursor: default; }
    :is(select, button):focus-visible { outline: 3px solid #bd5c2b; outline-offset: 3px; }
    p { font-size: 13px; line-height: 1.6; color: #526267; }
  `,
})
export class PatternExport {
  readonly drawing = input.required<PatternDrawing | null>();
  readonly language = input<Language>('ua');
  readonly title = input.required<string>();
  readonly summary = input('');
  readonly unit = input<'mm' | 'in'>('mm');
  readonly text = computed(() => exportCopy[this.language()]);
  readonly paper = signal<PaperSize>('a4');
  readonly busy = signal(false);
  readonly failed = signal(false);

  selectPaper(value: string): void {
    if (value === 'a4' || value === 'letter') this.paper.set(value);
  }

  async download(): Promise<void> {
    const drawing = this.drawing();
    if (!drawing || this.busy()) return;
    const options = { paper: this.paper(), language: this.language(), title: this.title(), summary: this.summary(), unit: this.unit() };
    this.busy.set(true);
    this.failed.set(false);
    try {
      const { createPatternPdf } = await import('./pattern-pdf');
      const response = await fetch(new URL('fonts/NotoSans-Regular.ttf', document.baseURI));
      if (!response.ok) throw new Error('Font unavailable.');
      const bytes = new Uint8Array(await response.arrayBuffer());
      const font = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('');
      createPatternPdf(drawing, options, font).save(`welders-atlas-${options.paper}.pdf`);
    } catch {
      this.failed.set(true);
    } finally {
      this.busy.set(false);
    }
  }
}
