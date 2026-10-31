import { field, text, type CalculatorTool } from '../calculator-tool';
import { calculateSquareTransition } from './square-transition';
import { drawingCoordinates } from '../pattern-measurements';
const cut4 = text(
  'Cut 4 identical panels',
  'Вирізати 4 однакові панелі',
  'Вырезать 4 одинаковые панели',
);
export const squareTransitionTool: CalculatorTool = {
  id: 'square-transition',
  ticket: 'G25',
  printable: true,
  title: text(
    'Square-to-square transition',
    'Перехід із квадрата на квадрат',
    'Переход с квадрата на квадрат',
  ),
  description: text(
    'Centered square openings with parallel edges. Enter dimensions at the sheet layout surface. No allowances for thickness, kerf or seams.',
    'Співвісні квадратні отвори з паралельними ребрами. Введіть розміри на поверхні розгортки листа. Без припусків на товщину, різ чи шви.',
    'Соосные квадратные отверстия с параллельными рёбрами. Введите размеры на поверхности развёртки листа. Без припусков на толщину, рез или швы.',
  ),
  fields: [
    field(
      'inlet',
      'A',
      text(
        'Inlet square side',
        'Сторона вхідного квадрата',
        'Сторона входного квадрата',
      ),
      300,
    ),
    field(
      'outlet',
      'B',
      text(
        'Outlet square side',
        'Сторона вихідного квадрата',
        'Сторона выходного квадрата',
      ),
      180,
    ),
    field(
      'height',
      'H',
      text(
        'Assembled height between openings',
        'Висота між отворами зібраної деталі',
        'Высота между отверстиями собранной детали',
      ),
      80,
    ),
  ],
  calculate({ inlet, outlet, height }) {
    const r = calculateSquareTransition(inlet, outlet, height);
    return {
      drawing: r.drawing,
      model: r.model,
      diagrams: [
        {
          title: text(
            'Side view · assembled H and sloping L',
            'Вигляд збоку · висота H та похила L',
            'Вид сбоку · высота H и наклонная L',
          ),
          drawing: r.sideDrawing,
        },
      ],
      notes: [
        cut4,
        text(
          'H is the straight height between openings. L is the sloping panel length used for the flat blank: L² = H² + d².',
          'H — пряма висота між отворами. L — похила довжина панелі для розгортки: L² = H² + d².',
          'H — прямая высота между отверстиями. L — наклонная длина панели для развёртки: L² = H² + d².',
        ),
      ],
      metrics: [
        {
          id: 'A',
          label: text('Base A', 'Основа A', 'Основание A'),
          value: inlet,
          unit: 'mm',
        },
        {
          id: 'B',
          label: text('Base B', 'Основа B', 'Основание B'),
          value: outlet,
          unit: 'mm',
        },
        {
          id: 'H',
          label: text(
            'Assembled height between openings',
            'Висота між отворами зібраної деталі',
            'Высота между отверстиями собранной детали',
          ),
          value: height,
          unit: 'mm',
        },
        {
          id: 'd',
          label: text(
            'Inset per side',
            'Відступ на сторону',
            'Отступ на сторону',
          ),
          value: r.insetMm,
          unit: 'mm',
        },
        {
          id: 'L',
          label: text(
            'Sloping panel length (flat blank height)',
            'Похила довжина панелі (висота розгортки)',
            'Наклонная длина панели (высота развёртки)',
          ),
          value: r.faceHeightMm,
          unit: 'mm',
        },
        {
          id: 'C',
          label: text(
            'Each corner seam',
            'Кожен кутовий шов',
            'Каждый угловой шов',
          ),
          value: r.seamMm,
          unit: 'mm',
        },
      ],
      tables: [
        {
          title: text(
            'Panel coordinates from lower-left bounds',
            'Координати панелі від лівого нижнього кута габаритів',
            'Координаты панели от левого нижнего угла габаритов',
          ),
          columns: [
            { label: text('Point', 'Точка', 'Точка') },
            { label: text('X', 'X', 'X'), unit: 'mm' },
            { label: text('Y', 'Y', 'Y'), unit: 'mm' },
          ],
          rows: drawingCoordinates(r.drawing).map((p) => [p.id, p.x, p.y]),
        },
      ],
      templates: [{ title: cut4, drawing: r.drawing }],
    };
  },
};
