import { FastifyRequest, FastifyReply } from 'fastify';
import { TopUpInput } from './budgets.validation';
import { topUpBalance } from './budgets.service';

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
