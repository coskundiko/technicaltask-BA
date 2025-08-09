import { FastifyInstance } from 'fastify';
import { topUpController, getBudgetController } from './budgets.controller';
import { topUpSchema, getBudgetParamsSchema } from './budgets.validation';
// Removed: import { zodToJsonSchema } from 'zod-to-json-schema';

async function budgetRoutes(server: FastifyInstance) {
  server.post(
    '/topup',
    {
      schema: {
        body: topUpSchema, // Changed from topUpSchema.body
      },
    },
    topUpController
  );

  server.get(
    '/:advertiser_id',
    {
      schema: {
        params: getBudgetParamsSchema,
      },
    },
    getBudgetController
  );
}

export default budgetRoutes;
