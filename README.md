# Ad Budget Manager (Software Engineering Challenge)

A backend service to manage advertiser ad budgets, as per the technical task instructions. It implements a system for daily budgets, rollovers, campaign submissions, and top-ups.

The implementation focuses on a clean architecture, clear API endpoints, and uses Docker for the database for easy development and testing.

## Approach

The backend is a web server using the Fastify framework. The core logic is implemented to handle budget and campaign management. The data is stored in a MySQL database.

Key decisions:
- Modular, feature-based architecture (`src/features`).
- Type-safe code with TypeScript.
- Knex.js for database query building.
- Zod for data validation.
- Containerized database with Docker.

---

## Core Dependencies

- **`fastify`**: The web framework used for routing and handling HTTP requests.
- **`knex`**: A SQL query builder for Node.js.
- **`mysql2`**: MySQL client for Node.js.
- **`zod`**: TypeScript-first schema declaration and validation library.
- **`dotenv`**: A zero-dependency module that loads environment variables from a `.env` file.
- **`@fastify/helmet`**: Helmet for Fastify.
- **`fastify-type-provider-zod`**: Type provider for Zod schemas in Fastify.

---

## File Structure

```
.
├── docker-compose.yml
├── package.json
├── README.md
├── tsconfig.json
└── src
    ├── features
    │   ├── budgets
    │   ├── campaigns
    │   ├── simulation
    │   └── spend
    ├── db
    │   ├── migrations
    │   └── seeds
    ├── config
    ├── server.ts
    └── index.ts
```

---

## API Endpoints

| Method | Path                      | Description                                  |
|--------|---------------------------|----------------------------------------------|
| `POST` | `/topup`                  | Tops up an advertiser's budget.              |
| `GET`  | `/budgets/:advertiser_id` | Returns the current budget for an advertiser.|
| `POST` | `/campaigns`              | Creates a new campaign.                      |
| `GET`  | `/campaigns`              | Returns all campaigns.                       |
| `POST` | `/simulate-day`           | Simulates a day of spending.                 |
| `POST` | `/spend`                  | Spends from a campaign's budget.             |

---

## How to Run

### Locally

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Start the database service:**
    ```bash
    docker compose up -d db
    ```

3.  **Run database migrations:**
    ```bash
    npm run knex migrate:latest
    ```

4.  **Seed the database with initial data:**
    ```bash
    npm run knex seed:run
    ```

5.  **Start the application in development mode:**
    ```bash
    npm run dev
    ```

The application will be available at `http://localhost:3000`.

