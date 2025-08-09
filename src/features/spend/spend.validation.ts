import { z } from 'zod';

export const spendSchema = z.object({
  advertiser_id: z.string(),
  amount: z.number().positive('Amount must be a positive number'),
  reason: z.string().optional(),
});

export type SpendInput = z.infer<typeof spendSchema>;
