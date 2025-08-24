import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { Knex } from 'knex';
import { SpendController } from './spend.controller';
import { SpendService } from './spend.service';
import { SpendRepository } from './spend.repository';
import { BudgetsService } from '@app/features/budgets/budgets.service';
import { BudgetsRepository } from '@app/features/budgets/budgets.repository';
import { spendSchema } from './spend.validation';

export class SpendRoutes {
  constructor(private spendController: SpendController) {}

  async register(server: FastifyInstance) {
    server.post(
      '/spend',
      {
        schema: {
          body: spendSchema,
        },
      },
      this.spendController.spendController.bind(this.spendController)
    );
  }
}

// Factory function for clean dependency injection
export function createSpendRoutes(db: Knex): FastifyPluginAsync {
  return async (server: FastifyInstance) => {
    const spendRepository = new SpendRepository(db);
    const budgetsRepository = new BudgetsRepository(db);
    const budgetsService = new BudgetsService(budgetsRepository);
    const spendService = new SpendService(spendRepository, budgetsService);
    const spendController = new SpendController(spendService);
    const spendRoutes = new SpendRoutes(spendController);
    
    await spendRoutes.register(server);
  };
}
