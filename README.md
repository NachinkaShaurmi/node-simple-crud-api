# Simple CRUD API

This project implements a simple CRUD API for managing user records using an in-memory database, built with TypeScript and Node.js. It supports basic HTTP operations, horizontal scaling with a load balancer, and includes tests.

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd <repository-folder>
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

## Scripts

The following npm scripts are available in `package.json`:

- **`npm run build`**  
  Compiles TypeScript files to JavaScript, outputting to the `dist/` directory using `tsc`.

- **`npm run start`**  
  Runs the application in development mode with hot reloading using `nodemon` and `ts-node-dev`, starting the server at `src/server.ts`.

- **`npm run start:dev`**  
  Alias for `npm run start`, running the server in development mode.

- **`npm run start:prod`**  
  Builds the project (`npm run build`) and runs the compiled JavaScript file (`dist/server.js`) in production mode.

- **`npm run start:multi`**  
  Starts the application in cluster mode using `ts-node src/cluster.ts`, running a load balancer on port 4000 and workers on ports 4001+.

- **`npm run format`**  
  Formats all TypeScript files in `src/` using Prettier.

- **`npm run test`**  
  Runs the test suite using Jest to verify API functionality.

## Usage

- **Development**: Start the server with hot reloading:
  ```bash
  npm run start:dev
  ```
- **Production**: Build and run the compiled application:
  ```bash
  npm run start:prod
  ```
- **Cluster Mode**: Run with load balancing across multiple workers:
  ```bash
  npm run start:multi
  ```
- **Testing**: Execute the test suite:
  ```bash
  npm run test
  ```

## API Endpoints

- `GET /api/users`: Retrieve all users.
- `GET /api/users/:userId`: Retrieve a user by ID.
- `POST /api/users`: Create a new user.
- `PUT /api/users/:userId`: Update an existing user.
- `DELETE /api/users/:userId`: Delete a user.
