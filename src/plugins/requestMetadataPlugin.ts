import { randomUUID } from 'node:crypto';
import { GraphQLError } from 'graphql';
import { baseLogger } from '../logger/logger.js';

function getOperationType(document: any): string | undefined {
  return document?.definitions?.find((definition: any) => definition.kind === 'OperationDefinition')?.operation;
}

export function useRequestMetadata() {
  return {
    onContextBuilding({ context, extendContext }: any) {
      const request = context.request as Request | undefined;
      const client = request?.headers.get('client');

      if (!client) {
        throw new GraphQLError('Missing required header: client', {
          extensions: { code: 'BAD_REQUEST' },
        });
      }

      const requestId = randomUUID();
      const logger = baseLogger.child({ requestId, client });

      extendContext({ requestId, client, logger });
    },
    onExecute({ args }: any) {
      const operationType = getOperationType(args.document);

      if (args.contextValue.client === 'strata' && operationType === 'mutation') {
        throw new GraphQLError('Client strata is not allowed to run mutations', {
          extensions: { code: 'FORBIDDEN' },
        });
      }
    },
    onExecutionResult({ context, result, setResult }: any) {
      if (!result || Symbol.asyncIterator in Object(result)) {
        return;
      }

      setResult({
        ...result,
        metadata: {
          requestId: context.requestId,
        },
      });
    },
  };
}
