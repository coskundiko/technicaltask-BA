import { Knex } from 'knex';

export class SpendRepository {
  constructor(private db: Knex) {}

  async updateUsedToday(advertiserId: string, currentDay: string, amount: number) {
    return this.db('budgets')
      .where({ advertiser_id: advertiserId, current_day: currentDay })
      .increment('used_today', amount);
  }
}
