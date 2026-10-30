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
    'Centered parallel square openings with matching edge directions. Dimensions are at the sheet layout surface. A/B are the panel bases, L the face height, C each corner seam. Blue dash-dot line is the center guide. Zero allowance for thickness, kerf or seams.',
    'Співвісні паралельні квадратні отвори з однаковим напрямком ребер. Розміри на поверхні розгортки листа. A/B — основи панелі, L — висота грані, C — кожен кутовий шов. Синій штрихпунктир — осьова напрямна. Без припусків на товщину, різ чи шви.',
    'Соосные параллельные квадратные отверстия с одинаковым направлением рёбер. Размеры на поверхности развёртки листа. A/B — основания панели, L — высота грани, C — каждый угловой шов. Синий штрихпунктир — осевая направляющая. Без припусков на толщину, рез или швы.',
  ),
  fields: [
    field(
      'inlet',
      text(
        'Inlet square side A',
        'Сторона вхідного квадрата A',
        'Сторона входного квадрата A',
      ),
      300,
    ),
    field(
      'outlet',
      text(
        'Outlet square side B',
        'Сторона вихідного квадрата B',
        'Сторона выходного квадрата B',
      ),
      180,
    ),
    field(
      'height',
      text(
        'Perpendicular axial height',
        'Перпендикулярна осьова висота',
        'Перпендикулярная осевая высота',
      ),
      80,
    ),
  ],
  calculate({ inlet, outlet, height }) {
    const r = calculateSquareTransition(inlet, outlet, height);
    return {
      drawing: r.drawing,
      model: r.model,
      notes: [cut4],
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
            'Panel face height',
            'Висота грані панелі',
            'Высота грани панели',
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
