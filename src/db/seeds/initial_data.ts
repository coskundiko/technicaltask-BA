import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('campaigns').del();
  await knex('budgets').del();
  await knex('advertisers').del();

  // Insert initial advertiser
  await knex('advertisers').insert({
    id: 1, // Use the ID from the README example
    balance: 0, // Start with 0 balance
  });

  // Insert initial budget for adv_001 for a specific day
  // This assumes the current_day in the budget table is a DATE type
  await knex('budgets').insert({
    advertiser_id: 1,
    current_day: '2024-08-05',
    daily_budget: 5000,
    used_today: 0,
  });
}
