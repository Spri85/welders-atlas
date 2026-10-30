import { Component, computed, input, linkedSignal, signal } from '@angular/core';
import { type CalculatorField, type CalculatorTool, type QuantityUnit, entryFactor, formatQuantity, quantityUnit, text } from './calculator-tool';
import { CalculationError } from './calculators/validation';
import { DrawingPreview } from './drawing-preview';
import { PatternExport } from './pattern-export';
import { reducerCopy } from './reducer-copy';
import type { Language } from './export-copy';

const errors = {
  positive: text('Enter finite values greater than zero.', 'Введіть скінченні значення, більші за нуль.', 'Введите конечные значения больше нуля.'),
  nonnegative: text('Enter finite, nonnegative values.', 'Введіть скінченні невід’ємні значення.', 'Введите конечные неотрицательные значения.'),
  integer: text('Enter whole counts in the supported range.', 'Введіть цілі кількості в допустимому діапазоні.', 'Введите целые количества в допустимом диапазоне.'),
  angle: text('The angle is outside this tool’s stated range.', 'Кут поза вказаним діапазоном інструмента.', 'Угол вне указанного диапазона инструмента.'),
  geometry: text('These dimensions cannot form the specified job. Check the input constraints.', 'Ці розміри не дають заданої деталі. Перевірте обмеження вхідних даних.', 'Эти размеры не дают заданной детали. Проверьте ограничения входных данных.'),
  range: text('The result exceeds the numeric range.', 'Результат перевищує числовий діапазон.', 'Результат превышает числовой диапазон.'),
  pair: text('Supply both optional measurements together.', 'Введіть обидва необов’язкові виміри разом.', 'Введите оба необязательных измерения вместе.'),
  fraction: text('Check the fraction or efficiency range.', 'Перевірте діапазон частки або ефективності.', 'Проверьте диапазон доли или эффективности.'),
  limit: text('The job exceeds the 10,000-item display limit.', 'Завдання перевищує ліміт відображення 10 000 елементів.', 'Задание превышает предел отображения 10 000 элементов.'),
};

@Component({
  selector: 'app-calculator-workbench',
  imports: [DrawingPreview, PatternExport],
  template: `
    <section class="calculator" aria-labelledby="tool-heading">
      <div class="calculator-heading"><h2 id="tool-heading">{{ tool().title[language()] }}</h2><p>{{ tool().description[language()] }}</p></div>
      <div class="workbench">
        <div class="controls">
          <fieldset class="units"><legend>{{ common().units }}</legend>
            <label><input type="radio" name="tool-units" [checked]="!inches()" (change)="inches.set(false)"> {{ common().mm }}</label>
            <label><input type="radio" name="tool-units" [checked]="inches()" (change)="inches.set(true)"> {{ common().inches }}</label>
          </fieldset>
          @for (field of tool().fields; track field.id) {
            @if (!field.when || field.when(values())) {
              <label class="dimension" [for]="'tool-' + field.id">{{ field.label[language()] }} <span>{{ unitName(field.unit) }} @if (field.optional) { ({{ optionalLabel[language()] }}) }</span></label>
              @if (field.choices) {
                <select #choice [id]="'tool-' + field.id" [value]="values()[field.id]" (change)="update(field, +choice.value)">
                  @for (option of field.choices; track option.value) { <option [value]="option.value">{{ option.label[language()] }}</option> }
                </select>
              } @else {
                <input #entry [id]="'tool-' + field.id" type="number" step="any" inputmode="decimal" [required]="!field.optional"
                  [value]="inputValue(field)" [attr.aria-invalid]="!!calculation().error" [attr.aria-describedby]="calculation().error ? 'tool-error' : null"
                  (input)="update(field, entry.valueAsNumber, entry.validity.badInput)">
              }
            }
          }
          <div class="validation" aria-live="polite">@if (calculation().error; as error) { <p id="tool-error">{{ error }}</p> }</div>
          @if (tool().printable && calculation().error) {
            <app-pattern-export [drawing]="null" [language]="language()" [title]="tool().title[language()]" />
          }
        </div>
        <div class="output">
          @if (calculation().result; as result) {
            @for (note of result.notes ?? []; track $index) { <p class="job-note">{{ note[language()] }}</p> }
            <app-drawing-preview [drawing]="result.drawing" [model]="result.model ?? []" [language]="language()" [unit]="inches() ? 'in' : 'mm'"
              [title]="tool().title[language()]" [showDimensions]="false" [hints]="hints()" />
            <dl class="measurements" aria-live="polite">
              @for (metric of result.metrics; track metric.id) {
                <div><dt>{{ metric.id }} · {{ metric.label[language()] }}</dt><dd [attr.data-metric]="metric.id">{{ format(metric.value, metric.unit) }}</dd></div>
              }
            </dl>
            @for (table of result.tables ?? []; track $index) {
              <h3>{{ table.title[language()] }}</h3>
              <div class="table-scroll"><table [attr.aria-label]="table.title[language()]">
                <thead><tr>@for (column of table.columns; track $index) { <th scope="col">{{ column.label[language()] }}</th> }</tr></thead>
                <tbody>@for (row of table.rows; track $index) { <tr>@for (cell of row; track $index) {
                  <td>{{ cellText(cell, table.columns[$index].unit) }}</td>
                }</tr> }</tbody>
              </table></div>
            }
            @for (template of result.templates ?? []; track $index) {
              <h3>{{ template.title[language()] }}</h3>
              <app-pattern-export [drawing]="template.drawing" [language]="language()" [title]="template.title[language()]" [unit]="inches() ? 'in' : 'mm'" [summary]="summary()" />
            }
          }
        </div>
      </div>
    </section>
  `,
  styleUrls: ['./calculator.css'],
  styles: `
    select { width: 100%; min-height: 44px; padding: 10px; font: inherit; background: #fff; color: #172a30; border: 1px solid #a6b0ab; border-radius: 3px; }
    select:focus-visible { outline: 3px solid #bd5c2b; outline-offset: 3px; }
    .table-scroll { overflow-x: auto; }
    table { border-collapse: collapse; width: 100%; font-size: 14px; }
    th, td { text-align: left; padding: 10px 6px; border-bottom: 1px solid #d8ddd8; }
    .job-note { color: #526267; line-height: 1.6; font-size: 14px; }
  `,
})
export class CalculatorWorkbench {
  readonly tool = input.required<CalculatorTool>();
  readonly language = input<Language>('ua');
  readonly common = computed(() => reducerCopy[this.language()]);
  readonly optionalLabel = text('optional', 'необов’язково', 'необязательно');
  readonly inches = signal(false);
  readonly values = linkedSignal(() => Object.fromEntries(this.tool().fields.map((field) => [field.id, field.initial])));
  readonly calculation = computed(() => {
    try {
      for (const field of this.tool().fields) {
        if (field.when && !field.when(this.values())) continue;
        const value = this.values()[field.id];
        if (field.optional && Number.isNaN(value)) continue;
        if (!Number.isFinite(value)) throw new CalculationError('range');
        if (field.choices && !field.choices.some((choice) => choice.value === value)) throw new CalculationError('geometry');
      }
      return { result: this.tool().calculate(this.values()), error: null };
    } catch (error) {
      if (!(error instanceof CalculationError)) throw error;
      return { result: null, error: errors[error.code][this.language()] };
    }
  });
  readonly hints = computed(() => Object.fromEntries((this.calculation().result?.metrics ?? []).map((metric) => [metric.id, `${metric.label[this.language()]} = ${this.format(metric.value, metric.unit)}`])));
  readonly summary = computed(() => [this.tool().description[this.language()], ...(this.calculation().result?.notes ?? []).map((note) => note[this.language()])].join(' '));

  inputValue(field: CalculatorField): number | string {
    const value = this.values()[field.id];
    return Number.isFinite(value) ? value / entryFactor(field.unit, this.inches()) : '';
  }
  update(field: CalculatorField, value: number, badInput = false): void {
    this.values.update((values) => ({ ...values, [field.id]: (badInput ? Infinity : value) * entryFactor(field.unit, this.inches()) }));
  }
  unitName(unit: QuantityUnit): string { return quantityUnit(unit, this.inches(), this.language()); }
  format(value: number, unit: QuantityUnit): string { return formatQuantity(value, unit, this.inches(), this.language()); }
  cellText(cell: number | string | Readonly<Record<Language, string>>, unit: QuantityUnit = 'ratio'): string {
    if (typeof cell === 'number') return this.format(cell, unit);
    return typeof cell === 'string' ? cell : cell[this.language()];
  }
}
