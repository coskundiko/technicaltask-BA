import db from '@app/db';

export class CampaignsRepository {
  async createCampaign(campaignData: {
    advertiser_id: string;
    campaign_name: string;
    cost: number;
    status: 'scheduled' | 'deferred' | 'completed';
    scheduled_for?: string;
    reason?: string;
  }) {
    return db('campaigns').insert(campaignData);
  }

  async updateBudgetUsedToday(advertiserId: string, currentDay: string, amount: number) {
    return db('budgets')
      .where({ advertiser_id: advertiserId, current_day: currentDay })
      .increment('used_today', amount);
  }

  async getAllCampaigns() {
    return db('campaigns').select('*');
  }

  async getDeferredCampaigns(advertiserId: string) {
    return db('campaigns')
      .where({ advertiser_id: advertiserId, status: 'deferred' })
      .orderBy('created_at', 'asc');
  }
}
