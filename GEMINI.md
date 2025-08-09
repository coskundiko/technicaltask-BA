# Project: Ad Budget Manager

This project is a backend service to manage advertiser ad budgets, as per the technical task instructions. It implements a system for daily budgets, rollovers, campaign submissions, and top-ups.

The implementation follows modern backend development best practices to showcase expertise, including:
- **TypeScript** for robust, type-safe code.
- **Fastify** as the high-performance web framework.
- **Docker and Docker Compose** for a containerized, reproducible environment.
- **MySQL** as the relational database.
- **Knex.js** as the SQL query builder.
- **Zod** for declarative data validation.
- **Fastify Type Provider Zod** for seamless Zod integration with Fastify.
- A feature-based, scalable project architecture.

---

## Development Plan

**Phase 1: Foundation & Setup**
1.  [x] Docker Environment (`Dockerfile`, `docker-compose.yml`)
2.  [x] TypeScript Project (`npm init`, initial dependencies)
3.  [x] Dependency Swap (Express -> Fastify)
4.  [x] TypeScript Config (`tsconfig.json`)
5.  [x] Project Structure (`src` folder, feature modules)
6.  [x] Knex Setup (`knexfile.ts`, initial migration)
7.  [x] Core Server (`src/app.ts` with Fastify plugins)

**Phase 2: Feature & API Endpoint Implementation**
1.  [x] `POST /topup`
2.  [x] `GET /budgets/:advertiser_id`
3.  [ ] `POST /campaigns`
4.  [ ] `POST /simulate-day`
5.  [ ] `GET /campaigns`

**Phase 3: Documentation**
1.  [ ] Update `README.md` with setup and usage instructions.

---

## Setup Commands Log

This section documents the commands used to set up the initial project structure and dependencies.

1.  **Initialize Node.js Project**
    ```bash
    npm init -y
    ```
    *Reason: Initializes the Node.js project.*

2.  **Create `.gitignore`**
    *Reason: Ignores files that shouldn't be in version control.*

3.  **Initial Docker Test**
    ```bash
    docker compose up --build
    ```
    *Reason: Tests the Docker configuration. The expected build failure confirmed the setup.*

4.  **Install Dependencies**
    ```bash
    npm install knex mysql2 zod dotenv fastify @fastify/helmet fastify-type-provider-zod
    npm install --save-dev typescript @types/node ts-node
    ```
    *Reason: Installs the final production and development dependencies.*

5.  **Create Knex Directories**
    ```bash
    mkdir -p src/db/migrations src/db/seeds
    ```
    *Reason: Creates directories for database migration and seed files.*

6.  **Move knexfile.ts to src/**
    *Reason: Organizes the knexfile within the source directory.*

7.  **Create New Migrations**
    ```bash
    npm run knex migrate:make create_advertisers_table
    npm run knex migrate:make create_budgets_table
    npm run knex migrate:make create_campaigns_table
    ```
    *Reason: Creates separate migration files for each table.*

8.  **Create New Seed File**
    ```bash
    npm run knex seed:make initial_data
    ```
    *Reason: Creates a new seed file for test data.*

9.  **Start Database Service**
    ```bash
    docker compose up -d db
    ```
    *Reason: Starts the database container in the background to allow for migrations.*

10. **Run Database Migrations**
    ```bash
    npm run knex migrate:latest
    ```
    *Reason: Applies the migrations to create the database schema.*

11. **Run Database Seed**
    ```bash
    npm run knex seed:run
    ```
    *Reason: Populates the database with initial test data.*