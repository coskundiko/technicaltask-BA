import { topUpBalance as topUpBalanceRepository, getAdvertiser, findOrCreateTodaysBudget } from '@app/features/budgets/budgets.repository';

export async function topUpBalance(advertiserId: string, amount: number) {
  return topUpBalanceRepository(advertiserId, amount);
}

export async function getBudgetState(advertiserId: string) {
  const advertiser = await getAdvertiser(advertiserId);
  if (!advertiser) {
    throw new Error(`Advertiser with ID ${advertiserId} not found.`);
  }

  const todaysBudget = await findOrCreateTodaysBudget(advertiserId);

  // Ensure these are numbers before addition
  const dailyBudgetNum = Number(todaysBudget.daily_budget);
  const advertiserBalanceNum = Number(advertiser.balance);
  const usedTodayNum = Number(todaysBudget.used_today);

  // Correct calculation for total_available: daily_budget + advertiser's persistent balance
  const totalAvailable = dailyBudgetNum + advertiserBalanceNum;

  // Correct calculation for remaining_today: total_available - used_today
  const remainingToday = totalAvailable - usedTodayNum;

  return {
    advertiser_id: advertiserId,
    current_day: todaysBudget.current_day,
    daily_budget: todaysBudget.daily_budget, // Keep as original type for response
    rollover_balance: advertiser.balance, // Keep as original type for response
    total_available: totalAvailable,
    used_today: todaysBudget.used_today, // Keep as original type for response
    remaining_today: remainingToday,
  };
}
