import { DOCUMENT } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ReducerCalculator } from './reducer-calculator';
import { SquareToRoundCalculator } from './square-to-round-calculator';
import { BranchSaddleCalculator } from './branch-saddle-calculator';
import { reducerCopy } from './reducer-copy';
import { squareToRoundCopy } from './square-to-round-copy';
import { branchSaddleCopy } from './branch-saddle-copy';

type Language = 'ua' | 'ru' | 'en';
const copy = {
  ua: {
    title: "Атлас зварника",
    eyebrow: "Інструменти для майстерні",
    heading: "Розрахунки та шаблони для різання металу",
    intro: "Атлас допоможе перенести розміри деталі на метал перед різанням і зварюванням.",
    action: "Дія",
    footer: "Шаблони для майстерні",
    language: "Мова",
  },
  ru: {
    title: "Атлас сварщика",
    eyebrow: "Инструменты для мастерской",
    heading: "Расчёты и шаблоны для резки металла",
    intro: "Атлас поможет перенести размеры детали на металл перед резкой и сваркой.",
    action: "Действие",
    footer: "Шаблоны для мастерской",
    language: "Язык",
  },
  en: {
    title: "Welder’s Atlas",
    eyebrow: "Workshop tools",
    heading: "Calculations and cutting templates",
    intro: "Use the atlas to transfer fitting dimensions onto metal before cutting and welding.",
    action: "Action",
    footer: "Fabrication templates",
    language: "Language",
  },
};

@Component({ selector: 'app-root', imports: [ReducerCalculator, SquareToRoundCalculator, BranchSaddleCalculator], templateUrl: './app.html' })
export class App {
  private readonly document = inject(DOCUMENT);
  readonly language = signal<Language>('ua');
  readonly text = computed(() => copy[this.language()]);
  readonly languages = ['ua', 'ru', 'en'] as const;
  readonly selectedCalculator = signal<'round-reducer' | 'square-to-round' | 'branch-saddle'>('round-reducer');
  readonly calculators = computed(() => [
    { id: 'round-reducer', title: reducerCopy[this.language()].heading },
    { id: 'square-to-round', title: squareToRoundCopy[this.language()].heading },
    { id: 'branch-saddle', title: branchSaddleCopy[this.language()].heading },
  ]);

  selectCalculator(value: string): void {
    if (value === 'round-reducer' || value === 'square-to-round' || value === 'branch-saddle') {
      this.selectedCalculator.set(value);
    }
  }

  selectLanguage(language: Language): void {
    this.language.set(language);
    this.document.documentElement.lang = language === 'ua' ? 'uk' : language;
    this.document.title = this.text().title;
  }
}
