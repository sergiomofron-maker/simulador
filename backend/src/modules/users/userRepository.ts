import { randomUUID } from 'node:crypto';
import { getDb } from '../../db/knex.js';
import type { CreateUserInput, User } from './userTypes.js';

interface UserRow {
  id: string;
  email: string;
  password_hash: string;
  created_at: Date;
}

function mapUserRow(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash,
    createdAt: new Date(row.created_at)
  };
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const row = await getDb<UserRow>('users').where({ email: email.toLowerCase() }).first();
  return row ? mapUserRow(row) : null;
}

export async function createUser(input: CreateUserInput): Promise<User> {
  const userId = randomUUID();
  const [row] = await getDb<UserRow>('users')
    .insert({
      id: userId,
      email: input.email.toLowerCase(),
      password_hash: input.passwordHash
    })
    .returning(['id', 'email', 'password_hash', 'created_at']);

  return mapUserRow(row);
}
