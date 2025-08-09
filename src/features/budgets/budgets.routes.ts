import { FastifyInstance } from 'fastify';
import { topUpController } from './budgets.controller';
import { topUpSchema } from './budgets.validation';

async function budgetRoutes(server: FastifyInstance) {
  server.post(
    '/topup',
    {
      schema: {
        body: topUpSchema,
      },
    },
    topUpController
  );
}

export default budgetRoutes;
