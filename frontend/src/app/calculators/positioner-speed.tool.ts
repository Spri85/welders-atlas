import { field, optional, text, type CalculatorTool } from '../calculator-tool';
import { calculatePositionerSpeed } from './positioner-speed';
const statuses = {
  slow: text(
    'Below the supplied workpiece RPM range.',
    'Нижче заданого діапазону обертів деталі.',
    'Ниже заданного диапазона оборотов детали.',
  ),
  fast: text(
    'Above the supplied workpiece RPM range.',
    'Вище заданого діапазону обертів деталі.',
    'Выше заданного диапазона оборотов детали.',
  ),
  within: text(
    'Within the supplied workpiece RPM limits.',
    'У межах заданих обертів деталі.',
    'В пределах заданных оборотов детали.',
  ),
  unspecified: text(
    'No machine RPM limits supplied.',
    'Межі обертів верстата не задані.',
    'Пределы оборотов станка не заданы.',
  ),
};
export const positionerSpeedTool: CalculatorTool = {
  id: 'positioner-speed',
  ticket: 'G20',
  title: text(
    'Rotary positioner speed',
    'Швидкість зварювального позиціонера',
    'Скорость сварочного позиционера',
  ),
  description: text(
    'D is diameter at the circular weld path; N is workpiece rotation, independent of drive roller diameter. Enter the specified linear travel speed and optional machine limits.',
    'D — діаметр кругового шва; N — оберти деталі, незалежні від діаметра ведучого ролика. Введіть задану лінійну швидкість та необов’язкові межі верстата.',
    'D — диаметр кругового шва; N — обороты детали, независимые от диаметра ведущего ролика. Введите заданную линейную скорость и необязательные пределы станка.',
  ),
  fields: [
    field(
      'diameter',
      text(
        'Weld-path diameter',
        'Діаметр траєкторії шва',
        'Диаметр траектории шва',
      ),
      100,
    ),
    field(
      'speed',
      text(
        'Linear weld travel speed',
        'Лінійна швидкість зварювання',
        'Линейная скорость сварки',
      ),
      300,
      'mm/min',
    ),
    field(
      'minimum',
      text(
        'Minimum workpiece RPM',
        'Мінімальні оберти деталі',
        'Минимальные обороты детали',
      ),
      NaN,
      'rpm',
      { optional: true },
    ),
    field(
      'maximum',
      text(
        'Maximum workpiece RPM',
        'Максимальні оберти деталі',
        'Максимальные обороты детали',
      ),
      NaN,
      'rpm',
      { optional: true },
    ),
  ],
  calculate({ diameter, speed, minimum, maximum }) {
    const r = calculatePositionerSpeed(
      diameter,
      speed,
      optional(minimum),
      optional(maximum),
    );
    return {
      drawing: r.drawing,
      notes: [statuses[r.status]],
      metrics: [
        {
          id: 'D',
          label: text(
            'Weld-path diameter',
            'Діаметр траєкторії шва',
            'Диаметр траектории шва',
          ),
          value: diameter,
          unit: 'mm',
        },
        {
          id: 'N',
          label: text('Workpiece rotation', 'Оберти деталі', 'Обороты детали'),
          value: r.rpm,
          unit: 'rpm',
        },
        {
          id: 'T',
          label: text('Time per revolution', 'Час на оберт', 'Время на оборот'),
          value: r.secondsPerTurn,
          unit: 's',
        },
      ],
    };
  },
};
