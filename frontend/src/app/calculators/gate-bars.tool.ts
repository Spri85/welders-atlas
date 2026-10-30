import { field, text, type CalculatorTool } from '../calculator-tool';
import { calculateGateBars } from './gate-bars';
export const gateBarsTool: CalculatorTool = {
  id: 'gate-bars',
  ticket: 'G7',
  title: text(
    'Equal gate bar spacing',
    'Рівні проміжки між прутами',
    'Равные промежутки между прутьями',
  ),
  description: text(
    'Equal end and intermediate gaps. All marks start at the left inside edge. Bar height is schematic.',
    'Рівні крайні та проміжні зазори. Всі відмітки від лівого внутрішнього краю. Висота прутів умовна.',
    'Равные крайние и промежуточные зазоры. Все отметки от левого внутреннего края. Высота прутьев условная.',
  ),
  fields: [
    field(
      'opening',
      text('Clear opening', 'Чистий отвір', 'Чистый проём'),
      1000,
    ),
    field('bar', text('Bar width', 'Ширина прута', 'Ширина прута'), 20),
    field(
      'count',
      text('Bar count', 'Кількість прутів', 'Количество прутьев'),
      5,
      'count',
    ),
  ],
  calculate({ opening, bar, count }) {
    const r = calculateGateBars(opening, bar, count);
    return {
      drawing: r.drawing,
      metrics: [
        {
          id: 'g',
          label: text('Equal gap', 'Рівний зазор', 'Равный зазор'),
          value: r.gapMm,
          unit: 'mm',
        },
      ],
      tables: [
        {
          title: text(
            'Marks from left inside edge',
            'Відмітки від лівого внутрішнього краю',
            'Отметки от левого внутреннего края',
          ),
          columns: [
            { label: text('Bar', 'Прут', 'Прут') },
            {
              label: text('Near edge', 'Ближній край', 'Ближний край'),
              unit: 'mm',
            },
            { label: text('Center', 'Центр', 'Центр'), unit: 'mm' },
          ],
          rows: r.bars.map((b) => [b.id, b.nearMm, b.centerMm]),
        },
      ],
    };
  },
};
