export const typeDefs = /* GraphQL */ `
  type Address {
    street: String!
    city: String!
    state: String!
    zipcode: String!
  }

  input AddressInput {
    street: String!
    city: String!
    state: String!
    zipcode: String!
  }

  type NearEarthObjectFeed {
    elementCount: Int
    objects: [NearEarthObject]
  }

  type NearEarthObject {
    id: String
    name: String
    isPotentiallyHazardousAsteroid: Boolean
    estimatedDiameterMinKm: Float
    estimatedDiameterMaxKm: Float
    closeApproachDate: String
    relativeVelocityKph: String
    missDistanceKm: String
  }

  type Query {
    address(username: String!): Address
    nearEarthObjects(startDate: String!, endDate: String!): NearEarthObjectFeed
  }

  type Mutation {
    createAddress(username: String!, address: AddressInput!): Address!
  }
`;
