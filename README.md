# Sarbert Professionals

Teaching marketplace platform that connects students with tutors/professionals. Students can post jobs, chat with tutors, manage bookings, and pay with coins; tutors build profiles and apply for work; admins manage the platform.

## Stack

| Layer | Tech |
| --- | --- |
| Frontend | React 18, React Router, Tailwind CSS, Zustand, Axios |
| Backend | Spring Boot 3.2 (WebFlux), Spring Security, JWT |
| Database | PostgreSQL (R2DBC) |
| Payments | Paystack, M-Pesa |
| Media | Cloudinary |
| CI | GitHub Actions (Maven verify + client build) |

## Repository layout

```
├── client/                          # React frontend (Create React App)
├── backend/teaching-marketplace/    # Spring Boot API
├── .github/workflows/ci.yml         # CI pipeline
└── IMPROVEMENT_PLAN.md              # Engineering notes
```

## Prerequisites

- Node.js 18+ and npm
- Java 17+
- Maven 3.8+ (or use the included `mvnw`)
- PostgreSQL 14+
- (Optional) Docker — for backend integration tests and containerized API

## Quick start

### 1. Database

Create a PostgreSQL database (default name used in docs: `teaching_marketplace`).

### 2. Backend

```bash
cd backend/teaching-marketplace
```

Copy variables from `env-config.txt` into your environment or a local `.env` / deployment config. Required areas:

- Database (`DATASOURCE_*`)
- JWT (`JWT_SECRET`)
- Frontend URLs (`FRONT_END_URL`, verification/reset URLs)
- Email (SMTP)
- Cloudinary, Paystack, and M-Pesa credentials as needed

Run:

```bash
./mvnw spring-boot:run
# or with verbose logs:
./mvnw spring-boot:run -Dspring-boot.run.profiles=dev
```

API base (local): `http://localhost:8089/api/v1`  
Health: Actuator `health` / `info` endpoints (as configured).

Docker (from `backend/teaching-marketplace`):

```bash
docker build -t teaching-marketplace .
docker run -p 8080:8080 --env-file .env teaching-marketplace
```

### 3. Frontend

```bash
cd client
cp env-config.txt .env   # then edit values
npm install
npm start
```

App runs at `http://localhost:3000` by default.

Key client env vars:

```env
REACT_APP_API_BASE_URL=http://localhost:8089/api/v1
REACT_APP_PAYSTACK_PUBLIC_KEY=pk_test_...
```

Production build:

```bash
cd client
npm run build
```

## Roles & main features

- **Students** — post jobs, chat, book sessions, buy/spend coins, track success flows
- **Tutors / professionals** — profiles, applications, availability, wallet
- **Admins** — dashboard, support tickets, MFA-protected admin actions, payment ops

Also included: real-time chat (WebSocket), email verification, password reset, and support ticketing.

## Tests

```bash
# Backend
cd backend/teaching-marketplace
./mvnw test
# TeachingMarketplaceApplicationTests needs Docker (Testcontainers); skipped without it

# Frontend
cd client
npm test
```

## Configuration reference

Do not commit secrets. Use:

- `client/env-config.txt` — frontend variable template
- `backend/teaching-marketplace/env-config.txt` — backend variable template

`.env` files and `node_modules/` are gitignored.

## License

Private repository — all rights reserved unless otherwise stated.
