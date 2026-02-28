import { Router } from 'express';
import { authCredentialsSchema } from './authSchemas.js';
import { login, register } from './authService.js';

export const authRouter = Router();

authRouter.post('/register', async (req, res) => {
  const parsed = authCredentialsSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: 'Invalid auth payload',
      details: parsed.error.flatten()
    });
  }

  try {
    const result = await register(parsed.data.email, parsed.data.password);
    return res.status(201).json(result);
  } catch (error) {
    if (error instanceof Error && error.message === 'EMAIL_ALREADY_IN_USE') {
      return res.status(409).json({ error: 'Email already in use' });
    }

    throw error;
  }
});

authRouter.post('/login', async (req, res) => {
  const parsed = authCredentialsSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: 'Invalid auth payload',
      details: parsed.error.flatten()
    });
  }

  try {
    const result = await login(parsed.data.email, parsed.data.password);
    return res.status(200).json(result);
  } catch (error) {
    if (error instanceof Error && error.message === 'INVALID_CREDENTIALS') {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    throw error;
  }
});
