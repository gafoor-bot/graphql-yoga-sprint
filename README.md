# GraphQL Yoga Sprint

A TypeScript-based GraphQL API built with **GraphQL Yoga**. This project demonstrates GraphQL queries, mutations, request validation, logging, request metadata, and unit testing as part of a sprint-style coding assignment.

---

## Features

- GraphQL Yoga server
- TypeScript implementation
- Query and Mutation support
- Address management using a JSON data source
- Request validation using Envelop plugins
- Request ID generation for every request
- Structured logging with request metadata
- Client header validation
- Response metadata containing the request ID
- Unit tests

---

## Technologies Used

- TypeScript
- Node.js
- GraphQL
- GraphQL Yoga
- Envelop Plugins
- Vitest

---

## Project Structure

```
src/
│
├── server.ts                 # Application entry point
├── schema/                   # GraphQL schema and resolvers
├── resolvers/                # GraphQL resolver implementations
├── plugins/                  # Envelop plugins
├── logger/                   # Logger implementation
├── types/                    # TypeScript types
└── data/
    └── addresses.json        # Sample data
```

---

## Installation

Clone the repository:

```bash
git clone https://github.com/<your-username>/graphic-yoga-sprint.git
```

Navigate to the project:

```bash
cd graphic-yoga-sprint
```

Install dependencies:

```bash
npm install
```

---

## Running the Application

Start the development server:

```bash
npm run dev
```

The server will be available at:

```
http://localhost:4000/graphql
```

---

## Running Tests

Execute unit tests:

```bash
npm test
```

---

## Example Request

### Query

```graphql
query {
  address(username: "john") {
    street
    city
    state
    zipcode
  }
}
```

### Mutation

```graphql
mutation {
  createAddress(
    username: "mary"
    address: {
      street: "1 Main St"
      city: "Columbus"
      state: "OH"
      zipcode: "43004"
    }
  ) {
    street
    city
    state
    zipcode
  }
}
```

---

## Required Headers

All requests must include the `client` header.

Example:

```json
{
  "client": "web"
}
```

Business Rule:

- Requests without the `client` header are rejected.
- Client value `strata` is allowed to execute queries but is not permitted to execute mutations.

---

## Response Metadata

Each successful response includes metadata containing the generated request ID.

Example:

```json
{
  "data": {
    ...
  },
  "metadata": {
    "requestId": "77e441c6-18f4-4d86-834b-54c286ca28cc"
  }
}
```

---

## Logging

Every request generates a unique request ID.

Application logs include:

- Request ID
- Client header
- Log level
- Message

This makes request tracing and debugging easier.

---

## Assignment Overview

This project includes implementations for:

- Added `state` to the Address schema and TypeScript types
- Implemented `createAddress` mutation
- Added required `client` header validation
- Restricted mutations for the `strata` client
- Generated request IDs for each request
- Included request ID and client information in logs
- Returned request metadata in GraphQL responses
- Added unit tests

---

## Author

**Gafoor Shaik**

GitHub: https://github.com/gafoor9948
