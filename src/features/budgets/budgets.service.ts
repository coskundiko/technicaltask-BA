import { BudgetsRepository } from './budgets.repository';

export class BudgetsService {
  constructor(private budgetsRepository: BudgetsRepository) {}

  async topUpBalance(advertiserId: string, amount: number) {
    return this.budgetsRepository.topUpBalance(advertiserId, amount);
  }

  async getBudgetState(advertiserId: string) {
    const advertiser = await this.budgetsRepository.getAdvertiser(advertiserId);
    if (!advertiser) {
      throw new Error(`Advertiser with ID ${advertiserId} not found.`);
    }

    const todaysBudget = await this.budgetsRepository.findOrCreateTodaysBudget(advertiserId);

    if (!todaysBudget) {
      // This should not happen after the above logic
      throw new Error(`Could not find or create a budget for advertiser with ID ${advertiserId}.`);
    }

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
      daily_budget: dailyBudgetNum,
      rollover_balance: advertiserBalanceNum,
      total_available: totalAvailable,
      used_today: usedTodayNum,
      remaining_today: remainingToday,
    };
  }
}
