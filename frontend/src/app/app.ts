import { StockPlanner } from './stock-planner';
import { DOCUMENT } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ReducerCalculator } from './reducer-calculator';
import { SquareToRoundCalculator } from './square-to-round-calculator';
import { BranchSaddleCalculator } from './branch-saddle-calculator';
import { CalculatorWorkbench } from './calculator-workbench';
import { calculatorTools } from './calculator-registry';
import { calculatorGroups, transitionShortcuts } from './calculator-navigation';
import { MeasurementTooltip } from './measurement-tooltip';

type Language = 'ua' | 'ru' | 'en';
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
  readonly language = signal<Language>('ua');
  readonly text = computed(() => copy[this.language()]);
  readonly languages = ['ua', 'ru', 'en'] as const;
  readonly selectedCalculator = signal<string>('round-reducer');
  readonly calculatorGroups = calculatorGroups;
  readonly transitionShortcuts = transitionShortcuts;

  readonly selectedTool = computed(() =>
    calculatorTools.find((tool) => tool.id === this.selectedCalculator()),
  );

  selectCalculator(value: string): void {
    if (
      this.calculatorGroups.some((group) =>
        group.calculators.some((calculator) => calculator.id === value),
      )
    ) {
      this.selectedCalculator.set(value);
    }
  }

  selectLanguage(language: Language): void {
    this.language.set(language);
    this.document.documentElement.lang = language === 'ua' ? 'uk' : language;
    this.document.title = this.text().title;
  }
}
