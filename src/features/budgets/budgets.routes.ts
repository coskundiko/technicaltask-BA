import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import db from '@app/db';
import { BudgetsController } from './budgets.controller';
import { BudgetsService } from './budgets.service';
import { BudgetsRepository } from './budgets.repository';
import { topUpSchema, getBudgetParamsSchema, TopUpInput, GetBudgetParams } from './budgets.validation';

async function budgetRoutes(server: FastifyInstance) {
  // Initialize dependencies internally
  const budgetsRepository = new BudgetsRepository(db);
  const budgetsService = new BudgetsService(budgetsRepository);
  const budgetsController = new BudgetsController(budgetsService);

  server.post(
    '/topup',
    {
      schema: {
        body: topUpSchema,
      },
    },
    (request: FastifyRequest<{ Body: TopUpInput }>, reply: FastifyReply) => 
      budgetsController.topUpController(request, reply)
  );

  server.get(
    '/:advertiser_id',
    {
      schema: {
        params: getBudgetParamsSchema,
      },
    },
    (request: FastifyRequest<{ Params: GetBudgetParams }>, reply: FastifyReply) => 
      budgetsController.getBudgetController(request, reply)
  );
}

export default budgetRoutes;
