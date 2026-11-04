import { DOCUMENT } from '@angular/common';
import { Directive, ElementRef, inject, input, type OnDestroy, signal } from '@angular/core';

let nextTooltipId = 0;

@Directive({
  selector: '[measurementTooltip]',
  host: {
    tabindex: '0',
    '[attr.aria-label]': 'measurementTooltip()',
    '[attr.aria-describedby]': 'visible() ? tooltipId : null',
    '(mouseenter)': 'show()',
    '(mouseleave)': 'hide()',
    '(focus)': 'show()',
    '(blur)': 'hide()',
    '(keydown.escape)': 'hide()',
  },
})
export class MeasurementTooltip implements OnDestroy {
  readonly measurementTooltip = input.required<string>();
  readonly visible = signal(false);
  readonly tooltipId = `measurement-tooltip-${++nextTooltipId}`;
  private readonly element = inject<ElementRef<HTMLElement | SVGElement>>(ElementRef);
  private readonly document = inject(DOCUMENT);
  private tooltip: HTMLDivElement | null = null;

  show(): void {
    this.hide();
    const tooltip = this.document.createElement('div');
    tooltip.id = this.tooltipId;
    tooltip.className = 'measurement-tooltip';
    tooltip.setAttribute('role', 'tooltip');
    tooltip.textContent = this.measurementTooltip();
    this.document.body.append(tooltip);
    const target = this.element.nativeElement.getBoundingClientRect();
    const bounds = tooltip.getBoundingClientRect();
    const window = this.document.defaultView!;
    tooltip.style.left = `${Math.max(8, Math.min(target.left, window.innerWidth - bounds.width - 8))}px`;
    tooltip.style.top = `${target.bottom + bounds.height + 8 > window.innerHeight ? target.top - bounds.height - 8 : target.bottom + 8}px`;
    this.tooltip = tooltip;
    this.visible.set(true);
  }

  hide(): void {
    this.tooltip?.remove();
    this.tooltip = null;
    this.visible.set(false);
  }

  ngOnDestroy(): void { this.hide(); }
}
