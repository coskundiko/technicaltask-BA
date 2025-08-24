import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { Knex } from 'knex';
import { BudgetsController } from './budgets.controller';
import { BudgetsService } from './budgets.service';
import { BudgetsRepository } from './budgets.repository';
import { topUpSchema, getBudgetParamsSchema } from './budgets.validation';

export class BudgetsRoutes {
  constructor(private budgetsController: BudgetsController) {}

  async register(server: FastifyInstance) {
    server.post(
      '/topup',
      {
        schema: {
          body: topUpSchema,
        },
      },
      this.budgetsController.topUpController.bind(this.budgetsController)
    );

    server.get(
      '/:advertiser_id',
      {
        schema: {
          params: getBudgetParamsSchema,
        },
      },
      this.budgetsController.getBudgetController.bind(this.budgetsController)
    );
  }
}

// Factory function for clean dependency injection
export function createBudgetRoutes(db: Knex): FastifyPluginAsync {
  return async (server: FastifyInstance) => {
    const budgetsRepository = new BudgetsRepository(db);
    const budgetsService = new BudgetsService(budgetsRepository);
    const budgetsController = new BudgetsController(budgetsService);
    const budgetsRoutes = new BudgetsRoutes(budgetsController);
    
    await budgetsRoutes.register(server);
  };
}
