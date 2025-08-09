import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("advertisers", (table) => {
    table.increments("id").primary();
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });

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
    table.decimal("rollover_balance", 10, 2).notNullable().defaultTo(0.00);
    table.decimal("used_today", 10, 2).notNullable().defaultTo(0.00);
  });

  await knex.schema.createTable("campaigns", (table) => {
    table.increments("id").primary();
    table
      .integer("advertiser_id")
      .unsigned()
      .references("id")
      .inTable("advertisers")
      .onDelete("CASCADE");
    table.string("campaign_name").notNullable();
    table.decimal("cost", 10, 2).notNullable();
    table.enum("status", ["scheduled", "deferred", "completed"]).notNullable();
    table.date("scheduled_for").notNullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("campaigns");
  await knex.schema.dropTableIfExists("budgets");
  await knex.schema.dropTableIfExists("advertisers");
}