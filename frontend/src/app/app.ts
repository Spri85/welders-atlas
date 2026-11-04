import { StockPlanner } from './stock-planner';
import { DOCUMENT } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { ReducerCalculator } from './reducer-calculator';
import { SquareToRoundCalculator } from './square-to-round-calculator';
import { BranchSaddleCalculator } from './branch-saddle-calculator';
import { CalculatorWorkbench } from './calculator-workbench';
import { calculatorTools } from './calculator-registry';
import { calculatorGroups, transitionShortcuts } from './calculator-navigation';
import { MeasurementTooltip } from './measurement-tooltip';

type Language = 'ua' | 'ru' | 'en';
const languageStorageKey = 'welders-atlas.language';
const copy = {
  ua: {
    title: 'Атлас зварника',
    heading: 'Калькулятори для майстерні',
    intro:
      'Розраховуйте розміри деталей, готуйте шаблони та плануйте зварювальні роботи.',
    calculator: 'Калькулятор',
    shortcuts: 'Швидкий вибір переходу',
    footer: 'Інструменти для майстерні',
    language: 'Мова',
  },
  ru: {
    title: 'Атлас сварщика',
    heading: 'Калькуляторы для мастерской',
    intro:
      'Рассчитывайте размеры деталей, готовьте шаблоны и планируйте сварочные работы.',
    calculator: 'Калькулятор',
    shortcuts: 'Быстрый выбор перехода',
    footer: 'Инструменты для мастерской',
    language: 'Язык',
  },
  en: {
    title: 'Welder’s Atlas',
    heading: 'Workshop calculators',
    intro:
      'Calculate part dimensions, prepare templates and plan welding work.',
    calculator: 'Calculator',
    shortcuts: 'Transition shortcuts',
    footer: 'Workshop tools',
    language: 'Language',
  },
};

@Component({
  selector: 'app-root',
  imports: [
    ReducerCalculator,
    SquareToRoundCalculator,
    BranchSaddleCalculator,
    CalculatorWorkbench,
    StockPlanner,
    MeasurementTooltip,
  ],
  templateUrl: './app.html',
})
export class App {
  private readonly document = inject(DOCUMENT);
  readonly languages = ['ua', 'ru', 'en'] as const;
  readonly language = signal<Language>(this.initialLanguage());
  readonly text = computed(() => copy[this.language()]);
  readonly selectedCalculator = signal<string>('round-reducer');
  readonly calculatorGroups = calculatorGroups;
  readonly transitionShortcuts = transitionShortcuts;

  readonly selectedTool = computed(() =>
    calculatorTools.find((tool) => tool.id === this.selectedCalculator()),
  );

  constructor() {
    effect(() => {
      const language = this.language();
      this.document.documentElement.lang = language === 'ua' ? 'uk' : language;
      this.document.title = this.text().title;
    });
  }

  selectCalculator(value: string): void {
    if (
      this.calculatorGroups.some((group) =>
        group.calculators.some((calculator) => calculator.id === value),
      )
    ) {
      this.selectedCalculator.set(value);
    }
  }

  selectLanguage(value: string): void {
    const language = this.languages.find((option) => option === value);
    if (!language) return;
    this.language.set(language);
    try {
      this.document.defaultView?.localStorage.setItem(languageStorageKey, language);
    } catch {
      // Keep language switching available when browser storage is blocked.
    }
  }

  private initialLanguage(): Language {
    const browser = this.document.defaultView;
    try {
      const saved = browser?.localStorage.getItem(languageStorageKey);
      const language = this.languages.find((option) => option === saved);
      if (language) return language;
    } catch {
      // Browser preferences still work when storage is blocked.
    }
    const preferences = browser?.navigator.languages.length
      ? browser.navigator.languages
      : [browser?.navigator.language ?? 'en'];
    for (const locale of preferences) {
      const code = locale.toLowerCase().split('-')[0];
      const language = this.languages.find((option) => option === (code === 'uk' ? 'ua' : code));
      if (language) return language;
    }
    return 'en';
  }
}
