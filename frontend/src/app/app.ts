import { DOCUMENT } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { ReducerCalculator } from './reducer-calculator';
import { SquareToRoundCalculator } from './square-to-round-calculator';

type Language = 'ua' | 'ru' | 'en';
const copy = {
  ua: {
    title: "Атлас зварника",
    eyebrow: "Інструменти для майстерні",
    heading: "Розрахунки та шаблони для різання металу",
    intro: "Атлас допоможе перенести розміри деталі на метал перед різанням і зварюванням.",
    section: "Перші калькулятори",
    note: "Інші калькулятори заплановані для наступного етапу.",
    topics: ["Сідловий виріз"],
    descriptions: ["Шаблон вирізу для приєднання труби під прямим кутом."],
    planned: "Заплановано",
    footer: "Шаблони для майстерні",
    language: "Мова",
  },
  ru: {
    title: "Атлас сварщика",
    eyebrow: "Инструменты для мастерской",
    heading: "Расчёты и шаблоны для резки металла",
    intro: "Атлас поможет перенести размеры детали на металл перед резкой и сваркой.",
    section: "Первые калькуляторы",
    note: "Другие калькуляторы запланированы на следующий этап.",
    topics: ["Седловой вырез"],
    descriptions: ["Шаблон выреза для соединения труб под прямым углом."],
    planned: "Запланировано",
    footer: "Шаблоны для мастерской",
    language: "Язык",
  },
  en: {
    title: "Welder’s Atlas",
    eyebrow: "Workshop tools",
    heading: "Calculations and cutting templates",
    intro: "Use the atlas to transfer fitting dimensions onto metal before cutting and welding.",
    section: "First calculators",
    note: "More calculators are planned for the next milestone.",
    topics: ["Branch saddle"],
    descriptions: ["Trace the notch for a branch meeting the main pipe at a right angle."],
    planned: "Planned",
    footer: "Fabrication templates",
    language: "Language",
  },
};

@Component({ selector: 'app-root', imports: [ReducerCalculator, SquareToRoundCalculator], templateUrl: './app.html' })
export class App {
  private readonly document = inject(DOCUMENT);
  readonly language = signal<Language>('ua');
  readonly text = computed(() => copy[this.language()]);
  readonly languages = ['ua', 'ru', 'en'] as const;

  selectLanguage(language: Language): void {
    this.language.set(language);
    this.document.documentElement.lang = language === 'ua' ? 'uk' : language;
    this.document.title = this.text().title;
  }
}
