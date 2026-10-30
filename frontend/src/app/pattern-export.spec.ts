import { TestBed } from '@angular/core/testing';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { PatternExport } from './pattern-export';

describe('pattern download', () => {
  afterEach(() => vi.restoreAllMocks());

  it('disables download for invalid geometry and accepts A4 or Letter', async () => {
    const fixture = TestBed.createComponent(PatternExport);
    fixture.componentRef.setInput('drawing', null);
    fixture.componentRef.setInput('title', 'Round reducer');
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('button').disabled).toBe(true);
    fixture.componentInstance.selectPaper('letter');
    expect(fixture.componentInstance.paper()).toBe('letter');
    fixture.componentInstance.selectPaper('unknown');
    expect(fixture.componentInstance.paper()).toBe('letter');
  });

  it('reports a font failure and allows retry', async () => {
    const fetchFont = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'));
    const fixture = TestBed.createComponent(PatternExport);
    fixture.componentRef.setInput('drawing', { outline: [] });
    fixture.componentRef.setInput('title', 'Round reducer');
    await fixture.componentInstance.download();
    expect(fixture.componentInstance.failed()).toBe(true);
    expect(fixture.componentInstance.busy()).toBe(false);
    await fixture.componentInstance.download();
    expect(fetchFont).toHaveBeenCalledTimes(2);
    expect(fixture.componentInstance.busy()).toBe(false);
  });
});
