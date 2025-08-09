import { FastifyInstance } from 'fastify';
import { simulateDayController } from './simulation.controller';

async function simulationRoutes(server: FastifyInstance) {
  server.post(
    '/simulate-day',
    simulateDayController
  );
}

export default simulationRoutes;
