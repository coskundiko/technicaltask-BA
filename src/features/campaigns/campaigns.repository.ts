import db from '@app/db';

export async function createCampaign(campaignData: {
  advertiser_id: string;
  campaign_name: string;
  cost: number;
  status: 'scheduled' | 'deferred' | 'completed';
  scheduled_for?: string;
  reason?: string;
}) {
  return db('campaigns').insert(campaignData);
}

export async function updateBudgetUsedToday(advertiserId: string, currentDay: string, amount: number) {
  return db('budgets')
    .where({ advertiser_id: advertiserId, current_day: currentDay })
    .increment('used_today', amount);
}

export async function getAllCampaigns() {
  return db('campaigns').select('*');
}
