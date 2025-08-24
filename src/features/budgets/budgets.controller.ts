import { FastifyRequest, FastifyReply } from 'fastify';
import { TopUpInput, GetBudgetParams } from './budgets.validation';
import { BudgetsService } from './budgets.service';

export class BudgetsController {
  constructor(private budgetsService: BudgetsService) {}

  async topUpController(
    request: FastifyRequest<{ Body: TopUpInput }>,
    reply: FastifyReply
  ) {
    try {
      const { advertiser_id, amount } = request.body;

      await this.budgetsService.topUpBalance(advertiser_id, amount);

      return reply.code(200).send({ message: 'Top-up successful' });
    } catch (error) {
      console.error(error);
      return reply.code(500).send({ message: 'Internal Server Error' });
    }
  }

  async getBudgetController(
    request: FastifyRequest<{ Params: GetBudgetParams }>,
    reply: FastifyReply
  ) {
    try {
      const { advertiser_id } = request.params;

      const budgetState = await this.budgetsService.getBudgetState(advertiser_id);

      if (!budgetState) {
        return reply.code(404).send({ message: 'Advertiser not found' });
      }

      return reply.code(200).send(budgetState);
    } catch (error) {
      console.error(error);
      return reply.code(500).send({ message: 'Internal Server Error' });
    }
  }
}
