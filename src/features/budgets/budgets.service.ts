import { topUpBalance as topUpBalanceRepository } from './budgets.repository';

export async function topUpBalance(advertiserId: string, amount: number) {
  return topUpBalanceRepository(advertiserId, amount);
}
