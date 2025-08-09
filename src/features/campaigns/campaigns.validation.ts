import { z } from 'zod';

export const createCampaignSchema = z.object({
  advertiser_id: z.string(),
  campaign_name: z.string(),
  cost: z.number().positive('Cost must be a positive number'),
});

export type CreateCampaignInput = z.infer<typeof createCampaignSchema>;
