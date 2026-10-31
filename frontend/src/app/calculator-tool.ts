import type { Language } from './export-copy';
import type { PatternDrawing } from './pattern-drawing';
import type { ModelLine } from './drawing-preview';

export type Localized = Readonly<Record<Language, string>>;
export const text = (en: string, ua: string, ru: string): Localized => ({
  en,
  ua,
  ru,
});
export type QuantityUnit =
  | 'mm'
  | 'mm/min'
  | 'mm²'
  | 'mm³'
  | 'degree'
  | 'kg'
  | 'kg/m'
  | 'kg/m³'
  | 'g/cm³'
  | 'money'
  | 'count'
  | 'rpm'
  | 's'
  | 'min'
  | 'L'
  | 'L/min'
  | '%'
  | 'ratio'
  | 'kJ/mm'
  | 'V'
  | 'A';
export type CalculatorValues = Readonly<Record<string, number>>;

export interface CalculatorField {
  id: string;
  reference: string;
  label: Localized;
  initial: number;
  unit: QuantityUnit;
  optional?: boolean;
  choices?: readonly { value: number; label: Localized }[];
  when?: (values: CalculatorValues) => boolean;
}

export const field = (
  id: string,
  reference: string,
  label: Localized,
  initial: number,
  unit: QuantityUnit = 'mm',
  options: Pick<CalculatorField, 'optional' | 'choices' | 'when'> = {},
): CalculatorField => ({ id, reference, label, initial, unit, ...options });

export interface CalculatorMetric {
  id: string;
  label: Localized;
  value: number;
  unit: QuantityUnit;
}
export interface CalculatorTable {
  title: Localized;
  columns: readonly { label: Localized; unit?: QuantityUnit }[];
  rows: readonly (readonly (number | string | Localized)[])[];
}
export interface CalculatorResult {
  metrics: readonly CalculatorMetric[];
  drawing: PatternDrawing;
  model?: readonly ModelLine[];
  notes?: readonly Localized[];
  tables?: readonly CalculatorTable[];
  diagrams?: readonly { title: Localized; drawing: PatternDrawing }[];
  templates?: readonly { title: Localized; drawing: PatternDrawing }[];
}
export interface CalculatorTool {
  id: string;
  ticket: string;
  title: Localized;
  description: Localized;
  fields: readonly CalculatorField[];
  printable?: boolean;
  calculate(values: CalculatorValues): CalculatorResult;
}

export function optional(value: number): number | undefined {
  return Number.isNaN(value) ? undefined : value;
}

const unitLabels: Record<Language, Partial<Record<QuantityUnit, string>>> = {
  en: { degree: '°', money: '', count: '', ratio: '' },
  ua: {
    mm: 'мм',
    'mm/min': 'мм/хв',
    'mm²': 'мм²',
    'mm³': 'мм³',
    degree: '°',
    kg: 'кг',
    'kg/m': 'кг/м',
    'kg/m³': 'кг/м³',
    'g/cm³': 'г/см³',
    money: '',
    count: '',
    rpm: 'об/хв',
    s: 'с',
    min: 'хв',
    L: 'л',
    'L/min': 'л/хв',
    ratio: '',
    'kJ/mm': 'кДж/мм',
    V: 'В',
    A: 'А',
  },
  ru: {
    mm: 'мм',
    'mm/min': 'мм/мин',
    'mm²': 'мм²',
    'mm³': 'мм³',
    degree: '°',
    kg: 'кг',
    'kg/m': 'кг/м',
    'kg/m³': 'кг/м³',
    'g/cm³': 'г/см³',
    money: '',
    count: '',
    rpm: 'об/мин',
    s: 'с',
    min: 'мин',
    L: 'л',
    'L/min': 'л/мин',
    ratio: '',
    'kJ/mm': 'кДж/мм',
    V: 'В',
    A: 'А',
  },
};

export function entryFactor(unit: QuantityUnit, inches: boolean): number {
  if (!inches) return 1;
  if (unit === 'mm' || unit === 'mm/min') return 25.4;
  if (unit === 'mm²') return 25.4 ** 2;
  if (unit === 'mm³') return 25.4 ** 3;
  if (unit === 'kJ/mm') return 1 / 25.4;
  return 1;
}

export function quantityUnit(
  unit: QuantityUnit,
  inches: boolean,
  language: Language,
): string {
  if (inches) {
    const inch = language === 'en' ? 'in' : 'дюйм';
    if (unit === 'mm') return inch;
    if (unit === 'mm/min')
      return `${inch}/${{ en: 'min', ua: 'хв', ru: 'мин' }[language]}`;
    if (unit === 'mm²') return `${inch}²`;
    if (unit === 'mm³') return `${inch}³`;
    if (unit === 'kJ/mm') return `${language === 'en' ? 'kJ' : 'кДж'}/${inch}`;
  }
  return unitLabels[language][unit] ?? unit;
}

export function formatQuantity(
  value: number,
  unit: QuantityUnit,
  inches: boolean,
  language: Language,
): string {
  let digits = inches ? 4 : 2;
  if (unit === 'kg') digits = 5;
  if (unit === 'rpm' || unit === 'kJ/mm') digits = 3;
  const number = new Intl.NumberFormat(language === 'ua' ? 'uk' : language, {
    maximumFractionDigits: digits,
  }).format(value / entryFactor(unit, inches));
  return `${number} ${quantityUnit(unit, inches, language)}`.trim();
}
