import { BudgetsService } from '@app/features/budgets/budgets.service';
import { SpendRepository } from './spend.repository';

export class SpendService {
  constructor(
    private spendRepository: SpendRepository,
    private budgetsService: BudgetsService
  ) {}

  async processSpend(
    advertiserId: string,
    amount: number,
  ) {
    const budgetState = await this.budgetsService.getBudgetState(advertiserId);

    if (!budgetState) {
      throw new Error('Advertiser not found');
    }

    const { remaining_today, current_day } = budgetState;

    if (amount <= remaining_today) {
      await this.spendRepository.updateUsedToday(advertiserId, current_day, amount);
      return {
        status: 'success',
        remaining_today: remaining_today - amount,
      };
    } else {
      return {
        status: 'rejected',
        reason: 'insufficient_balance',
      };
    }
  }
}
