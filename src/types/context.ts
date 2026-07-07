import type { AppLogger } from '../logger/logger.js';

export type GraphQLContext = {
  request: Request;
  requestId: string;
  client: string;
  logger: AppLogger;
};
