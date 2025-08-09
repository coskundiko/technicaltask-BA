import db from '@app/db';
import { getAdvertiser } from '@app/features/budgets/budgets.repository';
import { getLatestBudget, createBudgetForDay } from '@app/features/budgets/budgets.repository';

export async function simulateDay() {
  // 1. Get all advertisers
  const advertisers = await db('advertisers').select('id', 'balance');

  for (const advertiser of advertisers) {
    // 2. Get the latest budget for the advertiser
    const latestBudget = await getLatestBudget(advertiser.id);

    if (latestBudget) {
      // 3. Calculate unused budget and add to rollover
      const dailyBudgetNum = Number(latestBudget.daily_budget);
      const usedTodayNum = Number(latestBudget.used_today);
      const unusedBudget = dailyBudgetNum - usedTodayNum;

      if (unusedBudget > 0) {
        await db('advertisers')
          .where({ id: advertiser.id })
          .increment('balance', unusedBudget);
      }

      // 4. Create a new budget for the next day
      const lastBudgetDate = new Date(latestBudget.current_day);
      lastBudgetDate.setDate(lastBudgetDate.getDate() + 1);
      const newDayString = lastBudgetDate.toISOString().slice(0, 10);

      await createBudgetForDay(advertiser.id, newDayString);

      // 5. Attempt to reschedule previously deferred campaigns for the new day
      await rescheduleDeferredCampaigns(advertiser.id, newDayString);
    } else {
      // No previous budget, create one for today
      const today = new Date().toISOString().slice(0, 10);
      await createBudgetForDay(advertiser.id, today);
    }
  }

  return { message: 'Day simulation complete' };
}

async function rescheduleDeferredCampaigns(advertiserId: string, currentDay: string) {
  // Fetch deferred campaigns for this advertiser
  const deferredCampaigns = await db('campaigns')
    .where({ advertiser_id: advertiserId, status: 'deferred' })
    .orderBy('created_at', 'asc'); // Prioritize older campaigns

  for (const campaign of deferredCampaigns) {
    const advertiser = await getAdvertiser(advertiserId);
    const newDayBudget = await db('budgets').where({ advertiser_id: advertiserId, current_day: currentDay }).first();

    if (!advertiser || !newDayBudget) {
      console.error(`Could not get budget state for advertiser ${advertiserId}`);
      continue;
    }

    const totalAvailable = Number(newDayBudget.daily_budget) + Number(advertiser.balance) - Number(newDayBudget.used_today);

    if (Number(campaign.cost) <= totalAvailable) {
      // Schedule the campaign for the new day
      await db('campaigns')
        .where({ id: campaign.id })
        .update({ status: 'scheduled', scheduled_for: currentDay, reason: null });

      // Update used_today for the new day's budget
      await db('budgets')
        .where({ advertiser_id: advertiserId, current_day: currentDay })
        .increment('used_today', Number(campaign.cost));
    } else {
      // If it still doesn't fit, do nothing, it will be re-evaluated in the next simulation
    }
  }
}