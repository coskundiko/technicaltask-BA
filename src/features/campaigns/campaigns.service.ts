import { getBudgetState } from '@app/features/budgets/budgets.service';
import { createCampaign, updateBudgetUsedToday, getAllCampaigns } from './campaigns.repository';

export async function submitCampaign(
  advertiserId: string,
  campaignName: string,
  cost: number
) {
  const budgetState = await getBudgetState(advertiserId);

  if (!budgetState) {
    throw new Error('Advertiser not found');
  }

  const { total_available, remaining_today, current_day } = budgetState;

  if (cost <= remaining_today) {
    // Schedule campaign
    await createCampaign({
      advertiser_id: advertiserId,
      campaign_name: campaignName,
      cost,
      status: 'scheduled',
      scheduled_for: current_day,
    });
    await updateBudgetUsedToday(advertiserId, current_day, cost);

    return {
      status: 'scheduled',
      scheduled_for: current_day,
      balance_remaining: remaining_today - cost,
    };
  } else {
    // Defer campaign
    // For now, we'll just defer to the next day. More complex logic can be added later.
    const nextDay = new Date(current_day);
    nextDay.setDate(nextDay.getDate() + 1);
    const scheduledForNextDay = nextDay.toISOString().slice(0, 10);

    await createCampaign({
      advertiser_id: advertiserId,
      campaign_name: campaignName,
      cost,
      status: 'deferred',
      scheduled_for: scheduledForNextDay,
      reason: 'insufficient_balance',
    });

    return {
      status: 'deferred',
      scheduled_for: scheduledForNextDay,
      reason: 'insufficient_balance',
    };
  }
}

export async function getCampaigns() {
  return getAllCampaigns();
}
