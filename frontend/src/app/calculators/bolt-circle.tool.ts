import { field, text, type CalculatorTool } from '../calculator-tool';
import { calculateBoltCircle } from './bolt-circle';
export const boltCircleTool: CalculatorTool = {
  id: 'bolt-circle',
  ticket: 'G9',
  printable: true,
  title: text(
    'Bolt-circle drilling template',
    'Шаблон отворів на колі',
    'Шаблон отверстий на окружности',
  ),
  description: text(
    'Origin O at the circle center, +X right, +Y up; angles counterclockwise from +X. Solid circles are hole edges; dash-dot lines are center datums. Zero allowances.',
    'Початок O у центрі кола, +X праворуч, +Y вгору; кути проти годинникової стрілки від +X. Суцільні кола — краї отворів; штрихпунктир — осі центрів. Без припусків.',
    'Начало O в центре окружности, +X вправо, +Y вверх; углы против часовой стрелки от +X. Сплошные окружности — края отверстий; штрихпунктир — оси центров. Без припусков.',
  ),
  fields: [
    field(
      'pitch',
      'P',
      text(
        'Bolt-circle diameter',
        'Діаметр кола центрів',
        'Диаметр окружности центров',
      ),
      100,
    ),
    field(
      'hole',
      'd',
      text('Hole diameter', 'Діаметр отвору', 'Диаметр отверстия'),
      10,
    ),
    field(
      'count',
      'n',
      text('Hole count', 'Кількість отворів', 'Количество отверстий'),
      4,
      'count',
    ),
    field(
      'angle',
      'θ₀',
      text('First-hole angle', 'Кут першого отвору', 'Угол первого отверстия'),
      0,
      'degree',
    ),
  ],
  calculate({ pitch, hole, count, angle }) {
    const r = calculateBoltCircle(pitch, hole, count, angle);
    return {
      drawing: r.drawing,
      metrics: [
        {
          id: 'α',
          label: text('Angular spacing', 'Кутовий крок', 'Угловой шаг'),
          value: r.spacingDegrees,
          unit: 'degree',
        },
        {
          id: 'C',
          label: text(
            'Adjacent center chord',
            'Хорда сусідніх центрів',
            'Хорда соседних центров',
          ),
          value: r.chordMm,
          unit: 'mm',
        },
      ],
      tables: [
        {
          title: text(
            'Hole centers from O',
            'Центри отворів від O',
            'Центры отверстий от O',
          ),
          columns: [
            { label: text('Hole', 'Отвір', 'Отверстие') },
            { label: text('X', 'X', 'X'), unit: 'mm' },
            { label: text('Y', 'Y', 'Y'), unit: 'mm' },
          ],
          rows: r.holes.map((h) => [h.id, h.point.x, h.point.y]),
        },
      ],
      templates: [{ title: this.title, drawing: r.drawing }],
    };
  },
};
