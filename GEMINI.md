# Project: Ad Budget Manager

This project is a backend service to manage advertiser ad budgets, as per the technical task instructions. It implements a system for daily budgets, rollovers, campaign submissions, and top-ups.

The implementation follows modern backend development best practices to showcase expertise, including:
- **TypeScript** for robust, type-safe code.
- **Fastify** as the high-performance web framework.
- **Docker and Docker Compose** for a containerized, reproducible environment.
- **MySQL** as the relational database.
- **Knex.js** as the SQL query builder.
- **Zod** for declarative data validation.
- A feature-based, scalable project architecture.

---

## Development Plan

**Phase 1: Foundation & Setup**
1.  [x] Docker Environment (`Dockerfile`, `docker-compose.yml`)
2.  [x] TypeScript Project (`npm init`, initial dependencies)
3.  [x] Dependency Swap (Express -> Fastify)
4.  [ ] TypeScript Config (`tsconfig.json`)
5.  [ ] Project Structure (`src` folder, feature modules)
6.  [ ] Knex Setup (`knexfile.ts`, initial migration)
7.  [ ] Core Server (`src/app.ts` with Fastify plugins)

**Phase 2: Feature & API Endpoint Implementation**
1.  [ ] `POST /topup`
2.  [ ] `GET /budgets/:advertiser_id`
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
    npm install knex mysql2 zod dotenv fastify @fastify/helmet
    npm install --save-dev typescript @types/node ts-node
    ```
    *Reason: Installs the final production and development dependencies.*
