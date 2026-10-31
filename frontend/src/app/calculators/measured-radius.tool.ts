import { field, text, type CalculatorTool } from '../calculator-tool';
import { calculateMeasuredRadius } from './measured-radius';
export const measuredRadiusTool: CalculatorTool = {
  id: 'measured-radius',
  ticket: 'G16',
  title: text(
    'Radius from chord and rise',
    'Радіус за хордою та підйомом',
    'Радиус по хорде и подъёму',
  ),
  description: text(
    'Place a straightedge on the circular edge to measure chord c. Measure perpendicular rise h at its midpoint. Minor arcs through a semicircle only (h ≤ c/2). A shallow rise makes the radius sensitive to small measurement errors.',
    'Прикладіть лінійку до кругового краю та виміряйте хорду c. Виміряйте перпендикулярний підйом h посередині. Лише малі дуги до півкола (h ≤ c/2). За малого підйому радіус чутливий до невеликої похибки вимірювання.',
    'Приложите линейку к круговому краю и измерьте хорду c. Измерьте перпендикулярный подъём h посередине. Только малые дуги до полуокружности (h ≤ c/2). При малом подъёме радиус чувствителен к небольшой погрешности измерения.',
  ),
  fields: [
    field(
      'chord',
      'c',
      text('Straight chord', 'Пряма хорда', 'Прямая хорда'),
      600,
    ),
    field(
      'rise',
      'h',
      text('Midpoint rise', 'Підйом посередині', 'Подъём посередине'),
      50,
    ),
  ],
  calculate({ chord, rise }) {
    const r = calculateMeasuredRadius(chord, rise);
    return {
      drawing: r.drawing,
      metrics: [
        {
          id: 'c',
          label: text('Chord', 'Хорда', 'Хорда'),
          value: chord,
          unit: 'mm',
        },
        {
          id: 'h',
          label: text(
            'Midpoint rise',
            'Підйом посередині',
            'Подъём посередине',
          ),
          value: rise,
          unit: 'mm',
        },
        {
          id: 'R',
          label: text('Circular radius', 'Радіус кола', 'Радиус окружности'),
          value: r.radiusMm,
          unit: 'mm',
        },
        {
          id: 'α',
          label: text('Included angle', 'Центральний кут', 'Центральный угол'),
          value: (r.angleRadians * 180) / Math.PI,
          unit: 'degree',
        },
        {
          id: 'A',
          label: text('Arc length', 'Довжина дуги', 'Длина дуги'),
          value: r.arcMm,
          unit: 'mm',
        },
      ],
    };
  },
};
