import db from '@app/db';

export async function topUpBalance(advertiserId: string, amount: number) {
  // With the new schema, we directly increment the balance on the advertiser's main record.
  const result = await db('advertisers')
    .where({ id: advertiserId })
    .increment('balance', amount);

  // Check if any row was updated. If not, the advertiser was not found.
  if (result === 0) {
    throw new Error(`Advertiser with ID ${advertiserId} not found.`);
  }

  return result;
}