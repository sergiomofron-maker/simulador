export interface SimulationInput {
  principal: number;
  annualRatePercent: number;
  years: number;
  contributionPerMonth?: number;
}

export interface SimulationResult {
  finalBalance: number;
  totalContributions: number;
  totalInterest: number;
}

export interface SimulationRequestDto {
  config: SimulationInput;
}

export interface SimulationResponseDto {
  result: SimulationResult;
}
