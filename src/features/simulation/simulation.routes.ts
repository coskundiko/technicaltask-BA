import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import db from '@app/db';
import { SimulationController } from './simulation.controller';
import { SimulationService } from './simulation.service';
import { BudgetsRepository } from '@app/features/budgets/budgets.repository';
import { CampaignsRepository } from '@app/features/campaigns/campaigns.repository';

async function simulationRoutes(server: FastifyInstance) {
  // Initialize dependencies internally
  const budgetsRepository = new BudgetsRepository(db);
  const campaignsRepository = new CampaignsRepository(db);
  const simulationService = new SimulationService(db, budgetsRepository, campaignsRepository);
  const simulationController = new SimulationController(simulationService);

  server.post(
    '/simulate-day',
    (request: FastifyRequest, reply: FastifyReply) => 
      simulationController.simulateDayController(request, reply)
  );
}

export default simulationRoutes;
