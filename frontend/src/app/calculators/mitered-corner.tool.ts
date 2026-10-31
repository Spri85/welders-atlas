import { field, text, type CalculatorTool } from '../calculator-tool';
import { modelDimension } from '../pattern-geometry';
import { calculateMiteredCorner } from './mitered-corner';

export const miteredCornerTool: CalculatorTool = {
  id: 'mitered-corner',
  ticket: 'G4',
  printable: true,
  title: text('Mitered pipe corner', 'Косий стик труб', 'Косой стык труб'),
  description: text(
    'Two equal pipes. Enter the turn from straight, between 0° and 180°. Each cut is measured off square.',
    'Дві однакові труби. Введіть поворот від прямої в межах 0°–180°. Кожен різ відраховується від перпендикуляра.',
    'Две одинаковые трубы. Введите поворот от прямой в пределах 0°–180°. Каждый рез отсчитывается от перпендикуляра.',
  ),
  fields: [
    field(
      'diameter',
      'D',
      text('Outside diameter', 'Зовнішній діаметр', 'Наружный диаметр'),
      60,
    ),
    field(
      'turn',
      'θ',
      text('Turn from straight', 'Поворот від прямої', 'Поворот от прямой'),
      60,
      'degree',
    ),
  ],
  calculate({ diameter, turn }) {
    const result = calculateMiteredCorner({
      diameterMm: diameter,
      turnDegrees: turn,
    });
    return {
      drawing: result.drawing,
      model: [
        ...result.assembly.map((points) => ({ points })),
        modelDimension(result.assembly[0][0], result.assembly[0][36], 'D'),
        {
          points: Array.from({ length: 25 }, (_, i) => {
            const angle = (((turn * Math.PI) / 180) * i) / 24;
            return {
              x: diameter * Math.cos(angle),
              y: diameter * Math.sin(angle),
              z: 0,
            };
          }),
          label: 'θ',
          construction: true,
        },
      ],
      metrics: [
        { id: 'D', label: this.fields[0].label, value: diameter, unit: 'mm' },
        {
          id: 'α',
          label: text(
            'Cut off square',
            'Кут різу від перпендикуляра',
            'Угол реза от перпендикуляра',
          ),
          value: result.offSquareDegrees,
          unit: 'degree',
        },
        {
          id: 'h',
          label: text(
            'Long-to-short rise',
            'Перепад довгої та короткої точок',
            'Перепад длинной и короткой точек',
          ),
          value: result.riseMm,
          unit: 'mm',
        },
        {
          id: 'W',
          label: text('Wrap width', 'Довжина обгортки', 'Длина обёртки'),
          value: result.wrapWidthMm,
          unit: 'mm',
        },
      ],
      notes: [
        text(
          'Q is the square reference through the short point. Mark both pieces with this reusable wrap. Join the long and short points as shown in the assembly.',
          'Q — перпендикулярний орієнтир через коротку точку. Позначте обидві деталі цією обгорткою. Сумістіть довгі й короткі точки, як на збірці.',
          'Q — перпендикулярный ориентир через короткую точку. Разметьте обе детали этой обёрткой. Совместите длинные и короткие точки, как на сборке.',
        ),
      ],
      tables: [
        {
          title: text(
            'Marks from the short point',
            'Позначки від короткої точки',
            'Отметки от короткой точки',
          ),
          columns: [
            { label: text('Angle', 'Кут', 'Угол'), unit: 'degree' },
            {
              label: text('Around pipe', 'Навколо труби', 'Вокруг трубы'),
              unit: 'mm',
            },
            {
              label: text('Axial rise', 'Осьовий підйом', 'Осевой подъём'),
              unit: 'mm',
            },
          ],
          rows: result.stations.map((station) => [
            station.angleDegrees,
            station.distanceMm,
            station.riseMm,
          ]),
        },
      ],
      templates: [
        {
          title: text(
            'G4 reusable miter wrap — mark 2 pieces',
            'G4 обгортка косого різу — позначте 2 деталі',
            'G4 обёртка косого реза — разметьте 2 детали',
          ),
          drawing: result.drawing,
        },
      ],
    };
  },
};
