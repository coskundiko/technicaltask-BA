import fastify from 'fastify';
import helmet from '@fastify/helmet';
import budgetRoutes from './features/budgets/budgets.routes';
import campaignRoutes from './features/campaigns/campaigns.routes';
import simulationRoutes from './features/simulation/simulation.routes';
import spendRoutes from './features/spend/spend.routes';
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

  // Register our feature routes
  server.register(budgetRoutes, { prefix: '/api/budgets' });
  server.register(campaignRoutes, { prefix: '/api/campaigns' });
  server.register(simulationRoutes, { prefix: '/api' });
  server.register(spendRoutes, { prefix: '/api' });

  return server;
}

export default buildServer;