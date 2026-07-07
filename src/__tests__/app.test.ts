import { describe, expect, it, vi, afterEach } from 'vitest';
import { createApp } from '../server.js';
import { setMeshSDKForTests } from '../mesh/getMeshSDK.js';
import { mapNearEarthObjectFeed } from '../mappers/nearEarthObjectsMapper.js';

function graphqlRequest(query: string, variables?: Record<string, unknown>, client = 'test-client') {
  const app = createApp();
  return app.fetch('http://localhost/graphql', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      client,
    },
    body: JSON.stringify({ query, variables }),
  });
}

afterEach(() => {
  setMeshSDKForTests(null);
  vi.restoreAllMocks();
});

describe('request validation', () => {
  it('rejects requests without a client header', async () => {
    const app = createApp();
    const response = await app.fetch('http://localhost/graphql', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ query: '{ address(username: "demo") { city } }' }),
    });

    const body = await response.json();
    expect(body.errors[0].message).toBe('Missing required header: client');
  });

  it('allows queries for strata client', async () => {
    const response = await graphqlRequest('{ address(username: "demo") { city state } }', undefined, 'strata');
    const body = await response.json();

    expect(body.errors).toBeUndefined();
    expect(body.data.address.state).toBe('OH');
  });

  it('rejects mutations for strata client', async () => {
    const response = await graphqlRequest(
      'mutation { createAddress(username: "blocked", address: { street: "1 Main", city: "Town", state: "CA", zipcode: "90001" }) { city } }',
      undefined,
      'strata',
    );
    const body = await response.json();

    expect(body.errors[0].message).toBe('Client strata is not allowed to run mutations');
  });
});

describe('address', () => {
  it('returns address with state', async () => {
    const response = await graphqlRequest('{ address(username: "demo") { street city state zipcode } }');
    const body = await response.json();

    expect(body.data.address).toEqual({
      street: '123 Street St.',
      city: 'Sometown',
      state: 'OH',
      zipcode: '43215',
    });
  });

  it('creates a new address without overwriting existing records', async () => {
    const username = `new-user-${Date.now()}`;
    const mutation = `
      mutation CreateAddress($username: String!) {
        createAddress(
          username: $username,
          address: { street: "500 Market", city: "San Francisco", state: "CA", zipcode: "94105" }
        ) {
          street
          city
          state
          zipcode
        }
      }
    `;

    const mutationResponse = await graphqlRequest(mutation, { username });
    const mutationBody = await mutationResponse.json();
    expect(mutationBody.data.createAddress.state).toBe('CA');

    const queryResponse = await graphqlRequest('{ address(username: "demo") { city state } }');
    const queryBody = await queryResponse.json();
    expect(queryBody.data.address).toEqual({ city: 'Sometown', state: 'OH' });
  });
});

describe('logging and response metadata', () => {
  it('logs requestId and client', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    await graphqlRequest('{ address(username: "demo") { city } }', undefined, 'my-client');

    const logEntry = JSON.parse(String(consoleSpy.mock.calls[0][0]));
    expect(logEntry.client).toBe('my-client');
    expect(logEntry.requestId).toEqual(expect.any(String));
  });

  it('adds requestId to the response metadata', async () => {
    const response = await graphqlRequest('{ address(username: "demo") { city } }');
    const body = await response.json();

    expect(body.metadata.requestId).toEqual(expect.any(String));
  });
});

describe('nearEarthObjects', () => {
  it('calls the Mesh SDK and maps the NASA response', async () => {
    const sdk = {
      neoFeed: vi.fn().mockResolvedValue({
        element_count: 1,
        near_earth_objects: {
          '2015-09-07': [
            {
              id: '1',
              name: 'Asteroid One',
              is_potentially_hazardous_asteroid: false,
              estimated_diameter: {
                kilometers: {
                  estimated_diameter_min: 0.1,
                  estimated_diameter_max: 0.2,
                },
              },
              close_approach_data: [
                {
                  close_approach_date: '2015-09-07',
                  relative_velocity: { kilometers_per_hour: '1000' },
                  miss_distance: { kilometers: '2000' },
                },
              ],
            },
          ],
        },
      }),
    };
    setMeshSDKForTests(sdk);

    const response = await graphqlRequest('{ nearEarthObjects(startDate: "2015-09-07", endDate: "2015-09-08") { elementCount objects { id name isPotentiallyHazardousAsteroid estimatedDiameterMinKm estimatedDiameterMaxKm closeApproachDate relativeVelocityKph missDistanceKm } } }');
    const body = await response.json();

    expect(sdk.neoFeed).toHaveBeenCalledWith({
      start_date: '2015-09-07',
      end_date: '2015-09-08',
      api_key: 'DEMO_KEY',
    });
    expect(body.data.nearEarthObjects.objects[0]).toEqual({
      id: '1',
      name: 'Asteroid One',
      isPotentiallyHazardousAsteroid: false,
      estimatedDiameterMinKm: 0.1,
      estimatedDiameterMaxKm: 0.2,
      closeApproachDate: '2015-09-07',
      relativeVelocityKph: '1000',
      missDistanceKm: '2000',
    });
  });

  it('flattens date keyed near earth objects', () => {
    const mapped = mapNearEarthObjectFeed({
      element_count: 2,
      near_earth_objects: {
        '2015-09-07': [{ id: '1' }],
        '2015-09-08': [{ id: '2' }],
      },
    });

    expect(mapped.objects.map(object => object.id)).toEqual(['1', '2']);
  });
});
