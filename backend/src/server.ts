import express from 'express';
import { simulationRouter } from './routes/simulationRoutes.js';

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/api/simulations', simulationRouter);

const port = Number(process.env.PORT ?? 3001);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend running at http://localhost:${port}`);
});
