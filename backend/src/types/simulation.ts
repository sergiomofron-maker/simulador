import { z } from 'zod';

export const simulationInputSchema = z.object({
  principal: z.number().nonnegative(),
  annualRatePercent: z.number().nonnegative(),
  years: z.number().positive(),
  contributionPerMonth: z.number().nonnegative().optional()
});

export type SimulationInputPayload = z.infer<typeof simulationInputSchema>;
