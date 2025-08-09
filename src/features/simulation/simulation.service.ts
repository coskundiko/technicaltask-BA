import db from '@app/db';
import { getAdvertiser } from '@app/features/budgets/budgets.repository';
import { getLatestBudget, createBudgetForDay } from '@app/features/budgets/budgets.repository';

export async function simulateDay() {
  console.log('Starting day simulation...');
  const advertisers = await db('advertisers').select('id', 'balance');
  console.log(`Found ${advertisers.length} advertisers.`);

  for (const advertiser of advertisers) {
    console.log(`Processing advertiser: ${advertiser.id}, current balance: ${advertiser.balance}`);
    const latestBudget = await getLatestBudget(advertiser.id);
    console.log(`Latest budget for ${advertiser.id}:`, latestBudget);

    if (latestBudget) {
      const dailyBudgetNum = Number(latestBudget.daily_budget);
      const usedTodayNum = Number(latestBudget.used_today);
      const unusedBudget = dailyBudgetNum - usedTodayNum;
      console.log(`Unused budget for ${advertiser.id}: ${unusedBudget}`);

      if (unusedBudget > 0) {
        await db('advertisers')
          .where({ id: advertiser.id })
          .increment('balance', unusedBudget);
        const updatedAdvertiser = await getAdvertiser(advertiser.id);
        console.log(`Updated balance for ${advertiser.id}: ${updatedAdvertiser.balance}`);
      }

      const lastBudgetDate = new Date(latestBudget.current_day);
      lastBudgetDate.setDate(lastBudgetDate.getDate() + 1);
      const newDayString = lastBudgetDate.toISOString().slice(0, 10);
      console.log(`New day string for ${advertiser.id}: ${newDayString}`);

      const existingBudget = await db('budgets').where({ advertiser_id: advertiser.id, current_day: newDayString }).first();

      if (!existingBudget) {
        await createBudgetForDay(advertiser.id, newDayString);
      }

      await rescheduleDeferredCampaigns(advertiser.id, newDayString);
    } else {
      const today = new Date().toISOString().slice(0, 10);
      console.log(`No previous budget for ${advertiser.id}, creating one for today: ${today}`);
      await createBudgetForDay(advertiser.id, today);
    }
  }

  console.log('Day simulation complete.');
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