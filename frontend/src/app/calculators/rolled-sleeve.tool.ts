import { field, text, type CalculatorTool } from '../calculator-tool';
import { calculateRolledSleeve } from './rolled-sleeve';
export const rolledSleeveTool: CalculatorTool = {
  id: 'rolled-sleeve',
  ticket: 'G14',
  title: text(
    'Rolled sleeve or ring blank',
    'Заготовка вальцьованої обичайки',
    'Заготовка вальцованной обечайки',
  ),
  description: text(
    'Neutral-axis fraction k is measured from the inner surface (0–1). Mid-thickness k=0.5 is an editable assumption for gentle rolls. Enter a total trim/seam allowance; it is added once.',
    'Частка нейтральної осі k від внутрішньої поверхні (0–1). Середина товщини k=0,5 — змінне припущення для пологого вальцювання. Введіть загальний припуск на торцювання/шов; його додають один раз.',
    'Доля нейтральной оси k от внутренней поверхности (0–1). Середина толщины k=0,5 — изменяемое допущение для пологой вальцовки. Введите общий припуск на торцовку/шов; он добавляется один раз.',
  ),
  fields: [
    field(
      'diameter',
      text('Finished diameter', 'Готовий діаметр', 'Готовый диаметр'),
      200,
    ),
    field(
      'outside',
      text('Diameter reference', 'База діаметра', 'База диаметра'),
      1,
      'ratio',
      {
        choices: [
          {
            value: 1,
            label: text(
              'Outside diameter',
              'Зовнішній діаметр',
              'Наружный диаметр',
            ),
          },
          {
            value: 0,
            label: text(
              'Inside diameter',
              'Внутрішній діаметр',
              'Внутренний диаметр',
            ),
          },
        ],
      },
    ),
    field('thickness', text('Thickness', 'Товщина', 'Толщина'), 2),
    field('width', text('Axial width', 'Осьова ширина', 'Осевая ширина'), 100),
    field(
      'k',
      text(
        'Neutral-axis fraction',
        'Частка нейтральної осі',
        'Доля нейтральной оси',
      ),
      0.5,
      'ratio',
    ),
    field(
      'allowance',
      text(
        'Total additional allowance',
        'Загальний додатковий припуск',
        'Общий дополнительный припуск',
      ),
      0,
    ),
  ],
  calculate({ diameter, outside, thickness, width, k, allowance }) {
    const r = calculateRolledSleeve(
      diameter,
      outside === 1,
      thickness,
      width,
      k,
      allowance,
    );
    return {
      drawing: r.drawing,
      diagrams: [
        {
          title: text('Finished section', 'Готовий переріз', 'Готовое сечение'),
          drawing: r.sectionDrawing,
        },
      ],
      metrics: [
        {
          id: 'ID',
          label: text(
            'Inside diameter',
            'Внутрішній діаметр',
            'Внутренний диаметр',
          ),
          value: r.insideMm,
          unit: 'mm',
        },
        {
          id: 't',
          label: text('Thickness', 'Товщина', 'Толщина'),
          value: thickness,
          unit: 'mm',
        },
        {
          id: 'N',
          label: text(
            'Neutral diameter',
            'Нейтральний діаметр',
            'Нейтральный диаметр',
          ),
          value: r.neutralMm,
          unit: 'mm',
        },
        {
          id: 'L0',
          label: text(
            'Zero-allowance length',
            'Довжина без припуску',
            'Длина без припуска',
          ),
          value: r.zeroLengthMm,
          unit: 'mm',
        },
        {
          id: 'A',
          label: text(
            'Additional allowance',
            'Додатковий припуск',
            'Дополнительный припуск',
          ),
          value: allowance,
          unit: 'mm',
        },
        {
          id: 'L',
          label: text('Cut length', 'Довжина різу', 'Длина реза'),
          value: r.cutLengthMm,
          unit: 'mm',
        },
        {
          id: 'W',
          label: text('Axial width', 'Осьова ширина', 'Осевая ширина'),
          value: width,
          unit: 'mm',
        },
      ],
    };
  },
};
