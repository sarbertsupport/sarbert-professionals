# Engineering improvement plan

Work aligned with a staff-level review: **operational hygiene, observability, tests, and frontend logging** — without changing business rules (payments, wallet math, authorization decisions, or API contracts).

## Completed in this pass

- [x] **Backend config:** Removed misleading JPA/Hibernate settings from `application.properties`; documented R2DBC-only persistence.
- [x] **Backend profiles:** Added `application-dev.properties` (verbose logs) and `application-prod.properties` (quieter defaults); base file uses production-safe INFO levels.
- [x] **Actuator:** Added `spring-boot-starter-actuator` and `management.endpoints.web.exposure.include=health,info` (matches existing security permit list).
- [x] **Request correlation:** Added `CorrelationIdWebFilter` (`X-Correlation-Id` on request/response) + unit tests.
- [x] **Integration tests:** `application-test.properties` with safe placeholders; `TeachingMarketplaceApplicationTests` uses PostgreSQL Testcontainers (`@Testcontainers(disabledWithoutDocker = true)` — skipped when Docker is unavailable).
- [x] **Build hygiene:** Deduplicated repeated `maven-compiler-plugin` entries; single plugin using `release` matching `${java.version}` (17).
- [x] **CI:** `.github/workflows/ci.yml` — Maven verify on backend, `npm ci` + `npm run build` on client (requires `package-lock.json`).
- [x] **Frontend logging:** `client/src/utils/logger.js` (debug/info only in development; warn/error always reach the console); migrated prior `console.*` usage across the app.
- [x] **ESLint:** `no-console` set to `warn` in `client/package.json` (with `eslint-disable` only on the logger helper).
- [x] **Documentation:** Clarified why `setAuthErrorSetter` exists in `apiInterceptor.jsx`.

## Intentionally deferred (behavior, contract, or security model would change)

These remain recommendations; they were **not** implemented so core logic stays unchanged.

- [ ] **Auth storage:** Move JWT from `localStorage` to httpOnly cookies and define CSRF/session policy.
- [ ] **Payments:** Paystack webhook signature verification audit, idempotency keys, replay handling.
- [ ] **Wallet:** Explicit ledger / atomic balance updates under concurrency.
- [ ] **Schema evolution:** Flyway/Liquibase alongside or instead of always-on `schema.sql`.
- [ ] **API consistency:** Normalize identifier types (e.g. `userId` String vs int) and standardize error payloads.
- [ ] **HTTP client:** Single axios/fetch wrapper with shared timeouts and error types (would touch many call sites).
- [ ] **Auth UI state:** Replace global setter in `apiInterceptor` with React Context or similar.
- [ ] **Routing:** Use `HomeRoute` on `/` so admins land on `/admin` (changes visible navigation).
- [ ] **Ops:** JSON structured logging, correlation ID in application logs (beyond HTTP header), metrics/alerts.
- [ ] **Data exposure:** Review public `GET /api/v1/jobs` responses for PII.

## How to run things locally

- **Backend tests:** `cd backend/teaching-marketplace && mvn test`  
  - With Docker: full context test may run.  
  - Without Docker: `TeachingMarketplaceApplicationTests` is skipped; `CorrelationIdWebFilterTest` still runs.
- **Verbose backend logs:** start with `--spring.profiles.active=dev`
- **Client production build:** `cd client && npm run build`

---

_Last updated: 2026-04-07_
