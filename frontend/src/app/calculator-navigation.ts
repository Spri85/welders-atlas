import { miteredCornerTool } from './calculators/mitered-corner.tool';
import { pipeOffsetTool } from './calculators/pipe-offset.tool';
import { rectangularFrameTool } from './calculators/rectangular-frame.tool';
import { gateBarsTool } from './calculators/gate-bars.tool';
import { boltCircleTool } from './calculators/bolt-circle.tool';
import { filletFillerTool } from './calculators/fillet-filler.tool';
import { plateOpeningTool } from './calculators/plate-opening.tool';
import { bracketBlankTool } from './calculators/bracket-blank.tool';
import { segmentedElbowTool } from './calculators/segmented-elbow.tool';
import { rolledSleeveTool } from './calculators/rolled-sleeve.tool';
import { tubeBendTool } from './calculators/tube-bend.tool';
import { measuredRadiusTool } from './calculators/measured-radius.tool';
import { squareTransitionTool } from './calculators/square-transition.tool';
import { sheetGridTool } from './calculators/sheet-grid.tool';
import { circularKerfTool } from './calculators/circular-kerf.tool';
import { stockMassTool } from './calculators/stock-mass.tool';
import { positionerSpeedTool } from './calculators/positioner-speed.tool';
import { intermittentWeldTool } from './calculators/intermittent-weld.tool';
import { singleVTool } from './calculators/single-v.tool';
import { gasBudgetTool } from './calculators/gas-budget.tool';
import { arcEnergyTool } from './calculators/arc-energy.tool';
import { type CalculatorTool, type Localized, text } from './calculator-tool';
import { reducerCopy } from './reducer-copy';
import { squareToRoundCopy } from './square-to-round-copy';
import { branchSaddleCopy } from './branch-saddle-copy';
import { stockPlannerTitle } from './stock-planner';

type CalculatorLink = Pick<CalculatorTool, 'id' | 'title'>;
interface CalculatorGroup {
  readonly id: string;
  readonly title: Localized;
  readonly calculators: readonly CalculatorLink[];
}

const roundReducer: CalculatorLink = {
  id: 'round-reducer',
  title: text(
    reducerCopy.en.heading,
    reducerCopy.ua.heading,
    reducerCopy.ru.heading,
  ),
};
const squareToRound: CalculatorLink = {
  id: 'square-to-round',
  title: text(
    squareToRoundCopy.en.heading,
    squareToRoundCopy.ua.heading,
    squareToRoundCopy.ru.heading,
  ),
};
const branchSaddle: CalculatorLink = {
  id: 'branch-saddle',
  title: text(
    branchSaddleCopy.en.heading,
    branchSaddleCopy.ua.heading,
    branchSaddleCopy.ru.heading,
  ),
};

export const transitionShortcuts: readonly CalculatorLink[] = [
  {
    id: roundReducer.id,
    title: text('Round → round', 'Круг → круг', 'Круг → круг'),
  },
  {
    id: squareToRound.id,
    title: text('Square → round', 'Квадрат → круг', 'Квадрат → круг'),
  },
  {
    id: squareTransitionTool.id,
    title: text('Square → square', 'Квадрат → квадрат', 'Квадрат → квадрат'),
  },
];

export const calculatorGroups: readonly CalculatorGroup[] = [
  {
    id: 'transitions',
    title: text('Transitions', 'Переходи', 'Переходы'),
    calculators: [roundReducer, squareToRound, squareTransitionTool],
  },
  {
    id: 'pipework-forming',
    title: text(
      'Pipework & forming',
      'Труби та формування',
      'Трубы и формовка',
    ),
    calculators: [
      branchSaddle,
      miteredCornerTool,
      pipeOffsetTool,
      bracketBlankTool,
      segmentedElbowTool,
      rolledSleeveTool,
      tubeBendTool,
      measuredRadiusTool,
    ],
  },
  {
    id: 'frames-layout',
    title: text('Frames & layout', 'Рами та розмітка', 'Рамы и разметка'),
    calculators: [
      rectangularFrameTool,
      gateBarsTool,
      boltCircleTool,
      plateOpeningTool,
    ],
  },
  {
    id: 'cutting-materials',
    title: text(
      'Cutting & materials',
      'Розкрій та матеріали',
      'Раскрой и материалы',
    ),
    calculators: [
      { id: 'stock-planner', title: stockPlannerTitle },
      sheetGridTool,
      circularKerfTool,
      stockMassTool,
    ],
  },
  {
    id: 'welding',
    title: text('Welding', 'Зварювання', 'Сварка'),
    calculators: [
      filletFillerTool,
      positionerSpeedTool,
      intermittentWeldTool,
      singleVTool,
      gasBudgetTool,
      arcEnergyTool,
    ],
  },
];
