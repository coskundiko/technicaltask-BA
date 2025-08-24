import { FastifyRequest, FastifyReply } from 'fastify';
import { SimulationService } from './simulation.service';

export class SimulationController {
  constructor(private simulationService: SimulationService) {}

  async simulateDayController(
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    try {
      const result = await this.simulationService.simulateDay();
      return reply.code(200).send(result);
    } catch (error) {
      console.error(error);
      return reply.code(500).send({ message: 'Internal Server Error' });
    }
  }
}
