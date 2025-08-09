import { Knex } from 'knex';

export async function seed(knex: Knex): Promise<void> {
  // Deletes ALL existing entries
  await knex('campaigns').del();
  await knex('budgets').del();
  await knex('advertisers').del();

  await knex('advertisers').insert({ id: '1', balance: 0.0 });
  await knex('advertisers').insert({ id: '2', balance: 0.0 });

  // Example: Initial budget for adv_001 for today
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayString = yesterday.toISOString().slice(0, 10);
  await knex('budgets').insert([
    { advertiser_id: '1', current_day: yesterdayString, daily_budget: 5000.0, used_today: 0.0 },
  ]);
}
