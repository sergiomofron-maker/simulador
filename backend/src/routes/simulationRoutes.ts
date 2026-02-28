import { randomUUID } from 'node:crypto';
import { Router } from 'express';
import { z } from 'zod';
import { simulationInputSchema } from '../types/simulation.js';
import { simulate } from '../services/simulationService.js';
import { getDb } from '../db/knex.js';

export const simulationRouter = Router();

interface SimulationRow {
  id: string;
  user_id: string;
  configuration_json: unknown;
  results_json: unknown;
  created_at: Date;
}

const createSimulationSchema = z.object({
  config: simulationInputSchema
});

function mapSimulation(row: SimulationRow) {
  return {
    id: row.id,
    userId: row.user_id,
    configuration: row.configuration_json,
    results: row.results_json,
    result: row.results_json,
    createdAt: new Date(row.created_at).toISOString()
  };
}

simulationRouter.post('/', async (req, res) => {
  const parsed = createSimulationSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: 'Invalid simulation payload',
      details: parsed.error.flatten()
    });
  }

  const authUserId = req.authUser?.id;
  if (!authUserId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const result = simulate(parsed.data.config).result;

  const [row] = await getDb<SimulationRow>('simulations')
    .insert({
      id: randomUUID(),
      user_id: authUserId,
      configuration_json: parsed.data.config,
      results_json: result
    })
    .returning(['id', 'user_id', 'configuration_json', 'results_json', 'created_at']);

  return res.status(201).json(mapSimulation(row));
});

simulationRouter.get('/', async (req, res) => {
  const authUserId = req.authUser?.id;
  if (!authUserId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const rows = await getDb<SimulationRow>('simulations')
    .where({ user_id: authUserId })
    .orderBy('created_at', 'desc');

  return res.status(200).json(rows.map(mapSimulation));
});

simulationRouter.get('/:id', async (req, res) => {
  const authUserId = req.authUser?.id;
  if (!authUserId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const row = await getDb<SimulationRow>('simulations')
    .where({ id: req.params.id, user_id: authUserId })
    .first();

  if (!row) {
    return res.status(404).json({ error: 'Simulation not found' });
  }

  return res.status(200).json(mapSimulation(row));
});

simulationRouter.delete('/:id', async (req, res) => {
  const authUserId = req.authUser?.id;
  if (!authUserId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const deletedRowsCount = await getDb('simulations')
    .where({ id: req.params.id, user_id: authUserId })
    .delete();

  if (deletedRowsCount === 0) {
    return res.status(404).json({ error: 'Simulation not found' });
  }

  return res.status(204).send();
});
