import { createServer } from 'node:http';
import { createSchema, createYoga } from 'graphql-yoga';
import { typeDefs } from './schema/typeDefs.js';
import { resolvers } from './resolvers/index.js';
import { useRequestMetadata } from './plugins/requestMetadataPlugin.js';

export function createApp() {
  return createYoga({
    schema: createSchema({ typeDefs, resolvers }),
    plugins: [useRequestMetadata()],
    maskedErrors: false,
  });
}

if (process.env.NODE_ENV !== 'test') {
  const yoga = createApp();
  const server = createServer(yoga);
  const port = Number(process.env.PORT ?? 4000);

  server.listen(port, () => {
    console.log(`GraphQL Yoga server is running at http://localhost:${port}/graphql`);
  });
}
