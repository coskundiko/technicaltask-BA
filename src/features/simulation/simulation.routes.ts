import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { Knex } from 'knex';
import { SimulationController } from './simulation.controller';
import { SimulationService } from './simulation.service';
import { BudgetsRepository } from '@app/features/budgets/budgets.repository';
import { CampaignsRepository } from '@app/features/campaigns/campaigns.repository';

export class SimulationRoutes {
  constructor(private simulationController: SimulationController) {}

  async register(server: FastifyInstance) {
    server.post(
      '/simulate-day',
      this.simulationController.simulateDayController.bind(this.simulationController)
    );
  }
}

// Factory function for clean dependency injection
export function createSimulationRoutes(db: Knex): FastifyPluginAsync {
  return async (server: FastifyInstance) => {
    const budgetsRepository = new BudgetsRepository(db);
    const campaignsRepository = new CampaignsRepository(db);
    const simulationService = new SimulationService(db, budgetsRepository, campaignsRepository);
    const simulationController = new SimulationController(simulationService);
    const simulationRoutes = new SimulationRoutes(simulationController);
    
    await simulationRoutes.register(server);
  };
}
