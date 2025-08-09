import { z } from 'zod';

export const topUpSchema = z.object({
  advertiser_id: z.string(),
  amount: z.number().min(10000, 'Top-up amount must be at least $10,000'),
});

export type TopUpInput = z.infer<typeof topUpSchema>;
