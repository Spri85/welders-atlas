import { field, optional, text, type CalculatorTool } from '../calculator-tool';
import { calculateIntermittentWeld } from './intermittent-weld';
export const intermittentWeldTool: CalculatorTool = {
  id: 'intermittent-weld',
  ticket: 'G21',
  title: text(
    'Intermittent weld marks',
    'Розмітка переривчастого шва',
    'Разметка прерывистого шва',
  ),
  description: text(
    'One side of the joint. Numbered segments use the drawing-specified center pitch and full length. Marks are measured from the left datum; tooltips show starts. No full segment means the entire joint remains unwelded. Required clearance is checked without changing pitch.',
    'Одна сторона стику. Нумеровані відрізки мають заданий кресленням крок центрів і повну довжину. Відмітки від лівої бази; підказки показують початки. Якщо повний відрізок не вміщується, весь стик залишається незвареним. Заданий кінцевий відступ перевіряється без зміни кроку.',
    'Одна сторона стыка. Нумерованные отрезки имеют заданный чертежом шаг центров и полную длину. Отметки от левой базы; подсказки показывают начала. Если полный отрезок не помещается, весь стык остаётся несваренным. Заданный конечный отступ проверяется без изменения шага.',
  ),
  fields: [
    field(
      'joint',
      'J',
      text('Joint length', 'Довжина стику', 'Длина стыка'),
      350,
    ),
    field(
      'first',
      's₀',
      text(
        'First start from datum',
        'Перший початок від бази',
        'Первое начало от базы',
      ),
      10,
    ),
    field(
      'segment',
      'ℓ',
      text(
        'Full segment length',
        'Повна довжина відрізка',
        'Полная длина отрезка',
      ),
      30,
    ),
    field(
      'pitch',
      'p',
      text('Center-to-center pitch', 'Крок між центрами', 'Шаг между центрами'),
      100,
    ),
    field(
      'clearance',
      'e',
      text(
        'Required far-end clearance',
        'Заданий кінцевий відступ',
        'Заданный конечный отступ',
      ),
      NaN,
      'mm',
      { optional: true },
    ),
  ],
  calculate({ joint, first, segment, pitch, clearance }) {
    const r = calculateIntermittentWeld(
      joint,
      first,
      segment,
      pitch,
      optional(clearance),
    );
    return {
      drawing: r.drawing,
      notes:
        r.clearanceMatches === undefined
          ? []
          : [
              r.clearanceMatches
                ? text(
                    'Required far-end clearance matches.',
                    'Заданий кінцевий відступ збігається.',
                    'Заданный конечный отступ совпадает.',
                  )
                : text(
                    'Far-end clearance mismatch: pitch has been preserved.',
                    'Кінцевий відступ не збігається: крок збережено.',
                    'Конечный отступ не совпадает: шаг сохранён.',
                  ),
            ],
      metrics: [
        {
          id: 'N',
          label: text('Full segments', 'Повних відрізків', 'Полных отрезков'),
          value: r.count,
          unit: 'count',
        },
        {
          id: 'L',
          label: text(
            'Total welded length',
            'Загальна довжина шва',
            'Общая длина шва',
          ),
          value: r.totalWeldMm,
          unit: 'mm',
        },
        {
          id: 'E',
          label: text(
            'Far-end clearance',
            'Кінцевий відступ',
            'Конечный отступ',
          ),
          value: r.endClearanceMm,
          unit: 'mm',
        },
      ],
      tables: [
        {
          title: text(
            'Marks from datum',
            'Відмітки від бази',
            'Отметки от базы',
          ),
          columns: [
            { label: text('Segment', 'Відрізок', 'Отрезок') },
            { label: text('Start', 'Початок', 'Начало'), unit: 'mm' },
            { label: text('End', 'Кінець', 'Конец'), unit: 'mm' },
          ],
          rows: r.segments.map((s) => [s.id, s.startMm, s.endMm]),
        },
      ],
    };
  },
};
