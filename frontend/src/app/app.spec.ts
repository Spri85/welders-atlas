import { TestBed } from '@angular/core/testing';
import { App } from './app';

beforeEach(() => {
  localStorage.removeItem('welders-atlas.language');
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(['uk-UA']);
});

afterEach(() => {
  vi.restoreAllMocks();
  localStorage.removeItem('welders-atlas.language');
});

describe('Welder’s Atlas shell', () => {
  it('renders the selected language and updates document metadata through the controls', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    expect(fixture.nativeElement.textContent).toContain('Атлас зварника');
    const selector: HTMLSelectElement = fixture.nativeElement.querySelector('.language-select');
    expect(selector.value).toBe('ua');
    expect(selector.getAttribute('aria-label')).toBe('Мова');
    expect(Array.from(selector.options, (option) => option.textContent)).toEqual(['UA', 'RU', 'EN']);
    selector.value = 'ru';
    selector.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(document.documentElement.lang).toBe('ru');
    expect(document.title).toBe('Атлас сварщика');
    expect(selector.getAttribute('aria-label')).toBe('Язык');
    selector.value = 'en';
    selector.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(document.documentElement.lang).toBe('en');
    expect(fixture.nativeElement.textContent).toContain('Welder’s Atlas');
    expect(selector.getAttribute('aria-label')).toBe('Language');
    selector.value = 'ua';
    selector.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(document.documentElement.lang).toBe('uk');
  });

  it.each([
    { preferences: ['uk-UA', 'en-US'], selected: 'ua', lang: 'uk', title: 'Атлас зварника' },
    { preferences: ['ru-RU', 'uk-UA'], selected: 'ru', lang: 'ru', title: 'Атлас сварщика' },
    { preferences: ['de-DE', 'en-GB', 'uk-UA'], selected: 'en', lang: 'en', title: 'Welder’s Atlas' },
    { preferences: ['de-DE', 'pl-PL'], selected: 'en', lang: 'en', title: 'Welder’s Atlas' },
  ])('chooses $selected from browser preferences $preferences', async ({ preferences, selected, lang, title }) => {
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue(preferences);
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    expect(fixture.componentInstance.language()).toBe(selected);
    expect(document.documentElement.lang).toBe(lang);
    expect(document.title).toBe(title);
    expect(fixture.nativeElement.querySelector('.language-select').value).toBe(selected);
    expect(localStorage.getItem('welders-atlas.language')).toBeNull();
  });

  it('uses navigator.language when the preference list is empty and ignores invalid saved values', async () => {
    vi.spyOn(navigator, 'languages', 'get').mockReturnValue([]);
    vi.spyOn(navigator, 'language', 'get').mockReturnValue('ru-RU');
    localStorage.setItem('welders-atlas.language', 'invalid');
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.language-select').value).toBe('ru');
  });

  it('remembers an explicit selection ahead of browser preferences on the next visit', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const selector: HTMLSelectElement = fixture.nativeElement.querySelector('.language-select');
    selector.value = 'en';
    selector.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(localStorage.getItem('welders-atlas.language')).toBe('en');
    fixture.destroy();
    const nextVisit = TestBed.createComponent(App);
    await nextVisit.whenStable();
    expect(nextVisit.nativeElement.querySelector('.language-select').value).toBe('en');
    expect(document.documentElement.lang).toBe('en');
    expect(document.title).toBe('Welder’s Atlas');
  });

  it('still follows browser preferences and switches language when storage is blocked', async () => {
    vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
      throw new DOMException('Storage blocked', 'SecurityError');
    });
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const selector: HTMLSelectElement = fixture.nativeElement.querySelector('.language-select');
    expect(selector.value).toBe('ua');
    selector.value = 'en';
    selector.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(document.title).toBe('Welder’s Atlas');
    expect(document.documentElement.lang).toBe('en');
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
    const fields = Array.from(
      root.querySelectorAll<HTMLElement>('[data-field-reference]'),
    );
    const references = Array.from(
      root.querySelectorAll<HTMLElement>('[data-input-reference]'),
    );
    expect(fields.length).toBeGreaterThan(0);
    expect(references.map((node) => node.dataset['inputReference'])).toEqual(
      fields.map((node) => node.dataset['fieldReference']),
    );
    expect(
      new Set(references.map((node) => node.dataset['inputReference'])).size,
    ).toBe(references.length);
    for (const input of Array.from(
      root.querySelectorAll<HTMLInputElement>(
        'section.calculator input[type=number]',
      ),
    )) {
      expect(
        input.closest('[data-field-reference]') ??
          root.querySelector(`[data-field-reference][for="${input.id}"]`),
      ).not.toBeNull();
    }

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

it('labels icon shortcuts and reveals their names on hover and keyboard focus', async () => {
  const fixture = TestBed.createComponent(App);
  await fixture.whenStable();
  const shortcuts = Array.from(
    fixture.nativeElement.querySelectorAll('.transition-shortcuts button'),
  ) as HTMLButtonElement[];
  expect(shortcuts.map((button) => button.getAttribute('aria-label'))).toEqual([
    'Круг → круг', 'Квадрат → круг', 'Квадрат → квадрат',
  ]);
  for (const button of shortcuts) {
    expect(button.textContent?.trim()).toBe('');
    expect(button.querySelector('svg')?.getAttribute('aria-hidden')).toBe('true');
    expect(button.querySelector('svg')?.getAttribute('focusable')).toBe('false');
  }
  shortcuts[0].dispatchEvent(new MouseEvent('mouseenter'));
  expect(document.querySelector('[role=tooltip]')?.textContent).toBe('Круг → круг');
  shortcuts[0].dispatchEvent(new MouseEvent('mouseleave'));
  expect(document.querySelector('[role=tooltip]')).toBeNull();
  shortcuts[1].focus();
  await fixture.whenStable();
  const tooltipId = shortcuts[1].getAttribute('aria-describedby')!;
  expect(document.getElementById(tooltipId)?.textContent).toBe('Квадрат → круг');
  shortcuts[1].dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
  expect(document.querySelector('[role=tooltip]')).toBeNull();
  shortcuts[1].blur();
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
  const languageSelector = root.querySelector<HTMLSelectElement>('.language-select')!;
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
    languageSelector.selectedIndex = index;
    languageSelector.dispatchEvent(new Event('change'));
    await fixture.whenStable();
    expect(root.querySelector('h1')?.textContent).toBe(copy.heading);
    expect(
      root.querySelector('label[for=calculator-select]')?.textContent,
    ).toBe(copy.label);
    expect(
      Array.from(root.querySelectorAll('optgroup'), (group) => group.label),
    ).toEqual(copy.groups);
    const shortcut = root.querySelector<HTMLButtonElement>('.transition-shortcuts button:last-child')!;
    expect(shortcut.getAttribute('aria-label')).toBe(copy.shortcut);
    shortcut.dispatchEvent(new MouseEvent('mouseenter'));
    expect(document.querySelector('[role=tooltip]')?.textContent).toBe(copy.shortcut);
    shortcut.dispatchEvent(new MouseEvent('mouseleave'));
    expect(selector.value).toBe('arc-energy');
    expect(root.querySelector('input[type=number]')).toBe(input);
    expect(input.value).toBe('25');
    expect(selector.selectedOptions[0].textContent).toBe(
      root.querySelector('section.calculator h2')?.textContent,
    );
  }
});
