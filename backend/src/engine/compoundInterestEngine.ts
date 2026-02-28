import type { SimulationInput, SimulationResult } from '@simulador/shared';

export function runCompoundInterestSimulation(input: SimulationInput): SimulationResult {
  const months = Math.floor(input.years * 12);
  const monthlyRate = input.annualRatePercent / 12 / 100;
  const monthlyContribution = input.contributionPerMonth ?? 0;

  let balance = input.principal;
  let totalContributions = input.principal;

  for (let month = 0; month < months; month += 1) {
    balance += monthlyContribution;
    totalContributions += monthlyContribution;
    balance *= 1 + monthlyRate;
  }

  const finalBalance = Number(balance.toFixed(2));
  const roundedContributions = Number(totalContributions.toFixed(2));

  return {
    finalBalance,
    totalContributions: roundedContributions,
    totalInterest: Number((finalBalance - roundedContributions).toFixed(2))
  };
}
