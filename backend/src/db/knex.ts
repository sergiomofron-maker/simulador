import knex, { type Knex } from 'knex';

let instance: Knex | null = null;

function getDatabaseUrl(): string {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  return databaseUrl;
}

export function getDb(): Knex {
  if (!instance) {
    instance = knex({
      client: 'pg',
      connection: getDatabaseUrl(),
      pool: {
        min: 0,
        max: 10
      }
    });
  }

  return instance;
}

export async function closeDbConnection(): Promise<void> {
  if (instance) {
    await instance.destroy();
    instance = null;
  }
}
