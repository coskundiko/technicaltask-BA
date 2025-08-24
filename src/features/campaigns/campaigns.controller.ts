import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateCampaignInput } from './campaigns.validation';
import { CampaignsService } from './campaigns.service';

export class CampaignsController {
  constructor(private campaignsService: CampaignsService) {}

  async createCampaignController(
    request: FastifyRequest<{ Body: CreateCampaignInput }>,
    reply: FastifyReply
  ) {
    try {
      const { advertiser_id, campaign_name, cost } = request.body;

      const result = await this.campaignsService.submitCampaign(advertiser_id, campaign_name, cost);

      return reply.code(200).send(result);
    } catch (error) {
      console.error(error);
      return reply.code(500).send({ message: 'Internal Server Error' });
    }
  }

  async getCampaignsController(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const campaigns = await this.campaignsService.getCampaigns();
      return reply.code(200).send(campaigns);
    } catch (error) {
      console.error(error);
      return reply.code(500).send({ message: 'Internal Server Error' });
    }
  }
}
