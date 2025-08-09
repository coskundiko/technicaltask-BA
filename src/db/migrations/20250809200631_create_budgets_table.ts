import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("budgets", (table) => {
    table.increments("id").primary();
    table
      .integer("advertiser_id")
      .unsigned()
      .references("id")
      .inTable("advertisers")
      .onDelete("CASCADE");
    table.date("current_day").notNullable();
    table.decimal("daily_budget", 10, 2).notNullable().defaultTo(5000.00);
    table.decimal("used_today", 10, 2).notNullable().defaultTo(0.00);
    table.unique(["advertiser_id", "current_day"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("budgets");
}