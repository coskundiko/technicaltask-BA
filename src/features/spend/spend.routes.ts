import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import db from '@app/db';
import { SpendController } from './spend.controller';
import { SpendService } from './spend.service';
import { SpendRepository } from './spend.repository';
import { BudgetsService } from '@app/features/budgets/budgets.service';
import { BudgetsRepository } from '@app/features/budgets/budgets.repository';
import { spendSchema, SpendInput } from './spend.validation';

async function spendRoutes(server: FastifyInstance) {
  // Initialize dependencies internally
  const spendRepository = new SpendRepository(db);
  const budgetsRepository = new BudgetsRepository(db);
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
    (request: FastifyRequest<{ Body: SpendInput }>, reply: FastifyReply) => 
      spendController.spendController(request, reply)
  );
}

export default spendRoutes;
