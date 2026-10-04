# Sarbert Professionals

## What this project is about

Sarbert Professionals is a teaching marketplace that connects students with tutors.

- **Students** can post teaching jobs, chat with tutors, book sessions, and pay using coins.
- **Tutors** can create profiles, apply for jobs, set availability, and manage their wallet.
- **Admins** manage the platform, including support and payment-related operations.

The codebase has two parts:

- `client` — React frontend
- `backend/teaching-marketplace` — Spring Boot backend API (Java 17, PostgreSQL)

---

## How to run it locally

### Prerequisites

Install these first:

- Node.js and npm
- Java 17
- PostgreSQL
- Maven wrapper is already included in the backend folder (`mvnw` / `mvnw.cmd`)

Also create a PostgreSQL database (for example `teaching_marketplace`).

---

### 1. Run the backend

```powershell
cd backend/teaching-marketplace
```

Install backend libraries:

```powershell
.\mvnw.cmd dependency:resolve
```

Configure the backend using `backend/teaching-marketplace/env-config.txt`  
(set database credentials, JWT secret, frontend URL, and any payment/email keys you need).

Start the API:

```powershell
.\mvnw.cmd spring-boot:run
```

Backend URL:

```text
http://localhost:8089/api/v1
```

---

### 2. Run the frontend

Open a new terminal:

```powershell
cd client
```

Install frontend libraries:

```powershell
npm install
```

Create a `.env` file in `client` based on `client/env-config.txt`. Example:

```env
REACT_APP_API_BASE_URL=http://localhost:8089/api/v1
REACT_APP_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
REACT_APP_APP_NAME=Teaching Marketplace
REACT_APP_VERSION=1.0.0
```

Start the frontend:

```powershell
npm start
```

Frontend URL:

```text
http://localhost:3000
```

---

### Local startup order

1. Start PostgreSQL and confirm the database exists.
2. Start the backend.
3. Start the frontend.
4. Open `http://localhost:3000` in your browser.

---

## Notes

- Do not commit `.env` files or secrets.
- After cloning, run `npm install` in `client` before starting the frontend.
- Backend dependencies are downloaded automatically by Maven when you run `.\mvnw.cmd` commands.
