import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { Knex } from 'knex';
import { CampaignsController } from './campaigns.controller';
import { CampaignsService } from './campaigns.service';
import { CampaignsRepository } from './campaigns.repository';
import { BudgetsService } from '@app/features/budgets/budgets.service';
import { BudgetsRepository } from '@app/features/budgets/budgets.repository';
import { createCampaignSchema } from './campaigns.validation';

export class CampaignsRoutes {
  constructor(private campaignsController: CampaignsController) {}

  async register(server: FastifyInstance) {
    server.post(
      '/',
      {
        schema: {
          body: createCampaignSchema,
        },
      },
      this.campaignsController.createCampaignController.bind(this.campaignsController)
    );

    server.get(
      '/',
      this.campaignsController.getCampaignsController.bind(this.campaignsController)
    );
  }
}

// Factory function for clean dependency injection
export function createCampaignRoutes(db: Knex): FastifyPluginAsync {
  return async (server: FastifyInstance) => {
    const campaignsRepository = new CampaignsRepository(db);
    const budgetsRepository = new BudgetsRepository(db);
    const budgetsService = new BudgetsService(budgetsRepository);
    const campaignsService = new CampaignsService(campaignsRepository, budgetsService);
    const campaignsController = new CampaignsController(campaignsService);
    const campaignsRoutes = new CampaignsRoutes(campaignsController);
    
    await campaignsRoutes.register(server);
  };
}
