import { z } from 'zod';

export const topUpSchema = z.object({
  advertiser_id: z.string(), // Changed back to string
  amount: z.number().min(10000, 'Top-up amount must be at least $10,000'),
});

export const getBudgetParamsSchema = z.object({
  advertiser_id: z.string(), // Changed back to string
});

export type TopUpInput = z.infer<typeof topUpSchema>;
export type GetBudgetParams = z.infer<typeof getBudgetParamsSchema>;
