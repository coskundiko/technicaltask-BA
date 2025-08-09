import db from '@app/db';

export async function updateUsedToday(advertiserId: string, currentDay: string, amount: number) {
  return db('budgets')
    .where({ advertiser_id: advertiserId, current_day: currentDay })
    .increment('used_today', amount);
}
