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
import type { CalculatorTool } from './calculator-tool';

export const calculatorTools: readonly CalculatorTool[] = [miteredCornerTool, pipeOffsetTool, rectangularFrameTool, gateBarsTool, boltCircleTool, filletFillerTool, plateOpeningTool, bracketBlankTool, segmentedElbowTool, rolledSleeveTool, tubeBendTool];
