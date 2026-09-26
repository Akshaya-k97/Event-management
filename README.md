# UniSphere Events

Full-stack college event management system.

## Stack
- **API**: Node.js + Express + Prisma + PostgreSQL
- **Auth**: JWT (access in memory, refresh in httpOnly cookie)
- **Web**: Vanilla JS + Bootstrap 5

## Run it

    cp .env.example .env
    npm install
    npm run db:up          # start Postgres
    npm run db:migrate     # create tables
    npm run db:seed        # seed demo data
    npm run dev:api        # API on :3000
    # in another terminal:
    npm run dev:web        # Web on :5173

Then open http://localhost:5173/login.html

## Demo accounts (from seed)

| Role      | Email                       | Password     |
|-----------|-----------------------------|--------------|
| Admin     | admin@unisphere.edu         | Password123! |
| Organizer | organizer@unisphere.edu     | Password123! |
| Student   | student@unisphere.edu       | Password123! |

## Health check

    curl http://localhost:3000/api/health