import {
  field,
  optional,
  text,
  type CalculatorMetric,
  type CalculatorTool,
} from '../calculator-tool';
import { calculateArcEnergy } from './arc-energy';
export const arcEnergyTool: CalculatorTool = {
  id: 'arc-energy',
  ticket: 'G24',
  title: text(
    'Steady-arc energy',
    'Енергія сталої дуги',
    'Энергия постоянной дуги',
  ),
  description: text(
    'Record of measured voltage, current and travel speed for one steady run. The schematic line represents one minute of travel. Effective heat input is shown only with a supplied efficiency. Pulsed or complex waveforms require a different measurement method.',
    'Запис виміряних напруги, струму та швидкості для одного сталого проходу. Умовна лінія показує хвилину руху. Ефективне тепловкладення показано лише із заданою ефективністю. Імпульсні або складні форми струму потребують іншого методу вимірювання.',
    'Запись измеренных напряжения, тока и скорости для одного постоянного прохода. Условная линия показывает минуту движения. Эффективное тепловложение показано только с заданной эффективностью. Импульсные или сложные формы тока требуют другого метода измерения.',
  ),
  fields: [
    field(
      'volts',
      'U',
      text(
        'Measured arc voltage',
        'Виміряна напруга дуги',
        'Измеренное напряжение дуги',
      ),
      24,
      'V',
    ),
    field(
      'amps',
      'I',
      text(
        'Measured arc current',
        'Виміряний струм дуги',
        'Измеренный ток дуги',
      ),
      200,
      'A',
    ),
    field(
      'speed',
      'v',
      text(
        'Measured travel speed',
        'Виміряна швидкість руху',
        'Измеренная скорость движения',
      ),
      300,
      'mm/min',
    ),
    field(
      'efficiency',
      'η',
      text(
        'Thermal efficiency (0,1]',
        'Теплова ефективність (0,1]',
        'Тепловая эффективность (0,1]',
      ),
      0.8,
      'ratio',
      { optional: true },
    ),
  ],
  calculate({ volts, amps, speed, efficiency }) {
    const r = calculateArcEnergy(volts, amps, speed, optional(efficiency));
    const metrics: CalculatorMetric[] = [
      {
        id: 'U',
        label: text(
          'Measured voltage',
          'Виміряна напруга',
          'Измеренное напряжение',
        ),
        value: volts,
        unit: 'V',
      },
      {
        id: 'I',
        label: text('Measured current', 'Виміряний струм', 'Измеренный ток'),
        value: amps,
        unit: 'A',
      },
      {
        id: 'v',
        label: text(
          'Measured travel speed',
          'Виміряна швидкість',
          'Измеренная скорость',
        ),
        value: speed,
        unit: 'mm/min',
      },
      {
        id: 'E',
        label: text('Arc energy', 'Енергія дуги', 'Энергия дуги'),
        value: r.arcKjPerMm,
        unit: 'kJ/mm',
      },
    ];
    if (r.effectiveKjPerMm !== undefined)
      metrics.push({
        id: 'H',
        label: text(
          'Effective heat input',
          'Ефективне тепловкладення',
          'Эффективное тепловложение',
        ),
        value: r.effectiveKjPerMm,
        unit: 'kJ/mm',
      });
    return { drawing: r.drawing, metrics };
  },
};
