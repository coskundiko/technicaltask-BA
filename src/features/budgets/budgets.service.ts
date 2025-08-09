import { topUpBalance as topUpBalanceRepository, getAdvertiser, getLatestBudget, createBudgetForDay } from '@app/features/budgets/budgets.repository';

export async function topUpBalance(advertiserId: string, amount: number) {
  return topUpBalanceRepository(advertiserId, amount);
}

export async function getBudgetState(advertiserId: string) {
  const advertiser = await getAdvertiser(advertiserId);
  if (!advertiser) {
    throw new Error(`Advertiser with ID ${advertiserId} not found.`);
  }

  let latestBudget = await getLatestBudget(advertiserId);

  // If no budget exists, create one for today
  if (!latestBudget) {
    const today = new Date().toISOString().slice(0, 10);
    await createBudgetForDay(advertiserId, today);
    latestBudget = await getLatestBudget(advertiserId);
  }

  if (!latestBudget) {
    // This should not happen after the above logic
    throw new Error(`Could not find or create a budget for advertiser with ID ${advertiserId}.`);
  }

  // Ensure these are numbers before addition
  const dailyBudgetNum = Number(latestBudget.daily_budget);
  const advertiserBalanceNum = Number(advertiser.balance);
  const usedTodayNum = Number(latestBudget.used_today);

  // Correct calculation for total_available: daily_budget + advertiser's persistent balance
  const totalAvailable = dailyBudgetNum + advertiserBalanceNum;

  // Correct calculation for remaining_today: total_available - used_today
  const remainingToday = totalAvailable - usedTodayNum;

  return {
    advertiser_id: advertiserId,
    current_day: latestBudget.current_day,
    daily_budget: dailyBudgetNum,
    rollover_balance: advertiserBalanceNum,
    total_available: totalAvailable,
    used_today: usedTodayNum,
    remaining_today: remainingToday,
  };
}
