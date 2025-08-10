# Ad Budget Manager

This project is a backend service to manage advertiser ad budgets, built as a technical demonstration. It implements a system for daily budgets, rollovers, campaign submissions, and top-ups, focusing on clean architecture and robust backend logic.

The implementation follows modern backend development best practices to showcase expertise, including:
- **TypeScript** for robust, type-safe code.
- **Fastify** as the high-performance web framework.
- **Docker and Docker Compose** for a containerized, reproducible environment.
- **MySQL** as the relational database.
- **Knex.js** as the SQL query builder.
- **Zod** for declarative data validation.
- A feature-based, scalable project architecture.

---

## Core Budget Logic

The system operates on a set of clear rules for managing advertiser funds.

1.  **Daily Budget Limit**: Every advertiser receives a **$5,000** budget each day for new campaign spending. This is a fixed amount that resets daily.

2.  **Rollover Balance**: If an advertiser does not spend their entire $5,000 daily budget, the unused portion is automatically transferred to their **rollover balance** at the end of the day. This balance carries over indefinitely until it is spent.

3.  **Manual Top-Ups**: Advertisers can manually add funds to their account.
    - There is a **$10,000 minimum** for each top-up transaction.
    - To ensure financial predictability, top-ups are added to the **rollover balance** and are available for spending from the *next day* onwards.

4.  **Campaign Scheduling**: When a new campaign is submitted, the system checks the total available funds (`daily_budget` + `rollover_balance`).
    - If there are sufficient funds, the campaign is **scheduled** for the current day.
    - If funds are insufficient, the campaign is **deferred** and will be automatically re-evaluated on subsequent days when the budget is replenished.

---

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Node.js and npm

### Setup and Installation

1.  **Clone the repository and install dependencies:**
    ```bash
    git clone https://github.com/coskundiko/technicaltask-BA
    cd technicaltask-BA
    npm install
    ```

2.  **Check the environment file:**
    The repository includes a `.env` file configured for the provided Docker setup. You only need to edit this file if you are connecting to a different database.

3.  **Start the database service:**
    This command starts the MySQL database container in the background.
    ```bash
    docker compose up -d db
    ```

4.  **Run database migrations:**
    This command creates the necessary tables (`advertisers`, `budgets`, `campaigns`) in the database.
    ```bash
    npm run knex migrate:latest
    ```

5.  **Seed the database (Optional):**
    This command populates the database with an initial advertiser to make testing easier.
    ```bash
    npm run knex seed:run
    ```
    *Note: The seed creates an advertiser with `id = 1`.*

6.  **Start the application:**
    ```bash
    npm run dev
    ```
    The server will start on `http://localhost:3000`.

---

## API Reference

All requests and responses are in JSON format.

### `POST /budgets/topup`
Adds funds to an advertiser's rollover balance.

**Request Body:**
```json
{
  "advertiser_id": "1",
  "amount": 10000
}
```

**`curl` Example:**
```bash
curl -X POST http://localhost:3000/api/budgets/topup \
-H "Content-Type: application/json" \
-d '{"advertiser_id": "1", "amount": 10000}'
```

**Response:**
```json
{
  "message": "Top-up successful"
}
```

### `GET /budgets/:advertiser_id`
Retrieves the complete budget state for an advertiser.

**`curl` Example:**
```bash
curl http://localhost:3000/api/budgets/1
```

**Response:**
```json
{
    "advertiser_id": "1",
    "current_day": "2025-08-10",
    "daily_budget": 5000,
    "rollover_balance": 0,
    "total_available": 5000,
    "used_today": 0,
    "remaining_today": 5000
}
```

### `POST /campaigns`
Submits a new campaign. It will be scheduled or deferred based on the available budget.

**Request Body:**
```json
{
  "advertiser_id": "1",
  "campaign_name": "My Awesome Campaign",
  "cost": 3000
}
```

**`curl` Example:**
```bash
curl -X POST http://localhost:3000/api/campaigns \
-H "Content-Type: application/json" \
-d '{"advertiser_id": "1", "campaign_name": "My Awesome Campaign", "cost": 3000}'
```

**Response (Scheduled):**
```json
{
    "status": "scheduled",
    "scheduled_for": "2025-08-10",
    "balance_remaining": 2000
}
```

**Response (Deferred):**
```json
{
    "status": "deferred",
    "scheduled_for": "2025-08-11",
    "reason": "insufficient_balance"
}
```

### `GET /campaigns`
Retrieves a list of all campaigns and their current status.

**`curl` Example:**
```bash
curl http://localhost:3000/api/campaigns
```

**Response:**
```json
[
    {
        "id": 1,
        "advertiser_id": "1",
        "campaign_name": "My Awesome Campaign",
        "cost": "3000.00",
        "status": "scheduled",
        "scheduled_for": "2025-08-10",
        "reason": null,
        "created_at": "2025-08-10T12:00:00.000Z"
    }
]
```

### `POST /simulate-day`
Simulates the passage of one full day. This triggers the daily budget reset, rolls over any unused funds from the previous day, and attempts to schedule any deferred campaigns.

**`curl` Example:**
```bash
curl -X POST http://localhost:3000/api/simulate-day
```

**Response:**
```json
{
  "message": "Day simulation complete"
}
```