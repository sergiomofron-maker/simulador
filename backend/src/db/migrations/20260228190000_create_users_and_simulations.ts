import type { Knex } from 'knex';

const USERS_TABLE = 'users';
const SIMULATIONS_TABLE = 'simulations';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable(USERS_TABLE, (table) => {
    table.string('id').primary();
    table.string('email').notNullable().unique();
    table.string('password_hash').notNullable();
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.createTable(SIMULATIONS_TABLE, (table) => {
    table.string('id').primary();
    table.string('user_id').notNullable().references('id').inTable(USERS_TABLE).onDelete('CASCADE');
    table.jsonb('configuration_json').notNullable();
    table.jsonb('results_json').notNullable();
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());

    table.index(['user_id', 'created_at']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists(SIMULATIONS_TABLE);
  await knex.schema.dropTableIfExists(USERS_TABLE);
}
