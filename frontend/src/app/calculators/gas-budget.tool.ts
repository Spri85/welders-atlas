import {
  field,
  optional,
  text,
  type CalculatorMetric,
  type CalculatorTool,
} from '../calculator-tool';
import { calculateGasBudget } from './gas-budget';
export const gasBudgetTool: CalculatorTool = {
  id: 'gas-budget',
  ticket: 'G23',
  title: text(
    'Shielding gas budget',
    'Витрати захисного газу',
    'Расход защитного газа',
  ),
  description: text(
    'Constant measured flow and independent gas cycles. The timeline sums all preflow P, arc-on A and postflow Q periods; it does not show cycle order. Purge gas and leaks are separate allowances. Supply is usable free-gas litres. A positive arc time needs at least one cycle.',
    'Сталий виміряний потік і незалежні газові цикли. Шкала підсумовує передпродувку P, горіння дуги A та післяпродувку Q; порядок циклів не показано. Газ для продувки та витоки враховуються окремо. Запас — доступні літри вільного газу. Додатний час дуги потребує хоча б одного циклу.',
    'Постоянный измеренный поток и независимые газовые циклы. Шкала суммирует предпродувку P, горение дуги A и постпродувку Q; порядок циклов не показан. Газ для продувки и утечки учитываются отдельно. Запас — доступные литры свободного газа. Положительное время дуги требует хотя бы одного цикла.',
  ),
  fields: [
    field(
      'flow',
      'q',
      text(
        'Measured gas flow',
        'Виміряний потік газу',
        'Измеренный поток газа',
      ),
      12,
      'L/min',
    ),
    field(
      'arc',
      'A',
      text('Total arc-on minutes', 'Загальний час дуги', 'Общее время дуги'),
      20,
      'min',
    ),
    field(
      'cycles',
      'n',
      text(
        'Gas-cycle count',
        'Кількість газових циклів',
        'Количество газовых циклов',
      ),
      30,
      'count',
    ),
    field(
      'pre',
      't₁',
      text(
        'Preflow per cycle',
        'Передпродувка за цикл',
        'Предпродувка за цикл',
      ),
      1,
      's',
    ),
    field(
      'post',
      't₂',
      text(
        'Postflow per cycle',
        'Післяпродувка за цикл',
        'Постпродувка за цикл',
      ),
      3,
      's',
    ),
    field(
      'available',
      'V₀',
      text(
        'Available usable free gas',
        'Доступний запас вільного газу',
        'Доступный запас свободного газа',
      ),
      250,
      'L',
      { optional: true },
    ),
  ],
  calculate({ flow, arc, cycles, pre, post, available }) {
    const r = calculateGasBudget(
      flow,
      arc,
      cycles,
      pre,
      post,
      optional(available),
    );
    const metrics: CalculatorMetric[] = [
      {
        id: 'P',
        label: text(
          'Total preflow time',
          'Загальний час передпродувки',
          'Общее время предпродувки',
        ),
        value: r.preMinutes,
        unit: 'min',
      },
      {
        id: 'A',
        label: text('Arc-on time', 'Час дуги', 'Время дуги'),
        value: arc,
        unit: 'min',
      },
      {
        id: 'Q',
        label: text(
          'Total postflow time',
          'Загальний час післяпродувки',
          'Общее время постпродувки',
        ),
        value: r.postMinutes,
        unit: 'min',
      },
      {
        id: 'T',
        label: text(
          'Total gas-on time',
          'Загальний час подачі газу',
          'Общее время подачи газа',
        ),
        value: r.gasMinutes,
        unit: 'min',
      },
      {
        id: 'V',
        label: text(
          'Job gas consumption',
          'Витрати газу на роботу',
          'Расход газа на работу',
        ),
        value: r.jobLitres,
        unit: 'L',
      },
    ];
    if (r.balanceLitres !== undefined)
      metrics.push({
        id: 'Δ',
        label: text(
          'Supply balance (negative = shortfall)',
          'Баланс запасу (від’ємний = нестача)',
          'Баланс запаса (отрицательный = нехватка)',
        ),
        value: r.balanceLitres,
        unit: 'L',
      });
    return { drawing: r.drawing, metrics };
  },
};
