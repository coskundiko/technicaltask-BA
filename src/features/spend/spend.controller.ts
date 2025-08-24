import { FastifyRequest, FastifyReply } from 'fastify';
import { SpendInput } from './spend.validation';
import { SpendService } from './spend.service';

export class SpendController {
  constructor(private spendService: SpendService) {}

  async spendController(
    request: FastifyRequest<{ Body: SpendInput }>,
    reply: FastifyReply
  ) {
    try {
      const { advertiser_id, amount } = request.body;

      const result = await this.spendService.processSpend(advertiser_id, amount);

      return reply.code(200).send(result);
    } catch (error) {
      console.error(error);
      return reply.code(500).send({ message: 'Internal Server Error' });
    }
  }
}
