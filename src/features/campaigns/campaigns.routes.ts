import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import db from '@app/db';
import { CampaignsController } from './campaigns.controller';
import { CampaignsService } from './campaigns.service';
import { CampaignsRepository } from './campaigns.repository';
import { BudgetsService } from '@app/features/budgets/budgets.service';
import { BudgetsRepository } from '@app/features/budgets/budgets.repository';
import { createCampaignSchema, CreateCampaignInput } from './campaigns.validation';

async function campaignRoutes(server: FastifyInstance) {
  // Initialize dependencies internally
  const campaignsRepository = new CampaignsRepository(db);
  const budgetsRepository = new BudgetsRepository(db);
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
    (request: FastifyRequest<{ Body: CreateCampaignInput }>, reply: FastifyReply) => 
      campaignsController.createCampaignController(request, reply)
  );

  server.get(
    '/',
    (request: FastifyRequest, reply: FastifyReply) => 
      campaignsController.getCampaignsController(request, reply)
  );
}

export default campaignRoutes;
