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
      'W',
      text('Outside width', 'Зовнішня ширина', 'Наружная ширина'),
      800,
    ),
    field(
      'height',
      'H',
      text('Outside height', 'Зовнішня висота', 'Наружная высота'),
      600,
    ),
    field('tube', 't', text('Tube width', 'Ширина труби', 'Ширина трубы'), 30),
    field(
      'corner',
      'J',
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
      'g',
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
      'D₁',
      text(
        'Measured diagonal 1',
        'Виміряна діагональ 1',
        'Измеренная диагональ 1',
      ),
      NaN,
      'mm',
      { optional: true },
    ),
    field(
      'diagonalB',
      'D₂',
      text(
        'Measured diagonal 2',
        'Виміряна діагональ 2',
        'Измеренная диагональ 2',
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
          id: 'ΔD₁',
          label: text(
            'D₁ deviation from target',
            'Відхилення D₁ від цілі',
            'Отклонение D₁ от цели',
          ),
          value: result.deviationAMm!,
          unit: 'mm',
        },
        {
          id: 'ΔD₂',
          label: text(
            'D₂ deviation from target',
            'Відхилення D₂ від цілі',
            'Отклонение D₂ от цели',
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
