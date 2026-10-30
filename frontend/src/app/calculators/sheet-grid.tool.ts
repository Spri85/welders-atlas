import { field, text, type CalculatorTool } from '../calculator-tool';
import { calculateSheetGrid } from './sheet-grid';
export const sheetGridTool: CalculatorTool = {
  id: 'sheet-grid',
  ticket: 'G17',
  title: text(
    'Rectangular blanks per sheet',
    'Прямокутні заготовки з листа',
    'Прямоугольные заготовки из листа',
  ),
  description: text(
    'Uniform rectangular grids only; compares entered and 90° orientations. Ties keep the entered orientation. Spacing is the total separation between blanks, including any kerf. No trailing spacing is charged. Limit 10,000 blanks.',
    'Лише однорідні прямокутні сітки; порівнюються задана та повернута на 90° орієнтації. При рівності зберігається задана. Крок між заготовками включає ширину різу. Після останньої заготовки проміжок не додають. Ліміт 10 000 заготовок.',
    'Только однородные прямоугольные сетки; сравниваются заданная и повёрнутая на 90° ориентации. При равенстве сохраняется заданная. Промежуток между заготовками включает ширину реза. После последней заготовки промежуток не добавляется. Предел 10 000 заготовок.',
  ),
  fields: [
    field('sheetW', text('Sheet width', 'Ширина листа', 'Ширина листа'), 1000),
    field('sheetH', text('Sheet height', 'Висота листа', 'Высота листа'), 600),
    field(
      'partW',
      text('Blank width', 'Ширина заготовки', 'Ширина заготовки'),
      240,
    ),
    field(
      'partH',
      text('Blank height', 'Висота заготовки', 'Высота заготовки'),
      140,
    ),
    field(
      'margin',
      text(
        'Margin at every edge',
        'Відступ від кожного краю',
        'Отступ от каждого края',
      ),
      10,
    ),
    field(
      'spacing',
      text(
        'Total blank spacing',
        'Повний проміжок між заготовками',
        'Полный промежуток между заготовками',
      ),
      5,
    ),
    field(
      'rotate',
      text(
        'Allow 90° rotation',
        'Дозволити поворот 90°',
        'Разрешить поворот 90°',
      ),
      1,
      'ratio',
      {
        choices: [
          { value: 1, label: text('Yes', 'Так', 'Да') },
          { value: 0, label: text('No', 'Ні', 'Нет') },
        ],
      },
    ),
  ],
  calculate({ sheetW, sheetH, partW, partH, margin, spacing, rotate }) {
    const r = calculateSheetGrid(
      sheetW,
      sheetH,
      partW,
      partH,
      margin,
      spacing,
      rotate === 1,
    );
    return {
      drawing: r.drawing,
      notes: [
        r.rotated
          ? text(
              'Selected: rotated 90°.',
              'Обрано: поворот 90°.',
              'Выбрано: поворот 90°.',
            )
          : text(
              'Selected: entered orientation.',
              'Обрано: задана орієнтація.',
              'Выбрано: заданная ориентация.',
            ),
      ],
      metrics: [
        {
          id: 'W',
          label: text('Sheet width', 'Ширина листа', 'Ширина листа'),
          value: sheetW,
          unit: 'mm',
        },
        {
          id: 'H',
          label: text('Sheet height', 'Висота листа', 'Высота листа'),
          value: sheetH,
          unit: 'mm',
        },
        {
          id: 'N',
          label: text(
            'Blanks per sheet',
            'Заготовок з листа',
            'Заготовок из листа',
          ),
          value: r.count,
          unit: 'count',
        },
        {
          id: 'C',
          label: text('Columns', 'Стовпців', 'Столбцов'),
          value: r.columns,
          unit: 'count',
        },
        {
          id: 'R',
          label: text('Rows', 'Рядів', 'Рядов'),
          value: r.rows,
          unit: 'count',
        },
        {
          id: 'X',
          label: text(
            'Unused width inside margins',
            'Невикористана ширина в межах відступів',
            'Неиспользованная ширина в пределах отступов',
          ),
          value: r.remainderWidthMm,
          unit: 'mm',
        },
        {
          id: 'Y',
          label: text(
            'Unused height inside margins',
            'Невикористана висота в межах відступів',
            'Неиспользованная высота в пределах отступов',
          ),
          value: r.remainderHeightMm,
          unit: 'mm',
        },
      ],
    };
  },
};
