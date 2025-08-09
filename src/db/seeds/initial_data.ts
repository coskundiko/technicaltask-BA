import { Knex } from "knex";

export async function seed(knex: Knex): Promise<void> {
    // Deletes ALL existing entries
    await knex("campaigns").del();
    await knex("budgets").del();
    await knex("advertisers").del();

    // Inserts seed entries
    await knex("advertisers").insert([
        { id: 1, balance: 1000.00 },
        { id: 2, balance: 5000.00 },
    ]);
};