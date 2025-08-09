import { FastifyRequest, FastifyReply } from 'fastify';
import { TopUpInput, GetBudgetParams } from './budgets.validation';
import { topUpBalance, getBudgetState } from './budgets.service';

export async function topUpController(
  request: FastifyRequest<{ Body: TopUpInput }>,
  reply: FastifyReply
) {
  try {
    const { advertiser_id, amount } = request.body;

    await topUpBalance(advertiser_id, amount);

    return reply.code(200).send({ message: 'Top-up successful' });
  } catch (error) {
    console.error(error);
    return reply.code(500).send({ message: 'Internal Server Error' });
  }
}

export async function getBudgetController(
  request: FastifyRequest<{ Params: GetBudgetParams }>,
  reply: FastifyReply
) {
  try {
    const { advertiser_id } = request.params;

    const budgetState = await getBudgetState(advertiser_id);

    if (!budgetState) {
      return reply.code(404).send({ message: 'Advertiser not found' });
    }

    return reply.code(200).send(budgetState);
  } catch (error) {
    console.error(error);
    return reply.code(500).send({ message: 'Internal Server Error' });
  }
}
