import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
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
    table.date("scheduled_for");
    table.string("reason").nullable();
    table.timestamp("created_at").defaultTo(knex.fn.now());
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists("campaigns");
}