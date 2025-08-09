import { FastifyInstance } from 'fastify';
import { spendController } from './spend.controller';
import { spendSchema } from './spend.validation';

async function spendRoutes(server: FastifyInstance) {
  server.post(
    '/spend',
    {
      schema: {
        body: spendSchema,
      },
    },
    spendController
  );
}

export default spendRoutes;
