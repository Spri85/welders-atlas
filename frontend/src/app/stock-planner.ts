import { Component, computed, input, signal } from '@angular/core';
import { text, formatQuantity } from './calculator-tool';
import type { Language } from './export-copy';
import { calculateStockPlan, type StockItem } from './calculators/stock-plan';
import { CalculationError } from './calculators/validation';
import { DrawingPreview } from './drawing-preview';
import { line, rectangle } from './calculators/drawings';
import type { PatternDrawing } from './pattern-drawing';

export const stockPlannerTitle = text(
  'Straight stock cutting planner',
  'План розкрою довгомірного прокату',
  'План раскроя длинномерного проката',
);
const copy = {
  title: stockPlannerTitle,
  intro: text(
    'Suggested longest-first plan, grouped by profile/material. Trims include trimming kerf. Cut order is shown left to right; no guarantee of the global optimum.',
    'Рекомендований план від найдовших деталей, окремо за профілем/матеріалом. Торцювання включає ширину різу. Порядок різання зліва направо; глобальний оптимум не гарантується.',
    'Предлагаемый план от самых длинных деталей, отдельно по профилю/материалу. Торцовка включает ширину реза. Порядок резки слева направо; глобальный оптимум не гарантируется.',
  ),
  parts: text('Required parts', 'Потрібні деталі', 'Требуемые детали'),
  stock: text('Available stock', 'Наявний прокат', 'Имеющийся прокат'),
  id: text('ID', 'Позначка', 'Обозначение'),
  group: text('Profile / material', 'Профіль / матеріал', 'Профиль / материал'),
  length: text('Length', 'Довжина', 'Длина'),
  quantity: text('Quantity', 'Кількість', 'Количество'),
  add: text('Add row', 'Додати рядок', 'Добавить строку'),
  remove: text('Remove', 'Видалити', 'Удалить'),
  kerf: text('Saw kerf', 'Ширина різу', 'Ширина реза'),
  trim: text(
    'Trim at each end',
    'Торцювання кожного кінця',
    'Торцовка каждого конца',
  ),
  reuse: text(
    'Minimum reusable offcut',
    'Мінімальний придатний залишок',
    'Минимальный пригодный остаток',
  ),
  mm: text('Millimetres', 'Міліметри', 'Миллиметры'),
  inch: text('Decimal inches', 'Десяткові дюйми', 'Десятичные дюймы'),
  error: text(
    'Check positive lengths, whole quantities, nonempty unique IDs, groups and nonnegative allowances. Limit: 10,000 pieces and bars.',
    'Перевірте додатні довжини, цілі кількості, непорожні унікальні позначки, групи та невід’ємні припуски. Ліміт: 10 000 деталей і заготовок.',
    'Проверьте положительные длины, целые количества, непустые уникальные обозначения, группы и неотрицательные припуски. Предел: 10 000 деталей и заготовок.',
  ),
  cuts: text('Ordered cuts', 'Порядок різів', 'Порядок резов'),
  loss: text('Total kerf', 'Втрати на різ', 'Потери на рез'),
  trims: text('Total trim', 'Всього торцювання', 'Всего торцовка'),
  left: text('Remainder', 'Залишок', 'Остаток'),
  reusable: text('Reusable', 'Придатний', 'Пригодный'),
  scrap: text('Scrap', 'Відходи', 'Отходы'),
  unplaced: text(
    'Unplaced pieces',
    'Нерозміщені деталі',
    'Неразмещённые детали',
  ),
  unused: text(
    'Unused stock',
    'Невикористаний прокат',
    'Неиспользованный прокат',
  ),
  none: text('None', 'Немає', 'Нет'),
};
type Collection = 'parts' | 'stock';
@Component({
  selector: 'app-stock-planner',
  imports: [DrawingPreview],
  styleUrls: ['./calculator.css'],
  styles: `
    .stock-rows {
      display: grid;
      gap: 12px;
    }
    .stock-row {
      display: grid;
      grid-template-columns: repeat(4, minmax(90px, 1fr)) auto;
      gap: 8px;
      align-items: end;
    }
    .stock-row label {
      font-size: 13px;
    }
    .stock-row input {
      width: 100%;
      box-sizing: border-box;
      min-height: 44px;
    }
    button {
      min-height: 44px;
      padding: 8px;
      font: inherit;
    }
    .row-scroll {
      overflow-x: auto;
    }
    .stock-results {
      margin-top: 24px;
    }
    h3 {
      margin-top: 24px;
    }
    dl {
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
    }
    dd {
      margin: 6px 0;
    }
    .units {
      display: flex;
      gap: 16px;
    }
    .stock-settings {
      display: flex;
      gap: 16px;
      flex-wrap: wrap;
    }
    .stock-settings label {
      display: grid;
      gap: 8px;
    }
    p {
      line-height: 1.6;
    }
  `,
  template: `<section class="calculator">
    <h2>{{ t('title') }}</h2>
    <p>{{ t('intro') }}</p>
    <fieldset class="units">
      <legend>{{ inches() ? t('inch') : t('mm') }}</legend>
      <label
        ><input
          type="radio"
          name="stock-unit"
          [checked]="!inches()"
          (change)="inches.set(false)"
        />{{ t('mm') }}</label
      ><label
        ><input
          type="radio"
          name="stock-unit"
          [checked]="inches()"
          (change)="inches.set(true)"
        />{{ t('inch') }}</label
      >
    </fieldset>
    @for (collection of collections; track collection) {
      <h3>{{ t(collection) }}</h3>
      <div class="row-scroll">
        <div class="stock-rows">
          @for (row of rows()[collection]; track $index; let i = $index) {
            <div class="stock-row">
              <label
                >{{ t('id')
                }}<input
                  #id
                  [attr.aria-label]="
                    t(collection) + ' ' + (i + 1) + ' ' + t('id')
                  "
                  [value]="row.id"
                  (input)="edit(collection, i, 'id', id.value)"
              /></label>
              <label
                >{{ t('group')
                }}<input
                  #group
                  [attr.aria-label]="
                    t(collection) + ' ' + (i + 1) + ' ' + t('group')
                  "
                  [value]="row.group"
                  (input)="edit(collection, i, 'group', group.value)"
              /></label>
              <label
                >{{ t('length')
                }}<input
                  #length
                  type="number"
                  step="any"
                  [attr.aria-label]="
                    t(collection) + ' ' + (i + 1) + ' ' + t('length')
                  "
                  [value]="row.lengthMm / factor()"
                  (input)="
                    edit(
                      collection,
                      i,
                      'lengthMm',
                      length.valueAsNumber * factor()
                    )
                  "
              /></label>
              <label
                >{{ t('quantity')
                }}<input
                  #quantity
                  type="number"
                  [attr.aria-label]="
                    t(collection) + ' ' + (i + 1) + ' ' + t('quantity')
                  "
                  [value]="row.quantity"
                  (input)="
                    edit(collection, i, 'quantity', quantity.valueAsNumber)
                  "
              /></label>
              <button
                type="button"
                [attr.aria-label]="
                  t('remove') + ' ' + t(collection) + ' ' + (i + 1)
                "
                (click)="remove(collection, i)"
              >
                ×
              </button>
            </div>
          }
        </div>
      </div>
      <button type="button" (click)="add(collection)">
        {{ t('add') }} · {{ t(collection) }}
      </button>
    }
    <div class="stock-settings">
      @for (setting of settings; track setting) {
        <label
          >{{ t(setting)
          }}<input
            #entry
            type="number"
            step="any"
            [attr.aria-label]="t(setting)"
            [value]="allowances()[setting] / factor()"
            (input)="setAllowance(setting, entry.valueAsNumber * factor())"
        /></label>
      }
    </div>
    @if (result(); as plan) {
      <div class="stock-results">
        @if (plan.bars.length) {
          <app-drawing-preview
            [drawing]="drawing()"
            [title]="t('title')"
            [language]="language()"
            [showDimensions]="false"
            [hints]="hints()"
          />
        }
        @for (bar of plan.bars; track bar.id) {
          <h3>{{ bar.id }} · {{ bar.group }} · {{ format(bar.lengthMm) }}</h3>
          <p>
            {{ t('cuts') }}:
            @for (cut of bar.cuts; track $index) {
              <span
                >{{ cut.id }}: {{ format(cut.lengthMm) }}
                @if (!$last) {
                  →
                }
              </span>
            }
          </p>
          <dl>
            <div>
              <dt>{{ t('trims') }}</dt>
              <dd>{{ format(bar.trimMm) }}</dd>
            </div>
            <div>
              <dt>{{ t('loss') }}</dt>
              <dd>{{ format(kerfTotal(bar)) }}</dd>
            </div>
            <div>
              <dt>
                {{ t('left') }} ·
                {{ bar.reusable ? t('reusable') : t('scrap') }}
              </dt>
              <dd>{{ format(bar.remainderMm) }}</dd>
            </div>
          </dl>
        }
        <h3>{{ t('unplaced') }}</h3>
        @for (part of plan.unplaced; track part.id) {
          <p>
            {{ part.id }} · {{ part.group }} · {{ format(part.lengthMm) }} ×
            {{ part.quantity }}
          </p>
        } @empty {
          <p>{{ t('none') }}</p>
        }
        <p>{{ t('unused') }}: {{ plan.unusedStock.join(', ') || t('none') }}</p>
      </div>
    } @else {
      <p role="alert">{{ t('error') }}</p>
    }
  </section>`,
})
export class StockPlanner {
  readonly language = input<Language>('ua');
  readonly inches = signal(false);
  readonly factor = computed(() => (this.inches() ? 25.4 : 1));
  readonly collections: Collection[] = ['parts', 'stock'];
  readonly settings = ['kerf', 'trim', 'reuse'] as const;
  readonly rows = signal<Record<Collection, StockItem[]>>({
    parts: [{ id: 'P1', group: 'steel', lengthMm: 400, quantity: 2 }],
    stock: [{ id: 'S1', group: 'steel', lengthMm: 1000, quantity: 1 }],
  });
  readonly allowances = signal({ kerf: 3, trim: 0, reuse: 100 });
  readonly result = computed(() => {
    try {
      return calculateStockPlan({
        ...this.rows(),
        kerfMm: this.allowances().kerf,
        trimMm: this.allowances().trim,
        reusableMm: this.allowances().reuse,
      });
    } catch (e) {
      if (!(e instanceof CalculationError)) throw e;
      return null;
    }
  });
  readonly hints = computed(() =>
    Object.fromEntries(
      (this.result()?.bars ?? []).flatMap((bar) =>
        bar.cuts.map((cut, i) => [
          `${bar.id}:${i + 1}`,
          `${cut.id} · ${this.format(cut.lengthMm)}`,
        ]),
      ),
    ),
  );
  readonly drawing = computed<PatternDrawing>(() => {
    const bars = this.result()?.bars ?? [];
    const width = Math.max(1, ...bars.map((b) => b.lengthMm));
    const height = width / 25;
    const outlines = bars.map((bar, i) =>
      rectangle(bar.lengthMm, height).outline.map((e) => ({
        ...e,
        start: { x: e.start.x, y: e.start.y + i * height * 2 },
        end: { x: e.end.x, y: e.end.y + i * height * 2 },
      })),
    );
    const construction = [];
    const labels = [];
    for (const [i, bar] of bars.entries()) {
      let x = bar.trimMm / 2;
      for (const [j, cut] of bar.cuts.entries()) {
        labels.push({
          text: `${bar.id}:${j + 1}`,
          point: { x: x + cut.lengthMm / 2, y: i * height * 2 + height / 2 },
          align: 'center' as const,
        });
        x += cut.lengthMm + cut.kerfMm;
        construction.push(
          line({ x, y: i * height * 2 }, { x, y: i * height * 2 + height }),
        );
      }
    }
    return {
      outline: outlines[0] ?? [],
      contours: outlines.slice(1),
      construction,
      labels,
    };
  });
  t(key: keyof typeof copy) {
    return copy[key][this.language()];
  }
  format(value: number) {
    return formatQuantity(value, 'mm', this.inches(), this.language());
  }
  kerfTotal(bar: { cuts: readonly { kerfMm: number }[] }) {
    return bar.cuts.reduce((s, c) => s + c.kerfMm, 0);
  }
  edit(
    collection: Collection,
    index: number,
    key: keyof StockItem,
    value: string | number,
  ) {
    this.rows.update((rows) => ({
      ...rows,
      [collection]: rows[collection].map((row, i) =>
        i === index ? { ...row, [key]: value } : row,
      ),
    }));
  }
  add(collection: Collection) {
    this.rows.update((rows) => ({
      ...rows,
      [collection]: [
        ...rows[collection],
        { id: '', group: 'steel', lengthMm: 1000, quantity: 1 },
      ],
    }));
  }
  remove(collection: Collection, index: number) {
    this.rows.update((rows) => ({
      ...rows,
      [collection]: rows[collection].filter((_, i) => i !== index),
    }));
  }
  setAllowance(key: 'kerf' | 'trim' | 'reuse', value: number) {
    this.allowances.update((v) => ({ ...v, [key]: value }));
  }
}
