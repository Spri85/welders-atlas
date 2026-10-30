import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PatternExport } from './pattern-export';
import { PdfExportOptions } from './pdf-export-options';

describe('pattern download', () => {
  afterEach(() => vi.restoreAllMocks());

  it('disables download for invalid geometry', async () => {
    const fixture = TestBed.createComponent(PatternExport);
    fixture.componentRef.setInput('drawing', null);
    fixture.componentRef.setInput('title', 'Round reducer');
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('button').disabled).toBe(true);
  });

  it('reports a font failure and allows retry', async () => {
    const fetchFont = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'));
    const fixture = TestBed.createComponent(PatternExport);
    fixture.componentRef.setInput('drawing', { outline: [] });
    fixture.componentRef.setInput('title', 'Round reducer');
    await fixture.componentInstance.download('a4');
    expect(fixture.componentInstance.failed()).toBe(true);
    expect(fixture.componentInstance.busy()).toBe(false);
    await fixture.componentInstance.download('a4');
    expect(fetchFont).toHaveBeenCalledTimes(2);
    expect(fixture.componentInstance.busy()).toBe(false);
  });

  it('keeps paper settings in the dialog and emits the selected paper', async () => {
    const fixture = TestBed.createComponent(PdfExportOptions);
    fixture.componentRef.setInput('title', 'Round reducer');
    fixture.componentRef.setInput('language', 'en');
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement;
    expect(root.querySelector('dialog')!.hasAttribute('open')).toBe(false);
    const select = root.querySelector('select')!;
    select.value = 'letter';
    select.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    const download = vi.fn();
    fixture.componentInstance.download.subscribe(download);
    root.querySelector<HTMLButtonElement>('.confirm')!.click();
    expect(download).toHaveBeenCalledWith('letter');
  });
});
