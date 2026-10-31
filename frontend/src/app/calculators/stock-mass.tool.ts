import {
  field,
  optional,
  text,
  type CalculatorMetric,
  type CalculatorTool,
} from '../calculator-tool';
import { calculateStockMass } from './stock-mass';
export const stockMassTool: CalculatorTool = {
  id: 'stock-mass',
  ticket: 'G19',
  title: text(
    'Stock mass and material cost',
    'Маса прокату та вартість матеріалу',
    'Масса проката и стоимость материала',
  ),
  description: text(
    'Use editable material density for plate, or the supplier’s catalog kg/m for sections. Price is in your currency per kg. The diagram is a plate plan or a section length datum.',
    'Використовуйте змінну густину матеріалу для листа або каталожну масу кг/м постачальника для профілів. Ціна за кг у вашій валюті. Схема — план листа або база довжини профілю.',
    'Используйте изменяемую плотность материала для листа или каталожную массу кг/м поставщика для профилей. Цена за кг в вашей валюте. Схема — план листа или база длины профиля.',
  ),
  fields: [
    field('length', 'L', text('Length', 'Довжина', 'Длина'), 1000),
    field(
      'mode',
      'J',
      text('Stock type', 'Тип прокату', 'Тип проката'),
      0,
      'ratio',
      {
        choices: [
          { value: 0, label: text('Plate', 'Лист', 'Лист') },
          {
            value: 1,
            label: text(
              'Catalog section',
              'Каталожний профіль',
              'Каталожный профиль',
            ),
          },
        ],
      },
    ),
    field(
      'width',
      'W',
      text('Plate width', 'Ширина листа', 'Ширина листа'),
      500,
      'mm',
      { when: (v) => v['mode'] === 0 },
    ),
    field(
      'thickness',
      't',
      text('Plate thickness', 'Товщина листа', 'Толщина листа'),
      6,
      'mm',
      { when: (v) => v['mode'] === 0 },
    ),
    field(
      'density',
      'ρ',
      text('Material density', 'Густина матеріалу', 'Плотность материала'),
      7850,
      'kg/m³',
      { when: (v) => v['mode'] === 0 },
    ),
    field(
      'massPerMetre',
      'μ',
      text(
        'Catalog mass per metre',
        'Каталожна маса на метр',
        'Каталожная масса на метр',
      ),
      5,
      'kg/m',
      { when: (v) => v['mode'] === 1 },
    ),
    field(
      'quantity',
      'n',
      text('Quantity', 'Кількість', 'Количество'),
      4,
      'count',
    ),
    field(
      'price',
      'p',
      text('Price per kg', 'Ціна за кг', 'Цена за кг'),
      2,
      'money',
      { optional: true },
    ),
  ],
  calculate({
    length,
    mode,
    width,
    thickness,
    density,
    massPerMetre,
    quantity,
    price,
  }) {
    const r = calculateStockMass({
      ...(mode === 0
        ? {
            mode: 'plate' as const,
            lengthMm: length,
            widthMm: width,
            thicknessMm: thickness,
            densityKgPerM3: density,
          }
        : {
            mode: 'section' as const,
            lengthMm: length,
            kgPerMetre: massPerMetre,
          }),
      quantity,
      pricePerKg: optional(price),
    });
    const metrics: CalculatorMetric[] = [
      {
        id: 'L',
        label: text('Length', 'Довжина', 'Длина'),
        value: length,
        unit: 'mm',
      },
      {
        id: 'm',
        label: text('Mass per item', 'Маса деталі', 'Масса детали'),
        value: r.eachKg,
        unit: 'kg',
      },
      {
        id: 'M',
        label: text('Batch mass', 'Маса партії', 'Масса партии'),
        value: r.totalKg,
        unit: 'kg',
      },
    ];
    if (mode === 0)
      metrics.push(
        {
          id: 't',
          label: text('Plate thickness', 'Товщина листа', 'Толщина листа'),
          value: thickness,
          unit: 'mm',
        },
        {
          id: 'W',
          label: text('Plate width', 'Ширина листа', 'Ширина листа'),
          value: width,
          unit: 'mm',
        },
      );
    if (r.cost !== undefined)
      metrics.push({
        id: 'C',
        label: text(
          'Batch material cost',
          'Вартість матеріалу партії',
          'Стоимость материала партии',
        ),
        value: r.cost,
        unit: 'money',
      });
    return {
      drawing: r.drawing,
      diagrams: r.sectionDrawing
        ? [
            {
              title: text('Plate section', 'Переріз листа', 'Сечение листа'),
              drawing: r.sectionDrawing,
            },
          ]
        : [],
      metrics,
    };
  },
};
