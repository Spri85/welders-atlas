import { field, text, type CalculatorTool } from '../calculator-tool';
import { calculateCircularKerf } from './circular-kerf';
export const circularKerfTool: CalculatorTool = {
  id: 'circular-kerf',
  ticket: 'G18',
  title: text(
    'Circular kerf compensation',
    'Компенсація різу кола',
    'Компенсация реза окружности',
  ),
  description: text(
    'Enter measured full kerf width. Solid D is the intended finished edge; dash-dot P is the offset tool centerline; S marks scrap. With CAM/controller compensation enabled, program the nominal diameter: P is reference only.',
    'Введіть виміряну повну ширину різу. Суцільний D — готовий край; штрихпунктир P — зміщена вісь інструмента; S — відходи. Якщо компенсацію ввімкнено в CAM/контролері, програмуйте номінальний діаметр: P лише довідковий.',
    'Введите измеренную полную ширину реза. Сплошной D — готовый край; штрихпунктир P — смещённая ось инструмента; S — отходы. Если компенсация включена в CAM/контроллере, программируйте номинальный диаметр: P только справочный.',
  ),
  fields: [
    field(
      'diameter',
      text('Finished diameter', 'Готовий діаметр', 'Готовый диаметр'),
      50,
    ),
    field(
      'kerf',
      text(
        'Measured full kerf',
        'Виміряна повна ширина різу',
        'Измеренная полная ширина реза',
      ),
      2,
    ),
    field('keep', text('Keep', 'Зберегти', 'Сохранить'), 1, 'ratio', {
      choices: [
        { value: 1, label: text('Disc', 'Диск', 'Диск') },
        { value: 0, label: text('Hole', 'Отвір', 'Отверстие') },
      ],
    }),
    field(
      'controller',
      text(
        'CAM/controller compensation',
        'Компенсація CAM/контролера',
        'Компенсация CAM/контроллера',
      ),
      0,
      'ratio',
      {
        choices: [
          {
            value: 0,
            label: text(
              'Off: calculate manual path',
              'Вимкнено: розрахувати траєкторію',
              'Выключено: рассчитать траекторию',
            ),
          },
          {
            value: 1,
            label: text('Already enabled', 'Вже ввімкнено', 'Уже включена'),
          },
        ],
      },
    ),
  ],
  calculate({ diameter, kerf, keep, controller }) {
    const r = calculateCircularKerf(
      diameter,
      kerf,
      keep === 1,
      controller === 1,
    );
    return {
      drawing: r.drawing,
      metrics: [
        {
          id: 'D',
          label: text(
            'Finished edge diameter',
            'Діаметр готового краю',
            'Диаметр готового края',
          ),
          value: diameter,
          unit: 'mm',
        },
        {
          id: 'P',
          label:
            controller === 1
              ? text(
                  'Reference-only tool path diameter',
                  'Лише довідковий діаметр траєкторії',
                  'Только справочный диаметр траектории',
                )
              : text(
                  'Manual tool path diameter',
                  'Діаметр ручної траєкторії',
                  'Диаметр ручной траектории',
                ),
          value: r.referencePathMm,
          unit: 'mm',
        },
        {
          id: 'G',
          label: text(
            'Diameter to program',
            'Діаметр для програми',
            'Диаметр для программы',
          ),
          value: r.programmedMm,
          unit: 'mm',
        },
      ],
    };
  },
};
