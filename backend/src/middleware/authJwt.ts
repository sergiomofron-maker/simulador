import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';

interface JwtUserClaims {
  sub: string;
  email: string;
  iat: number;
  exp: number;
}

declare global {
  namespace Express {
    interface Request {
      authUser?: {
        id: string;
        email: string;
      };
    }
  }
}

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }

  return secret;
}

export function authJwt(req: Request, res: Response, next: NextFunction): void {
  const authorization = req.header('authorization');

  if (!authorization || !authorization.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header' });
    return;
  }

  const token = authorization.slice('Bearer '.length);

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as JwtUserClaims;
    req.authUser = {
      id: decoded.sub,
      email: decoded.email
    };

    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
