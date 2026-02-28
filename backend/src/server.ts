import express from 'express';
import { authRouter } from './modules/auth/authRoutes.js';
import { authJwt } from './middleware/authJwt.js';
import { simulationRouter } from './routes/simulationRoutes.js';

const app = express();
app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.use('/auth', authRouter);
app.use('/api/simulations', authJwt, simulationRouter);

const port = Number(process.env.PORT ?? 3001);
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend running at http://localhost:${port}`);
});
