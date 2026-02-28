import { Router } from 'express';
import type { SimulationRequestDto } from '@simulador/shared';
import { simulationInputSchema } from '../types/simulation.js';
import { simulate } from '../services/simulationService.js';

export const simulationRouter = Router();

simulationRouter.post('/', (req, res) => {
  const payload = req.body as Partial<SimulationRequestDto>;
  const parsed = simulationInputSchema.safeParse(payload.config);

  if (!parsed.success) {
    return res.status(400).json({
      error: 'Invalid simulation payload',
      details: parsed.error.flatten()
    });
  }

  const response = simulate(parsed.data);
  return res.status(200).json(response);
});
