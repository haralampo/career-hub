# Career Hub

Career Hub is a full-stack job tracking application that allows users to manage job applications through a React frontend and a Node/Express backend connected to a PostgreSQL database hosted on Neon.

## Tech Stack

Frontend:

* React
* TypeScript
* Vite

Backend:

* Node.js
* Express
* Prisma ORM

Database:

* PostgreSQL (hosted on Neon)

## Architecture Overview

```
Browser (React)
   ↓ fetch()
Express API (Node)
   ↓ Prisma
Neon Postgres (Cloud Database)
```

* React runs in the browser and sends HTTP requests using `fetch`.
* Express defines API routes (e.g., `POST /jobs`).
* Prisma translates JavaScript queries into SQL.
* Neon hosts the PostgreSQL database in the cloud.

## Project Structure

```
career-hub/
  client/        # React frontend
  server/        # Express backend
    prisma/      # Prisma schema
```

## Environment Variables

Create the following file:

### server/.env

```
DATABASE_URL="your_neon_connection_string"
OPENAI_API_KEY="your_openai_key"
```

NEVER commit `.env` files to version control.

## Installation

Install frontend dependencies from the root directory:

```
npm install
```

Install backend dependencies:

```
cd server
npm install
cd ..
```

## Running the Application (Development)

You must run the frontend and backend separately.

### Start Frontend (Vite)

From the root directory:

```
npm run dev
```

The frontend will be available at:

```
http://localhost:5173
```

### Start Backend (Express)

In a separate terminal:

```
cd server
npx ts-node index.ts
```

The backend will run at:

```
http://localhost:4000
```

## Database Setup

After configuring `DATABASE_URL` in `server/.env`:

```
cd server
npx prisma generate
npx prisma db push
```

This synchronizes your Prisma schema with Neon PostgreSQL.

## Production Build (Frontend)

To create an optimized production build of the frontend:

```
npm run build
```

This generates a `dist/` folder containing static assets.

---