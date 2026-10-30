import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('Welder’s Atlas shell', () => {
  beforeEach(() => {
    document.documentElement.lang = 'uk';
  });

  it('renders the selected language and updates document metadata through the controls', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Атлас зварника');
    const buttons = fixture.nativeElement.querySelectorAll(
      'button',
    ) as NodeListOf<HTMLButtonElement>;
    buttons[1].click();
    await fixture.whenStable();
    expect(document.documentElement.lang).toBe('ru');
    expect(document.title).toBe('Атлас сварщика');
    expect(buttons[1].getAttribute('aria-pressed')).toBe('true');
    buttons[2].click();
    await fixture.whenStable();
    expect(document.documentElement.lang).toBe('en');
    expect(fixture.nativeElement.textContent).toContain('Welder’s Atlas');
    buttons[0].click();
    await fixture.whenStable();
    expect(document.documentElement.lang).toBe('uk');
  });

  it('shows only the selected calculator and translates the action selector', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement;
    const selector =
      root.querySelector<HTMLSelectElement>('#calculator-action')!;
    expect(root.querySelectorAll('app-reducer-calculator')).toHaveLength(1);
    expect(root.querySelector('app-square-to-round-calculator')).toBeNull();
    expect(root.querySelector('app-branch-saddle-calculator')).toBeNull();
    selector.value = 'square-to-round';
    selector.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(root.querySelector('app-reducer-calculator')).toBeNull();
    expect(root.querySelector('app-square-to-round-calculator')).not.toBeNull();
    expect(root.querySelector('app-branch-saddle-calculator')).toBeNull();
    selector.value = 'branch-saddle';
    selector.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(root.querySelector('app-square-to-round-calculator')).toBeNull();
    expect(root.querySelector('app-branch-saddle-calculator')).not.toBeNull();
    fixture.componentInstance.selectLanguage('en');
    await fixture.whenStable();
    expect(
      root.querySelector('label[for=calculator-action]')!.textContent,
    ).toBe('Action');
    expect(selector.selectedOptions[0].textContent).toContain('Branch saddle');
    expect(root.querySelectorAll('button.export')).toHaveLength(1);
  });
});

it('offers all 25 calculators and mounts only the selected one', async () => {
  const fixture = TestBed.createComponent(App);
  await fixture.whenStable();
  const root: HTMLElement = fixture.nativeElement;
  const selector = root.querySelector<HTMLSelectElement>('#calculator-action')!;
  expect(selector.options).toHaveLength(25);
  for (const option of Array.from(selector.options)) {
    selector.value = option.value;
    selector.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(root.querySelectorAll('section.calculator')).toHaveLength(1);
    expect(root.querySelector('section.calculator h2')?.textContent).toBe(
      option.textContent,
    );
    expect(root.querySelector('svg')).not.toBeNull();
  }
});
