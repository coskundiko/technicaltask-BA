import { FastifyInstance } from 'fastify';
import { SimulationController } from './simulation.controller';
import { SimulationService } from './simulation.service';
import { BudgetsRepository } from '@app/features/budgets/budgets.repository';
import { CampaignsRepository } from '@app/features/campaigns/campaigns.repository';

async function simulationRoutes(server: FastifyInstance) {
  // Initialize dependencies internally
  const budgetsRepository = new BudgetsRepository();
  const campaignsRepository = new CampaignsRepository();
  const simulationService = new SimulationService(budgetsRepository, campaignsRepository);
  const simulationController = new SimulationController(simulationService);

  server.post(
    '/simulate-day',
    simulationController.simulateDayController
  );
}

export default simulationRoutes;
