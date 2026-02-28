import { randomUUID } from 'node:crypto';
import type { CreateUserInput, User } from './userTypes.js';

const usersByEmail = new Map<string, User>();

function createUserId(): string {
  return randomUUID();
}

export function findUserByEmail(email: string): User | null {
  return usersByEmail.get(email.toLowerCase()) ?? null;
}

export function createUser(input: CreateUserInput): User {
  const user: User = {
    id: createUserId(),
    email: input.email.toLowerCase(),
    passwordHash: input.passwordHash,
    createdAt: new Date()
  };

  usersByEmail.set(user.email, user);
  return user;
}
