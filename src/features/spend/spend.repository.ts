import db from '@app/db';

export class SpendRepository {
  async updateUsedToday(advertiserId: string, currentDay: string, amount: number) {
    return db('budgets')
      .where({ advertiser_id: advertiserId, current_day: currentDay })
      .increment('used_today', amount);
  }
}
