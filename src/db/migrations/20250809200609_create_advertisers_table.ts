import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("advertisers", (table) => {
    table.increments("id").primary();
    table.decimal("balance", 10, 2).notNullable().defaultTo(0.00);
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("advertisers");
}