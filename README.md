# Sarbert Professionals

Sarbert Professionals is a teaching marketplace where students can find tutors, post teaching jobs, chat, book sessions, and pay using coins. Tutors create profiles, apply for jobs, and manage their availability and wallet. Admins oversee the platform, including support and payments.

The project has two main parts:

- `client` — React frontend
- `backend/teaching-marketplace` — Spring Boot API (Java 17, PostgreSQL)

---

## Prerequisites

Before running the project, install:

- Node.js and npm
- Java 17
- Maven (or use the Maven wrapper in the backend folder)
- PostgreSQL

Create a PostgreSQL database named `teaching_marketplace` (or match the name in your backend config).

---

## Backend setup

### 1. Install dependencies

```bash
cd backend/teaching-marketplace
./mvnw dependency:resolve
```

On Windows PowerShell:

```powershell
cd backend/teaching-marketplace
.\mvnw.cmd dependency:resolve
```

### 2. Configure environment

Copy the variables from `backend/teaching-marketplace/env-config.txt` into your environment (or a local env file used by your setup).

You need at least:

- Database URL, username, and password
- JWT secret
- Frontend URL
- Email (SMTP) settings if you use verification/reset emails
- Paystack, M-Pesa, and Cloudinary values if you use those features

### 3. Run the backend

```bash
cd backend/teaching-marketplace
./mvnw spring-boot:run
```

On Windows PowerShell:

```powershell
cd backend/teaching-marketplace
.\mvnw.cmd spring-boot:run
```

The API runs on port `8089` by default:

```text
http://localhost:8089/api/v1
```

---

## Frontend setup

### 1. Install libraries

```bash
cd client
npm install
```

### 2. Configure environment

Create a `.env` file in the `client` folder using the values from `client/env-config.txt`.

Minimum example:

```env
REACT_APP_API_BASE_URL=http://localhost:8089/api/v1
REACT_APP_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
REACT_APP_APP_NAME=Teaching Marketplace
REACT_APP_VERSION=1.0.0
```

### 3. Run the frontend

```bash
cd client
npm start
```

The app runs on:

```text
http://localhost:3000
```

### 4. Production build (optional)

```bash
cd client
npm run build
```

---

## Suggested local order

1. Start PostgreSQL and make sure the database exists.
2. Start the backend.
3. Start the frontend.
4. Open the frontend in your browser.

---

## Notes

- Do not commit `.env` files or secrets.
- `node_modules` is ignored by git; always run `npm install` after cloning.
- Backend dependencies are downloaded by Maven when you run `./mvnw` commands.
