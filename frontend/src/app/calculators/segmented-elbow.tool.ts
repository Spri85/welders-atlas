import { field, text, type CalculatorTool } from '../calculator-tool';
import { calculateSegmentedElbow } from './segmented-elbow';
const square = text('Square', 'Прямий', 'Прямой');
const miter = text(
  'Miter; long side at 180°',
  'Косий; довга сторона на 180°',
  'Косой; длинная сторона на 180°',
);
export const segmentedElbowTool: CalculatorTool = {
  id: 'segmented-elbow',
  ticket: 'G13',
  printable: true,
  title: text(
    'Segmented round elbow',
    'Сегментний круглий відвід',
    'Сегментный круглый отвод',
  ),
  description: text(
    'Throat radius R is inside the elbow. Ends have one cut; middle pieces have opposing cuts. I = inside/0°, O = outside/180°, S = seam at 0°/360°. Align equal-angle stations at each joint; keep every seam on the throat. Numbered wraps run from the incoming end to the outgoing end. Zero allowances.',
    'Радіус горловини R всередині відводу. Кінці мають один косий різ, середні деталі — протилежні різи. I = внутрішня сторона/0°, O = зовнішня/180°, S = шов 0°/360°. Суміщуйте однакові кутові відмітки стиків; всі шви на горловині. Нумерація від входу до виходу. Без припусків.',
    'Радиус горловины R внутри отвода. Концы имеют один косой рез, средние детали — противоположные резы. I = внутренняя сторона/0°, O = наружная/180°, S = шов 0°/360°. Совмещайте одинаковые угловые отметки стыков; все швы на горловине. Нумерация от входа к выходу. Без припусков.',
  ),
  fields: [
    field(
      'diameter',
      text('Pipe OD', 'Зовнішній діаметр', 'Наружный диаметр'),
      60,
    ),
    field(
      'radius',
      text('Throat radius', 'Радіус горловини', 'Радиус горловины'),
      90,
    ),
    field(
      'turn',
      text(
        'Total turn (0,180]',
        'Загальний поворот (0,180]',
        'Общий поворот (0,180]',
      ),
      90,
      'degree',
    ),
    field(
      'count',
      text(
        'Piece count [3,100]',
        'Кількість деталей [3,100]',
        'Количество деталей [3,100]',
      ),
      4,
      'count',
    ),
  ],
  calculate({ diameter, radius, turn, count }) {
    const r = calculateSegmentedElbow(diameter, radius, turn, count);
    return {
      drawing: r.pieces[1].drawing,
      model: r.model,
      metrics: [
        {
          id: 'R',
          label: text('Throat radius', 'Радіус горловини', 'Радиус горловины'),
          value: radius,
          unit: 'mm',
        },
        {
          id: 'δ',
          label: text('Joint turn', 'Поворот стику', 'Поворот стыка'),
          value: r.jointDegrees,
          unit: 'degree',
        },
        {
          id: 'α',
          label: text(
            'Each mating cut off square',
            'Кожен косий різ від прямого',
            'Каждый косой рез от прямого',
          ),
          value: r.offSquareDegrees,
          unit: 'degree',
        },
        {
          id: 'I',
          label: text(
            'Middle-piece inside length',
            'Внутрішня довжина середньої деталі',
            'Внутренняя длина средней детали',
          ),
          value: r.pieces[1].insideMm,
          unit: 'mm',
        },
        {
          id: 'O',
          label: text(
            'Middle-piece outside length',
            'Зовнішня довжина середньої деталі',
            'Наружная длина средней детали',
          ),
          value: r.pieces[1].outsideMm,
          unit: 'mm',
        },
      ],
      tables: [
        {
          title: text(
            'Numbered piece cuts',
            'Різи нумерованих деталей',
            'Резы пронумерованных деталей',
          ),
          columns: [
            { label: text('Piece', 'Деталь', 'Деталь') },
            { label: text('Inside I', 'Всередині I', 'Внутри I'), unit: 'mm' },
            { label: text('Outside O', 'Зовні O', 'Снаружи O'), unit: 'mm' },
            { label: text('Incoming cut', 'Вхідний різ', 'Входной рез') },
            { label: text('Outgoing cut', 'Вихідний різ', 'Выходной рез') },
          ],
          rows: r.pieces.map((p) => [
            p.number,
            p.insideMm,
            p.outsideMm,
            p.startCut === 'square' ? square : miter,
            p.endCut === 'square' ? square : miter,
          ]),
        },
        {
          title: text(
            'One-gore station lengths (middle pieces ×2)',
            'Довжини півдеталі за відмітками (середні ×2)',
            'Длины полудетали по отметкам (средние ×2)',
          ),
          columns: [
            { label: text('Station', 'Відмітка', 'Отметка'), unit: 'degree' },
            {
              label: text(
                'Distance from seam',
                'Відстань від шва',
                'Расстояние от шва',
              ),
              unit: 'mm',
            },
            {
              label: text(
                'Gore length',
                'Довжина півдеталі',
                'Длина полудетали',
              ),
              unit: 'mm',
            },
          ],
          rows: r.stations.map((s) => [
            s.angleDegrees,
            s.distanceMm,
            s.goreLengthMm,
          ]),
        },
      ],
      templates: r.pieces.map((p) => ({
        title: text(
          `Piece ${p.number} · I inside, O outside, S seam`,
          `Деталь ${p.number} · I всередині, O зовні, S шов`,
          `Деталь ${p.number} · I внутри, O снаружи, S шов`,
        ),
        drawing: p.drawing,
      })),
    };
  },
};
