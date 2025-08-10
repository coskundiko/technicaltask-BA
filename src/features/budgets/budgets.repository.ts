import db from '@app/db';

export async function topUpBalance(advertiserId: string, amount: number) {
  // With the new schema, we directly increment the balance on the advertiser's main record.
  const result = await db('advertisers')
    .where({ id: advertiserId })
    .increment('balance', amount);

  // Check if any row was updated. If not, the advertiser was not found.
  if (result === 0) {
    throw new Error(`Advertiser with ID ${advertiserId} not found.`);
  }

  return result;
}

export async function getAdvertiser(advertiserId: string) {
  return db('advertisers').where({ id: advertiserId }).first();
}

export async function findOrCreateTodaysBudget(advertiserId: string) {
  const today = new Date().toISOString().slice(0, 10); // Get YYYY-MM-DD

  let budget = await db('budgets')
    .where({
      advertiser_id: advertiserId,
      current_day: today,
    })
    .first();

  if (!budget) {
    await db('budgets').insert({
      advertiser_id: advertiserId,
      current_day: today,
    });
    budget = await db('budgets')
      .where({
        advertiser_id: advertiserId,
        current_day: today,
      })
      .first();
  }

  return budget;
}

export async function getLatestBudget(advertiserId: string) {
  return db('budgets')
    .where({ advertiser_id: advertiserId })
    .orderBy('current_day', 'desc')
    .first();
}

export async function createBudgetForDay(advertiserId: string, day: string) {
  return db('budgets').insert({
    advertiser_id: advertiserId,
    current_day: day,
  });
}

export async function getBudgetForDay(advertiserId: string, day: string) {
  return db('budgets').where({ advertiser_id: advertiserId, current_day: day }).first();
}
