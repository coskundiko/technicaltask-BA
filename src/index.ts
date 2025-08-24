import fastify from 'fastify';
import helmet from '@fastify/helmet';
import db from '@app/db';

// Import route factories
import { createBudgetRoutes } from '@app/features/budgets/budgets.routes';
import { createCampaignRoutes } from '@app/features/campaigns/campaigns.routes';
import { createSimulationRoutes } from '@app/features/simulation/simulation.routes';
import { createSpendRoutes } from '@app/features/spend/spend.routes';

import {
  serializerCompiler,
  validatorCompiler,
} from 'fastify-type-provider-zod';

/**
 * This function builds and configures our Fastify server.
 * It's kept separate from the file that starts the server
 * to make testing easier.
 */
function buildServer() {
  // Initialize the server with default logging enabled.
  const server = fastify({
    logger: true,
  });

  // Add Zod validation and serialization
  server.setValidatorCompiler(validatorCompiler);
  server.setSerializerCompiler(serializerCompiler);

  // The helmet plugin adds important security headers to every response.
  server.register(helmet);

  // This is our simple health check route.
  server.get('/healthcheck', async () => {
    return { status: 'ok' };
  });

  // Register our feature routes with dependency injection handled internally
  server.register(createBudgetRoutes(db), { prefix: '/api/budgets' });
  server.register(createCampaignRoutes(db), { prefix: '/api/campaigns' });
  server.register(createSimulationRoutes(db), { prefix: '/api' });
  server.register(createSpendRoutes(db), { prefix: '/api' });

  return server;
}

export default buildServer;