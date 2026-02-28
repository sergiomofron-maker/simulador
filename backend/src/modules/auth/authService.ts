import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createUser, findUserByEmail } from '../users/userRepository.js';

interface AuthResult {
  token: string;
}

interface JwtClaims {
  sub: string;
  email: string;
}

const BCRYPT_ROUNDS = 10;

function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }

  return secret;
}

function signToken(claims: JwtClaims): string {
  return jwt.sign(claims, getJwtSecret(), {
    expiresIn: '2h'
  });
}

export async function register(email: string, password: string): Promise<AuthResult> {
  const normalizedEmail = email.toLowerCase();
  const existingUser = await findUserByEmail(normalizedEmail);

  if (existingUser) {
    throw new Error('EMAIL_ALREADY_IN_USE');
  }

  const passwordHash = await bcrypt.hash(password, BCRYPT_ROUNDS);
  const user = await createUser({ email: normalizedEmail, passwordHash });

  return {
    token: signToken({ sub: user.id, email: user.email })
  };
}

export async function login(email: string, password: string): Promise<AuthResult> {
  const normalizedEmail = email.toLowerCase();
  const user = await findUserByEmail(normalizedEmail);

  if (!user) {
    throw new Error('INVALID_CREDENTIALS');
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new Error('INVALID_CREDENTIALS');
  }

  return {
    token: signToken({ sub: user.id, email: user.email })
  };
}
