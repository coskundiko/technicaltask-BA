import { FastifyRequest, FastifyReply } from 'fastify';
import { simulateDay } from './simulation.service';

export async function simulateDayController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const result = await simulateDay();
    return reply.code(200).send(result);
  } catch (error) {
    console.error(error);
    return reply.code(500).send({ message: 'Internal Server Error' });
  }
}
