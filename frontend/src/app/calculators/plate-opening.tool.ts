import { field, text, type CalculatorTool } from '../calculator-tool';
import { calculatePlateOpening } from './plate-opening';
const front = text(
  'Front face · printed side toward worker',
  'Передня грань · друком до майстра',
  'Передняя грань · печатью к мастеру',
);
const far = text(
  'Far face · flip about A',
  'Дальня грань · переворот навколо A',
  'Дальняя грань · переворот вокруг A',
);
export const plateOpeningTool: CalculatorTool = {
  id: 'plate-opening',
  ticket: 'G11',
  printable: true,
  title: text(
    'Angled pipe through plate',
    'Похила труба крізь плиту',
    'Наклонная труба сквозь плиту',
  ),
  description: text(
    'Zero-clearance passage cut along the pipe axis. Tilt is measured from the plate normal; direction is counterclockwise from +X. Solid outlines show both faces in the common front view; A is the vertical datum, B horizontal. Far-face paper is mirrored about A: flip about A from the front reference position, keep the printed side visible on the far face and register O/A/B; +X points left in the far-side view.',
    'Прохід без зазору вздовж осі труби. Нахил від нормалі до плити; напрям проти годинникової стрілки від +X. Суцільні контури — обидві грані спереду; A — вертикальна база, B — горизонтальна. Шаблон дальньої грані дзеркальний відносно A: переверніть навколо A з переднього положення, тримайте друк видимим на дальній грані та сумістіть O/A/B; +X ліворуч при огляді ззаду.',
    'Проход без зазора вдоль оси трубы. Наклон от нормали к плите; направление против часовой стрелки от +X. Сплошные контуры — обе грани спереди; A — вертикальная база, B — горизонтальная. Шаблон дальней грани зеркальный относительно A: переверните вокруг A из переднего положения, оставьте печать видимой на дальней грани и совместите O/A/B; +X влево при виде сзади.',
  ),
  fields: [
    field(
      'diameter',
      text(
        'Pipe outside diameter',
        'Зовнішній діаметр труби',
        'Наружный диаметр трубы',
      ),
      50,
    ),
    field(
      'thickness',
      text('Plate thickness', 'Товщина плити', 'Толщина плиты'),
      20,
    ),
    field(
      'tilt',
      text(
        'Tilt from plate normal [0,90)',
        'Нахил від нормалі [0,90)',
        'Наклон от нормали [0,90)',
      ),
      45,
      'degree',
    ),
    field(
      'direction',
      text('Tilt direction', 'Напрям нахилу', 'Направление наклона'),
      0,
      'degree',
    ),
  ],
  calculate({ diameter, thickness, tilt, direction }) {
    const r = calculatePlateOpening(diameter, thickness, tilt, direction);
    return {
      drawing: r.drawing,
      model: r.model,
      diagrams: [
        {
          title: text(
            'Section along tilt direction',
            'Переріз у напрямку нахилу',
            'Сечение по направлению наклона',
          ),
          drawing: r.sectionDrawing,
        },
      ],
      metrics: [
        {
          id: 't',
          label: text('Plate thickness', 'Товщина плити', 'Толщина плиты'),
          value: thickness,
          unit: 'mm',
        },
        {
          id: 'a',
          label: text(
            'Full major axis',
            'Повна велика вісь',
            'Полная большая ось',
          ),
          value: r.majorMm,
          unit: 'mm',
        },
        {
          id: 'b',
          label: text('Full minor axis', 'Повна мала вісь', 'Полная малая ось'),
          value: r.minorMm,
          unit: 'mm',
        },
        {
          id: 'S',
          label: text(
            'Far-center shift',
            'Зсув дальнього центра',
            'Смещение дальнего центра',
          ),
          value: r.shiftMm,
          unit: 'mm',
        },
        {
          id: 'X',
          label: text(
            'Far center X, front view',
            'X дальнього центра спереду',
            'X дальнего центра спереди',
          ),
          value: r.center.x,
          unit: 'mm',
        },
        {
          id: 'Y',
          label: text(
            'Far center Y, front view',
            'Y дальнього центра спереду',
            'Y дальнего центра спереди',
          ),
          value: r.center.y,
          unit: 'mm',
        },
      ],
      templates: [
        { title: front, drawing: r.frontDrawing },
        { title: far, drawing: r.farDrawing },
      ],
    };
  },
};
