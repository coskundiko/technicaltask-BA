import { getBudgetState } from '@app/features/budgets/budgets.service';
import { updateUsedToday } from './spend.repository';

export async function processSpend(
  advertiserId: string,
  amount: number,
) {
  const budgetState = await getBudgetState(advertiserId);

  if (!budgetState) {
    throw new Error('Advertiser not found');
  }

  const { remaining_today, current_day } = budgetState;

  if (amount <= remaining_today) {
    await updateUsedToday(advertiserId, current_day, amount);
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
