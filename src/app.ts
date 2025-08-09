import fastify from 'fastify';
import helmet from '@fastify/helmet';

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

  // The helmet plugin adds important security headers to every response.
  server.register(helmet);

  // This is our simple health check route.
  server.get('/healthcheck', async () => {
    return { status: 'ok' };
  });

  return server;
}

export default buildServer;
