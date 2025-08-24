import { FastifyInstance } from 'fastify';
import { CampaignsController } from './campaigns.controller';
import { CampaignsService } from './campaigns.service';
import { CampaignsRepository } from './campaigns.repository';
import { BudgetsService } from '@app/features/budgets/budgets.service';
import { BudgetsRepository } from '@app/features/budgets/budgets.repository';
import { createCampaignSchema } from './campaigns.validation';

async function campaignRoutes(server: FastifyInstance) {
  // Initialize dependencies internally
  const campaignsRepository = new CampaignsRepository();
  const budgetsRepository = new BudgetsRepository();
  const budgetsService = new BudgetsService(budgetsRepository);
  const campaignsService = new CampaignsService(campaignsRepository, budgetsService);
  const campaignsController = new CampaignsController(campaignsService);

  server.post(
    '/',
    {
      schema: {
        body: createCampaignSchema,
      },
    },
    campaignsController.createCampaignController
  );

  server.get(
    '/',
    campaignsController.getCampaignsController
  );
}

export default campaignRoutes;
