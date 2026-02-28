import type { SimulationInput, SimulationResponseDto } from '@simulador/shared';
import { runCompoundInterestSimulation } from '../engine/compoundInterestEngine.js';

export function simulate(input: SimulationInput): SimulationResponseDto {
  const result = runCompoundInterestSimulation(input);
  return { result };
}
