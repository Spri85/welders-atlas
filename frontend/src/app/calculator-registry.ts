import { miteredCornerTool } from './calculators/mitered-corner.tool';
import { pipeOffsetTool } from './calculators/pipe-offset.tool';
import { rectangularFrameTool } from './calculators/rectangular-frame.tool';
import { gateBarsTool } from './calculators/gate-bars.tool';
import { boltCircleTool } from './calculators/bolt-circle.tool';
import { filletFillerTool } from './calculators/fillet-filler.tool';
import type { CalculatorTool } from './calculator-tool';

export const calculatorTools: readonly CalculatorTool[] = [miteredCornerTool, pipeOffsetTool, rectangularFrameTool, gateBarsTool, boltCircleTool, filletFillerTool];
