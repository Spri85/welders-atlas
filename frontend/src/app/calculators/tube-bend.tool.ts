import { field, text, type CalculatorTool } from '../calculator-tool';
import { calculateTubeBend } from './tube-bend';
export const tubeBendTool: CalculatorTool = {
  id: 'tube-bend',
  ticket: 'G15',
  title: text(
    'Continuous tube bend',
    'Суцільний згин труби',
    'Непрерывный гиб трубы',
  ),
  description: text(
    'Legs are measured to the theoretical centerline intersection. T1/T2 are theoretical tangent points; their stock marks start at the first cut end. Machine graduations, springback and clamping length depend on tooling. Stock-strip width is schematic.',
    'Плечі вимірюють до теоретичного перетину осей. T1/T2 — теоретичні точки дотику; відмітки на заготовці від першого торця. Шкали верстата, пружинення та довжина затиску залежать від оснащення. Ширина смуги умовна.',
    'Плечи измеряют до теоретического пересечения осей. T1/T2 — теоретические точки касания; отметки на заготовке от первого торца. Шкалы станка, пружинение и длина зажима зависят от оснастки. Ширина полосы условная.',
  ),
  fields: [
    field(
      'leg1',
      text('Centerline leg 1', 'Осьове плече 1', 'Осевое плечо 1'),
      200,
    ),
    field(
      'leg2',
      text('Centerline leg 2', 'Осьове плече 2', 'Осевое плечо 2'),
      150,
    ),
    field(
      'turn',
      text('Turn from straight', 'Поворот від прямого', 'Поворот от прямого'),
      90,
      'degree',
    ),
    field(
      'radius',
      text(
        'Die centerline radius',
        'Осьовий радіус оснащення',
        'Осевой радиус оснастки',
      ),
      50,
    ),
  ],
  calculate({ leg1, leg2, turn, radius }) {
    const r = calculateTubeBend(leg1, leg2, turn, radius);
    return {
      drawing: r.drawing,
      diagrams: [
        {
          title: text(
            'Stock tangent marks',
            'Відмітки дотику на заготовці',
            'Отметки касания на заготовке',
          ),
          drawing: r.blankDrawing,
        },
      ],
      metrics: [
        {
          id: 'R',
          label: text('Centerline radius', 'Осьовий радіус', 'Осевой радиус'),
          value: radius,
          unit: 'mm',
        },
        {
          id: 'S',
          label: text(
            'Setback on each leg',
            'Відступ на кожному плечі',
            'Отступ на каждом плече',
          ),
          value: r.setbackMm,
          unit: 'mm',
        },
        {
          id: 'A',
          label: text(
            'Centerline arc length',
            'Довжина осьової дуги',
            'Длина осевой дуги',
          ),
          value: r.arcMm,
          unit: 'mm',
        },
        {
          id: 'L',
          label: text('Stock length', 'Довжина заготовки', 'Длина заготовки'),
          value: r.stockMm,
          unit: 'mm',
        },
        {
          id: 'T1',
          label: text(
            'First tangent mark from first end',
            'Перша відмітка дотику від першого торця',
            'Первая отметка касания от первого торца',
          ),
          value: r.tangent1Mm,
          unit: 'mm',
        },
        {
          id: 'T2',
          label: text(
            'Second tangent mark from first end',
            'Друга відмітка дотику від першого торця',
            'Вторая отметка касания от первого торца',
          ),
          value: r.tangent2Mm,
          unit: 'mm',
        },
      ],
    };
  },
};
