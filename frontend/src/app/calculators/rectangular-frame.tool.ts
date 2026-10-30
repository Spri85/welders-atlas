import {
  field,
  optional,
  text,
  type CalculatorMetric,
  type CalculatorTool,
} from '../calculator-tool';
import { calculateRectangularFrame } from './rectangular-frame';

export const rectangularFrameTool: CalculatorTool = {
  id: 'rectangular-frame',
  ticket: 'G6',
  title: text('Rectangular frame', 'Прямокутна рама', 'Прямоугольная рама'),
  description: text(
    'Outside dimensions of a square-tube frame. Butt joints use full-width rails and uprights between them. Clearance applies at each butt interface.',
    'Зовнішні розміри рами з квадратної труби. Стики впритул мають поперечини повної ширини та стійки між ними. Зазор застосовується до кожного торця стійки.',
    'Наружные размеры рамы из квадратной трубы. Стыки впритык имеют поперечины полной ширины и стойки между ними. Зазор применяется к каждому торцу стойки.',
  ),
  fields: [
    field(
      'width',
      text('Outside width', 'Зовнішня ширина', 'Наружная ширина'),
      800,
    ),
    field(
      'height',
      text('Outside height', 'Зовнішня висота', 'Наружная высота'),
      600,
    ),
    field('tube', text('Tube width', 'Ширина труби', 'Ширина трубы'), 30),
    field(
      'corner',
      text('Corner type', 'Тип кутового стику', 'Тип углового стыка'),
      0,
      'ratio',
      {
        choices: [
          { value: 0, label: text('Butt', 'Впритул', 'Впритык') },
          {
            value: 1,
            label: text(
              'Flush 45° miter',
              'Косий 45° врівень',
              'Косой 45° заподлицо',
            ),
          },
        ],
      },
    ),
    field(
      'gap',
      text(
        'Clearance at each butt end',
        'Зазор на кожному торці',
        'Зазор на каждом торце',
      ),
      0,
      'mm',
      { when: (values) => values['corner'] === 0 },
    ),
    field(
      'diagonalA',
      text(
        'Measured diagonal A',
        'Виміряна діагональ A',
        'Измеренная диагональ A',
      ),
      NaN,
      'mm',
      { optional: true },
    ),
    field(
      'diagonalB',
      text(
        'Measured diagonal B',
        'Виміряна діагональ B',
        'Измеренная диагональ B',
      ),
      NaN,
      'mm',
      { optional: true },
    ),
  ],
  calculate({ width, height, tube, corner, gap, diagonalA, diagonalB }) {
    const result = calculateRectangularFrame({
      widthMm: width,
      heightMm: height,
      tubeWidthMm: tube,
      corner: corner === 0 ? 'butt' : 'miter',
      gapMm: corner === 0 ? gap : 0,
      measuredDiagonalAMm: optional(diagonalA),
      measuredDiagonalBMm: optional(diagonalB),
    });
    const metrics: CalculatorMetric[] = [
      {
        id: 'R',
        label: text(
          'Rail cut / long point',
          'Різ поперечини / довга точка',
          'Рез поперечины / длинная точка',
        ),
        value: result.cuts[0].longPointMm,
        unit: 'mm',
      },
      {
        id: 'U',
        label: text(
          'Upright cut / long point',
          'Різ стійки / довга точка',
          'Рез стойки / длинная точка',
        ),
        value: result.cuts[1].longPointMm,
        unit: 'mm',
      },
      {
        id: 'D',
        label: text(
          'Target outside diagonal',
          'Цільова зовнішня діагональ',
          'Целевая наружная диагональ',
        ),
        value: result.targetDiagonalMm,
        unit: 'mm',
      },
    ];
    if (result.measuredDifferenceMm !== undefined)
      metrics.push(
        {
          id: 'Δ',
          label: text(
            'Measured diagonal difference',
            'Різниця виміряних діагоналей',
            'Разница измеренных диагоналей',
          ),
          value: result.measuredDifferenceMm,
          unit: 'mm',
        },
        {
          id: 'ΔA',
          label: text(
            'A deviation from target',
            'Відхилення A від цілі',
            'Отклонение A от цели',
          ),
          value: result.deviationAMm!,
          unit: 'mm',
        },
        {
          id: 'ΔB',
          label: text(
            'B deviation from target',
            'Відхилення B від цілі',
            'Отклонение B от цели',
          ),
          value: result.deviationBMm!,
          unit: 'mm',
        },
      );
    return {
      drawing: result.drawing,
      metrics,
      tables: [
        {
          title: text(
            'Member cut list',
            'Перелік різів деталей',
            'Список резов деталей',
          ),
          columns: [
            { label: text('Member', 'Деталь', 'Деталь') },
            {
              label: text('Quantity', 'Кількість', 'Количество'),
              unit: 'count',
            },
            {
              label: text(
                'Cut / long point',
                'Різ / довга точка',
                'Рез / длинная точка',
              ),
              unit: 'mm',
            },
            {
              label: text('Short point', 'Коротка точка', 'Короткая точка'),
              unit: 'mm',
            },
          ],
          rows: result.cuts.map((cut) => [
            cut.id,
            cut.quantity,
            cut.longPointMm,
            cut.shortPointMm,
          ]),
        },
      ],
    };
  },
};
