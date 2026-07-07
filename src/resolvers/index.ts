import { addressRepository } from '../repositories/addressRepository.js';
import type { GraphQLContext } from '../types/context.js';
import { getMeshSDK } from '../mesh/getMeshSDK.js';
import { mapNearEarthObjectFeed } from '../mappers/nearEarthObjectsMapper.js';

export const resolvers = {
  Query: {
    address: async (_parent: unknown, args: { username: string }, context: GraphQLContext) => {
      context.logger.info('Fetching address');
      return addressRepository.getByUsername(args.username);
    },
    nearEarthObjects: async (
      _parent: unknown,
      args: { startDate: string; endDate: string },
      context: GraphQLContext,
    ) => {
      context.logger.info('Fetching near earth objects');
      const sdk = await getMeshSDK();
      const response = await sdk.neoFeed({
        start_date: args.startDate,
        end_date: args.endDate,
        api_key: 'DEMO_KEY',
      });

      return mapNearEarthObjectFeed(response);
    },
  },
  Mutation: {
    createAddress: async (
      _parent: unknown,
      args: { username: string; address: any },
      context: GraphQLContext,
    ) => {
      context.logger.info('Creating address');
      return addressRepository.create(args.username, args.address);
    },
  },
};
