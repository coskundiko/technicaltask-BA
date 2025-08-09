import { FastifyRequest, FastifyReply } from 'fastify';
import { SpendInput } from './spend.validation';
import { processSpend } from './spend.service';

export async function spendController(
  request: FastifyRequest<{ Body: SpendInput }>,
  reply: FastifyReply
) {
  try {
    const { advertiser_id, amount } = request.body;

    const result = await processSpend(advertiser_id, amount);

    return reply.code(200).send(result);
  } catch (error) {
    console.error(error);
    return reply.code(500).send({ message: 'Internal Server Error' });
  }
}
