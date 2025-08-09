import { FastifyRequest, FastifyReply } from 'fastify';
import { CreateCampaignInput } from './campaigns.validation';
import { submitCampaign, getCampaigns } from './campaigns.service';

export async function createCampaignController(
  request: FastifyRequest<{ Body: CreateCampaignInput }>,
  reply: FastifyReply
) {
  try {
    const { advertiser_id, campaign_name, cost } = request.body;

    const result = await submitCampaign(advertiser_id, campaign_name, cost);

    return reply.code(200).send(result);
  } catch (error) {
    console.error(error);
    return reply.code(500).send({ message: 'Internal Server Error' });
  }
}

export async function getCampaignsController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const campaigns = await getCampaigns();
    return reply.code(200).send(campaigns);
  } catch (error) {
    console.error(error);
    return reply.code(500).send({ message: 'Internal Server Error' });
  }
}
