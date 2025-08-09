import buildServer from './app';
import { config } from './config';

const server = buildServer();

async function start() {
  try {
    await server.listen({ port: Number(config.port), host: '0.0.0.0' });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

start();
