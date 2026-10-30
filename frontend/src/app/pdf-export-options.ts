import { Component, computed, ElementRef, input, output, signal, viewChild } from '@angular/core';
import { exportCopy, type Language } from './export-copy';
import type { PaperSize } from './pattern-tiles';

@Component({
  selector: 'app-pdf-export-options',
  template: `
    <dialog #dialog [attr.aria-label]="text().settings">
      <h2>{{ text().settings }}</h2>
      <p><strong>{{ title() }}</strong></p>
      <p>{{ summary() }}</p>
      <label>{{ text().paper }}
        <select #size [value]="paper()" [disabled]="busy()" (change)="selectPaper(size.value)">
          <option value="a4">A4</option><option value="letter">US Letter</option>
        </select>
      </label>
      <p>{{ text().actualSize }}</p>
      <p>{{ text().assemble }}</p>
      <p>{{ text().zero }}</p>
      <p role="status">{{ failed() ? text().error : text().unverified }}</p>
      <div class="actions">
        <button type="button" (click)="close()">{{ text().close }}</button>
        <button type="button" class="confirm" [disabled]="!valid() || busy()" (click)="download.emit(paper())">
          {{ busy() ? text().busy : text().download }}
        </button>
      </div>
    </dialog>
  `,
  styles: `
    dialog { width: min(540px, calc(100vw - 32px)); max-height: calc(100dvh - 32px); overflow: auto; padding: 24px; border: 1px solid #a6b0ab; border-radius: 5px; color: #172a30; background: #f6f5f0; }
    dialog::backdrop { background: #172a3070; }
    h2 { font-size: 22px; margin-top: 0; }
    p { font-size: 14px; line-height: 1.6; overflow-wrap: anywhere; }
    label { display: flex; align-items: center; flex-wrap: wrap; gap: 12px; }
    select, button { min-height: 44px; padding: 10px 16px; font: inherit; border: 1px solid #a6b0ab; border-radius: 3px; background: #fff; color: #172a30; }
    button { cursor: pointer; }
    .confirm { background: #172a30; color: #fff; }
    button:disabled { color: #526267; background: #ecefe8; cursor: default; }
    .actions { display: flex; flex-wrap: wrap; justify-content: flex-end; gap: 12px; margin-top: 24px; }
    :is(select, button):focus-visible { outline: 3px solid #bd5c2b; outline-offset: 3px; }
  `,
})
export class PdfExportOptions {
  readonly language = input<Language>('ua');
  readonly title = input.required<string>();
  readonly summary = input('');
  readonly busy = input(false);
  readonly failed = input(false);
  readonly valid = input(true);
  readonly text = computed(() => exportCopy[this.language()]);
  readonly paper = signal<PaperSize>('a4');
  readonly download = output<PaperSize>();
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  open(): void { this.dialog().nativeElement.showModal(); }
  close(): void { this.dialog().nativeElement.close(); }
  selectPaper(value: string): void {
    if (value === 'a4' || value === 'letter') this.paper.set(value);
  }
}
