import {
  field,
  text,
  type CalculatorTool,
  type Localized,
} from '../calculator-tool';
import { calculatePipeOffset } from './pipe-offset';

export const pipeOffsetTool: CalculatorTool = {
  id: 'pipe-offset',
  ticket: 'G5',
  title: text(
    'Two-elbow pipe offset',
    'Зміщення труби двома відводами',
    'Смещение трубы двумя отводами',
  ),
  description: text(
    'One-plane parallel offset, zero joint gap. Use the same elbow angle, greater than 0° and up to 90°, with separately measured center-to-end takeoffs.',
    'Паралельне зміщення в одній площині з нульовим зазором стику. Кут обох відводів понад 0° до 90°, монтажні виноси виміряйте окремо від центра до торця.',
    'Параллельное смещение в одной плоскости с нулевым зазором стыка. Угол обоих отводов свыше 0° до 90°, монтажные выносы измерьте отдельно от центра до торца.',
  ),
  fields: [
    field(
      'shift',
      text('Centerline shift', 'Зміщення осей', 'Смещение осей'),
      150,
    ),
    field(
      'angle',
      text('Elbow angle', 'Кут відводу', 'Угол отвода'),
      45,
      'degree',
    ),
    field(
      'a',
      text('First takeoff', 'Перший монтажний винос', 'Первый монтажный вынос'),
      30,
    ),
    field(
      'b',
      text(
        'Second takeoff',
        'Другий монтажний винос',
        'Второй монтажный вынос',
      ),
      40,
    ),
  ],
  calculate({ shift, angle, a, b }) {
    const result = calculatePipeOffset({
      shiftMm: shift,
      angleDegrees: angle,
      takeoffAMm: a,
      takeoffBMm: b,
    });
    const notes: Localized[] = [];
    if (result.overlapMm > 0) {
      notes.push(
        text(
          'The elbows overlap. Increase the shift or reduce the takeoffs before cutting.',
          'Відводи перекриваються. Збільште зміщення або зменште монтажні виноси перед різанням.',
          'Отводы перекрываются. Увеличьте смещение или уменьшите монтажные выносы перед резкой.',
        ),
      );
    } else if (result.cutMm === 0) {
      notes.push(
        text(
          'No straight piece is required between the elbows.',
          'Між відводами пряма вставка не потрібна.',
          'Между отводами прямая вставка не требуется.',
        ),
      );
    }
    return {
      drawing: result.drawing,
      notes,
      metrics: [
        { id: 'S', label: this.fields[0].label, value: shift, unit: 'mm' },
        {
          id: 'T',
          label: text(
            'Center-to-center travel',
            'Відстань між центрами',
            'Расстояние между центрами',
          ),
          value: result.travelMm,
          unit: 'mm',
        },
        {
          id: 'X',
          label: text(
            'Horizontal advance',
            'Горизонтальний винос',
            'Горизонтальный вынос',
          ),
          value: result.advanceMm,
          unit: 'mm',
        },
        { id: 'a', label: this.fields[2].label, value: a, unit: 'mm' },
        { id: 'b', label: this.fields[3].label, value: b, unit: 'mm' },
        {
          id: 'C',
          label: text(
            'Face-to-face straight cut',
            'Пряма вставка між торцями',
            'Прямая вставка между торцами',
          ),
          value: Math.max(0, result.cutMm),
          unit: 'mm',
        },
        {
          id: 'O',
          label: text('Overlap', 'Перекриття', 'Перекрытие'),
          value: result.overlapMm,
          unit: 'mm',
        },
      ],
    };
  },
};
