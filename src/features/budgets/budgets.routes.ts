import { FastifyInstance } from 'fastify';
import { BudgetsController } from './budgets.controller';
import { BudgetsService } from './budgets.service';
import { BudgetsRepository } from './budgets.repository';
import { topUpSchema, getBudgetParamsSchema } from './budgets.validation';

async function budgetRoutes(server: FastifyInstance) {
  // Initialize dependencies internally
  const budgetsRepository = new BudgetsRepository();
  const budgetsService = new BudgetsService(budgetsRepository);
  const budgetsController = new BudgetsController(budgetsService);

  server.post(
    '/topup',
    {
      schema: {
        body: topUpSchema,
      },
    },
    budgetsController.topUpController
  );

  server.get(
    '/:advertiser_id',
    {
      schema: {
        params: getBudgetParamsSchema,
      },
    },
    budgetsController.getBudgetController
  );
}

export default budgetRoutes;
