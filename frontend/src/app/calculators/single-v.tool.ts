import { field, text, type CalculatorTool } from '../calculator-tool';
import { calculateSingleV } from './single-v';
export const singleVTool: CalculatorTool = {
  id: 'single-v',
  ticket: 'G22',
  title: text(
    'Single-V bevel preparation',
    'Підготовка V-подібного стику',
    'Подготовка V-образного стыка',
  ),
  description: text(
    'Symmetric joint from the drawing: t thickness, f root face, g root opening, s setback on each plate, α half-angle. Blue dash-dot lines are the original square-edge references. These are layout dimensions for the supplied joint.',
    'Симетричний стик за кресленням: t товщина, f притуплення, g кореневий зазор, s відступ на кожній плиті, α півкута. Синій штрихпунктир — бази початкових прямих країв. Це розміри розмітки заданого стику.',
    'Симметричный стык по чертежу: t толщина, f притупление, g корневой зазор, s отступ на каждой плите, α половина угла. Синий штрихпунктир — базы исходных прямых краёв. Это размеры разметки заданного стыка.',
  ),
  fields: [
    field(
      'thickness',
      't',
      text('Plate thickness', 'Товщина плити', 'Толщина плиты'),
      12,
    ),
    field('face', 'f', text('Root face', 'Притуплення', 'Притупление'), 2),
    field(
      'opening',
      'g',
      text('Root opening', 'Кореневий зазор', 'Корневой зазор'),
      2,
    ),
    field(
      'angle',
      'θ',
      text(
        'Included groove angle',
        'Повний кут розкриття',
        'Полный угол раскрытия',
      ),
      60,
      'degree',
    ),
  ],
  calculate({ thickness, face, opening, angle }) {
    const r = calculateSingleV(thickness, face, opening, angle);
    return {
      drawing: r.drawing,
      metrics: [
        {
          id: 't',
          label: text('Thickness', 'Товщина', 'Толщина'),
          value: thickness,
          unit: 'mm',
        },
        {
          id: 'f',
          label: text('Root face', 'Притуплення', 'Притупление'),
          value: face,
          unit: 'mm',
        },
        {
          id: 'g',
          label: text('Root opening', 'Кореневий зазор', 'Корневой зазор'),
          value: opening,
          unit: 'mm',
        },
        {
          id: 'h',
          label: text('Bevel depth', 'Глибина скосу', 'Глубина скоса'),
          value: r.depthMm,
          unit: 'mm',
        },
        {
          id: 's',
          label: text(
            'Setback per plate',
            'Відступ на плиту',
            'Отступ на плиту',
          ),
          value: r.setbackMm,
          unit: 'mm',
        },
        {
          id: 'M',
          label: text(
            'Groove mouth width',
            'Ширина розкриття',
            'Ширина раскрытия',
          ),
          value: r.mouthMm,
          unit: 'mm',
        },
        {
          id: 'α',
          label: text(
            'Half-angle on each plate',
            'Півкута на кожній плиті',
            'Половина угла на каждой плите',
          ),
          value: r.halfDegrees,
          unit: 'degree',
        },
      ],
    };
  },
};
