
import db from '@app/db';
import { getAdvertiser, getLatestBudget, createBudgetForDay, getBudgetForDay } from '@app/features/budgets/budgets.repository';
import { getDeferredCampaigns } from '@app/features/campaigns/campaigns.repository';

export async function simulateDay() {
  console.log('Starting day simulation...');
  const advertisers = await db('advertisers').select('id', 'balance');
  console.log(`Found ${advertisers.length} advertisers.`);

  for (const advertiser of advertisers) {
    console.log(`Processing advertiser: ${advertiser.id}, current balance: ${advertiser.balance}`);
    const latestBudget = await getLatestBudget(advertiser.id);
    console.log(`Latest budget for ${advertiser.id}:`, latestBudget);

    let newBalance = Number(advertiser.balance);

    if (latestBudget) {
      const dailyBudgetNum = Number(latestBudget.daily_budget);
      const usedTodayNum = Number(latestBudget.used_today);
      const unusedBudget = dailyBudgetNum - usedTodayNum;
      console.log(`Unused budget for ${advertiser.id}: ${unusedBudget}`);

      if (unusedBudget > 0) {
        newBalance += unusedBudget;
        await db('advertisers')
          .where({ id: advertiser.id })
          .update({ balance: newBalance });
        console.log(`Updated balance for ${advertiser.id}: ${newBalance}`);
      }

      const lastBudgetDate = new Date(latestBudget.current_day);
      lastBudgetDate.setDate(lastBudgetDate.getDate() + 1);
      const newDayString = lastBudgetDate.toISOString().slice(0, 10);
      console.log(`New day string for ${advertiser.id}: ${newDayString}`);

      const existingBudget = await getBudgetForDay(advertiser.id, newDayString);

      if (!existingBudget) {
        await createBudgetForDay(advertiser.id, newDayString);
      }

      await rescheduleDeferredCampaigns(advertiser.id, newDayString, newBalance);
    } else {
      const today = new Date().toISOString().slice(0, 10);
      console.log(`No previous budget for ${advertiser.id}, creating one for today: ${today}`);
      await createBudgetForDay(advertiser.id, today);
      await rescheduleDeferredCampaigns(advertiser.id, today, newBalance);
    }
  }

  console.log('Day simulation complete.');
  return { message: 'Day simulation complete' };
}

async function rescheduleDeferredCampaigns(advertiserId: string, currentDay: string, currentBalance: number) {
  const deferredCampaigns = await getDeferredCampaigns(advertiserId);

  if (deferredCampaigns.length === 0) {
    return;
  }

  console.log(`Found ${deferredCampaigns.length} deferred campaigns for advertiser ${advertiserId} for day ${currentDay}.`);

  const newDayBudget = await getBudgetForDay(advertiserId, currentDay);

  if (!newDayBudget) {
    console.error(`Could not find or create budget for advertiser ${advertiserId} for day ${currentDay}`);
    return;
  }

  let remainingBalance = currentBalance;
  let remainingDailyBudget = Number(newDayBudget.daily_budget) - Number(newDayBudget.used_today);

  for (const campaign of deferredCampaigns) {
    const campaignCost = Number(campaign.cost);
    console.log(`Evaluating campaign ${campaign.id} with cost ${campaignCost}.`);
    console.log(`Remaining balance: ${remainingBalance}, Remaining daily budget: ${remainingDailyBudget}`);

    if (campaignCost <= remainingDailyBudget + remainingBalance) {
      // Schedule the campaign
      await db('campaigns')
        .where({ id: campaign.id })
        .update({ status: 'scheduled', scheduled_for: currentDay, reason: null });

      // Update budget usage
      await db('budgets')
        .where({ id: newDayBudget.id })
        .increment('used_today', campaignCost);

      // Deduct from daily budget first, then from rollover balance
      if (campaignCost <= remainingDailyBudget) {
        remainingDailyBudget -= campaignCost;
      } else {
        const fromBalance = campaignCost - remainingDailyBudget;
        remainingDailyBudget = 0;
        remainingBalance -= fromBalance;

        // Update the advertiser's main balance
        await db('advertisers').where({ id: advertiserId }).update({ balance: remainingBalance });
      }

      console.log(`Campaign ${campaign.id} scheduled for ${currentDay}.`);
    } else {
      console.log(`Campaign ${campaign.id} still has insufficient funds.`);
      // If it still doesn't fit, it remains deferred.
    }
  }
}
