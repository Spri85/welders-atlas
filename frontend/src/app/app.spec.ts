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
      '.languages button',
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

  it('shows only the selected calculator and translates the calculator selector', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const root: HTMLElement = fixture.nativeElement;
    const selector =
      root.querySelector<HTMLSelectElement>('#calculator-select')!;
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
      root.querySelector('label[for=calculator-select]')!.textContent,
    ).toBe('Calculator');
    expect(selector.selectedOptions[0].textContent).toContain('Branch saddle');
    expect(root.querySelectorAll('button.export')).toHaveLength(1);
  });
});

it('offers all 25 calculators and mounts only the selected one', async () => {
  const fixture = TestBed.createComponent(App);
  await fixture.whenStable();
  const root: HTMLElement = fixture.nativeElement;
  const selector = root.querySelector<HTMLSelectElement>('#calculator-select')!;
  expect(selector.options).toHaveLength(25);
  expect(
    new Set(Array.from(selector.options, (option) => option.value)).size,
  ).toBe(25);
  for (const option of Array.from(selector.options)) {
    selector.value = option.value;
    selector.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(root.querySelectorAll('section.calculator')).toHaveLength(1);
    expect(root.querySelector('section.calculator h2')?.textContent).toBe(
      option.textContent,
    );
    expect(root.querySelector('svg')).not.toBeNull();
    const printable = [
      'round-reducer',
      'square-to-round',
      'square-transition',
      'branch-saddle',
      'mitered-corner',
      'bolt-circle',
      'plate-opening',
      'segmented-elbow',
    ].includes(option.value);
    expect(
      root.querySelectorAll('.calculator-heading button.export'),
    ).toHaveLength(printable ? 1 : 0);
    expect(root.querySelector('.workbench button.export')).toBeNull();
  }
});

const expectedGroups = [
  ['round-reducer', 'square-to-round', 'square-transition'],
  [
    'branch-saddle',
    'mitered-corner',
    'pipe-offset',
    'bracket-blank',
    'segmented-elbow',
    'rolled-sleeve',
    'tube-bend',
    'measured-radius',
  ],
  ['rectangular-frame', 'gate-bars', 'bolt-circle', 'plate-opening'],
  ['stock-planner', 'sheet-grid', 'circular-kerf', 'stock-mass'],
  [
    'fillet-filler',
    'positioner-speed',
    'intermittent-weld',
    'single-v',
    'gas-budget',
    'arc-energy',
  ],
];

it('groups calculators by workshop task in the agreed order', async () => {
  const fixture = TestBed.createComponent(App);
  await fixture.whenStable();
  const root: HTMLElement = fixture.nativeElement;
  const groups = Array.from(root.querySelectorAll('optgroup'));
  expect(
    groups.map((group) =>
      Array.from(group.querySelectorAll('option'), (option) => option.value),
    ),
  ).toEqual(expectedGroups);
  expect(root.querySelectorAll('#calculator-select > option')).toHaveLength(0);
});

it('keeps shortcuts and the selector synchronized without resetting the active calculator', async () => {
  const fixture = TestBed.createComponent(App);
  await fixture.whenStable();
  const root: HTMLElement = fixture.nativeElement;
  const selector = root.querySelector<HTMLSelectElement>('#calculator-select')!;
  const shortcuts = Array.from(
    root.querySelectorAll<HTMLButtonElement>('.transition-shortcuts button'),
  );
  expect(selector.value).toBe('round-reducer');
  expect(shortcuts[0].getAttribute('aria-pressed')).toBe('true');
  for (const [index, id] of expectedGroups[0].entries()) {
    shortcuts[index].click();
    await fixture.whenStable();
    expect(selector.value).toBe(id);
    expect(
      shortcuts.map((button) => button.getAttribute('aria-pressed')),
    ).toEqual(shortcuts.map((_, buttonIndex) => String(buttonIndex === index)));
    expect(root.querySelectorAll('section.calculator')).toHaveLength(1);
    const input = root.querySelector<HTMLInputElement>('input[type=number]')!;
    input.value = '350';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    shortcuts[index].click();
    await fixture.whenStable();
    expect(root.querySelector('input[type=number]')).toBe(input);
    expect(input.value).toBe('350');
  }
  selector.value = 'gas-budget';
  selector.dispatchEvent(new Event('change'));
  await fixture.whenStable();
  expect(
    shortcuts.every(
      (button) => button.getAttribute('aria-pressed') === 'false',
    ),
  ).toBe(true);
  selector.value = 'square-to-round';
  selector.dispatchEvent(new Event('change'));
  await fixture.whenStable();
  expect(shortcuts[1].getAttribute('aria-pressed')).toBe('true');
});

it('translates navigation while preserving the selected tool and its inputs', async () => {
  const fixture = TestBed.createComponent(App);
  await fixture.whenStable();
  const root: HTMLElement = fixture.nativeElement;
  const selector = root.querySelector<HTMLSelectElement>('#calculator-select')!;
  selector.value = 'arc-energy';
  selector.dispatchEvent(new Event('change'));
  await fixture.whenStable();
  const input = root.querySelector<HTMLInputElement>('input[type=number]')!;
  input.value = '25';
  input.dispatchEvent(new Event('input'));
  await fixture.whenStable();
  const languageButtons =
    root.querySelectorAll<HTMLButtonElement>('.languages button');
  const expected = [
    {
      heading: 'Калькулятори для майстерні',
      label: 'Калькулятор',
      groups: [
        'Переходи',
        'Труби та формування',
        'Рами та розмітка',
        'Розкрій та матеріали',
        'Зварювання',
      ],
      shortcut: 'Квадрат → квадрат',
    },
    {
      heading: 'Калькуляторы для мастерской',
      label: 'Калькулятор',
      groups: [
        'Переходы',
        'Трубы и формовка',
        'Рамы и разметка',
        'Раскрой и материалы',
        'Сварка',
      ],
      shortcut: 'Квадрат → квадрат',
    },
    {
      heading: 'Workshop calculators',
      label: 'Calculator',
      groups: [
        'Transitions',
        'Pipework & forming',
        'Frames & layout',
        'Cutting & materials',
        'Welding',
      ],
      shortcut: 'Square → square',
    },
  ];
  for (const [index, copy] of expected.entries()) {
    languageButtons[index].click();
    await fixture.whenStable();
    expect(root.querySelector('h1')?.textContent).toBe(copy.heading);
    expect(
      root.querySelector('label[for=calculator-select]')?.textContent,
    ).toBe(copy.label);
    expect(
      Array.from(root.querySelectorAll('optgroup'), (group) => group.label),
    ).toEqual(copy.groups);
    expect(root.querySelector('.transition-shortcuts')?.textContent).toContain(
      copy.shortcut,
    );
    expect(selector.value).toBe('arc-energy');
    expect(root.querySelector('input[type=number]')).toBe(input);
    expect(input.value).toBe('25');
    expect(selector.selectedOptions[0].textContent).toBe(
      root.querySelector('section.calculator h2')?.textContent,
    );
  }
});
