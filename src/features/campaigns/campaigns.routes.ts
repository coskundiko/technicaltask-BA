import { FastifyInstance } from 'fastify';
import { createCampaignController, getCampaignsController } from './campaigns.controller';
import { createCampaignSchema } from './campaigns.validation';

async function campaignRoutes(server: FastifyInstance) {
  server.post(
    '/',
    {
      schema: {
        body: createCampaignSchema,
      },
    },
    createCampaignController
  );

  server.get(
    '/',
    getCampaignsController
  );
}

export default campaignRoutes;
