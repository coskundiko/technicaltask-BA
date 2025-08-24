import { FastifyInstance } from 'fastify';
import { SpendController } from './spend.controller';
import { SpendService } from './spend.service';
import { SpendRepository } from './spend.repository';
import { BudgetsService } from '@app/features/budgets/budgets.service';
import { BudgetsRepository } from '@app/features/budgets/budgets.repository';
import { spendSchema } from './spend.validation';

async function spendRoutes(server: FastifyInstance) {
  // Initialize dependencies internally
  const spendRepository = new SpendRepository();
  const budgetsRepository = new BudgetsRepository();
  const budgetsService = new BudgetsService(budgetsRepository);
  const spendService = new SpendService(spendRepository, budgetsService);
  const spendController = new SpendController(spendService);

  server.post(
    '/spend',
    {
      schema: {
        body: spendSchema,
      },
    },
    spendController.spendController
  );
}

export default spendRoutes;
