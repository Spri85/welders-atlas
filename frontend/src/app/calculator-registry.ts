import { miteredCornerTool } from './calculators/mitered-corner.tool';
import { pipeOffsetTool } from './calculators/pipe-offset.tool';
import type { CalculatorTool } from './calculator-tool';

export const calculatorTools: readonly CalculatorTool[] = [miteredCornerTool, pipeOffsetTool];
