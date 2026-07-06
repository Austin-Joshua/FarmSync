# PRD: FarmSync Security & Production-Readiness Remediation

**Owner:** AJ
**Status:** Draft
**Related:** FarmSync_Security_Fix_Cursor_Prompt.md (implementation-level prompt)
**Source of findings:** Live audit of github.com/Austin-Joshua/FarmSync + farm-sync-sepia.vercel.app, July 2026

---

## 1. Summary

FarmSync is a deployed, publicly reachable multilingual farm management platform (Spring Boot + React + FastAPI/Qiskit ML service). A source-level audit found that several security controls described in project documentation are either not implemented or actively broken in the live deployment — most seriously, an unauthenticated path to leak OTPs and password-reset tokens, and a hardcoded admin account reseeded on every server restart.

This PRD defines the requirements to close those gaps and bring the codebase's actual security posture in line with what the documentation already claims, without changing product functionality or user-facing behavior.

---

## 2. Problem Statement

Three categories of risk exist today in production:

1. **Credential exposure** — the `/api/auth/otp/send` and `/api/auth/password-reset/request` endpoints return the raw OTP and reset token in the HTTP response body. Any user (or non-user) who calls these endpoints for any account gets a working credential for that account. Combined with a hardcoded, unconditionally-reseeded `admin@farmsync.com / admin123` account, this is a full account-takeover path requiring no skill to exploit.
2. **Weak infrastructure defaults** — a working JWT signing secret is checked into the public repo as a fallback default; CORS accepts credentialed requests from any origin; the ml-service has no origin-appropriate config and no request authentication.
3. **Missing correctness guardrails** — no server-side input validation on any DTO, no rate limiting on auth endpoints, and no automated tests on the backend or frontend, meaning regressions in the above are not caught before deployment.

None of this is visible from the outside without reading source, which is precisely why it needs to be treated as a real defect list rather than a documentation mismatch.

---

## 3. Goals

- Eliminate every identified path by which an unauthenticated actor can obtain a valid credential, token, or admin session.
- Make secure configuration (JWT secret, CORS origins, ml-service auth) fail loudly at startup rather than silently fall back to an insecure default.
- Bring documented controls (input validation, rate limiting) into actual existence in code.
- Establish a minimal automated test baseline so these fixes can't silently regress.
- Do all of the above with zero change to existing user-facing functionality or API contracts (aside from now-rejected invalid requests).

## 4. Non-Goals

- Migrating the database from H2 to PostgreSQL (flagged separately; architecture decision, not a security fix).
- Re-benchmarking or re-validating the quantum/ML performance claims in `quantum_performance_report.json`.
- Redesigning the auth flow (OAuth2, session model, refresh-token rotation strategy) — this PRD hardens what exists, it doesn't replace it.
- UI/UX changes.
- New features of any kind.

---

## 5. Users & Stakeholders

- **End users** (farmers, citizens, admins using the deployed app): affected by risk of account takeover; should see no visible change other than error messages on invalid input.
- **AJ (owner/maintainer):** needs this fixed before pointing recruiters, hackathon judges, or any real user at the live URL.
- **Future contributors:** benefit from tests and validation that make the codebase safe to change.

---

## 6. Requirements

### 6.1 Functional Requirements

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-1 | OTP and password-reset tokens must never appear in any API response body in a production build. | P0 |
| FR-2 | Demo/seed accounts (admin, farmer, citizen) must not be created or password-reset in a production build. | P0 |
| FR-3 | The application must refuse to start in production if `JWT_SECRET` is unset or shorter than 64 characters. | P0 |
| FR-4 | CORS must accept credentialed requests only from an explicit allow-list (production frontend origin + localhost dev origins), never a wildcard. | P0 |
| FR-5 | Every `@RequestBody` DTO accepted by a controller must be validated server-side (Bean Validation), with malformed requests rejected with HTTP 400 and a field-level error body. | P1 |
| FR-6 | `/api/auth/login`, `/api/auth/otp/send`, and `/api/auth/password-reset/request` must be rate-limited per IP (proposed: 5 requests/minute) and return HTTP 429 when exceeded. | P1 |
| FR-7 | All `/ml/*` endpoints on the ml-service must reject requests that don't present a valid shared-secret header. | P1 |
| FR-8 | ml-service CORS allow-list must match the actual deployed frontend domain. | P1 |
| FR-9 | Automated tests must exist covering: auth service login success/failure, absence of leaked OTP/token in responses, at least one frontend auth-flow component, and one frontend utility (password validator). | P2 |

### 6.2 Non-Functional Requirements

- **No functionality regression:** existing valid requests (correct login, valid crop/expense/farm creation, etc.) must continue to succeed unchanged.
- **No new external dependencies beyond:** `bucket4j-spring-boot-starter` (rate limiting), Vitest + React Testing Library (frontend tests). No new paid services.
- **Config via environment variables only** — no secrets committed to the repo at any point, including in `.env.example` beyond placeholder values.
- **Deployability:** all changes must work within the existing Render (backend/ml-service) + Vercel (frontend) deployment setup without infra migration.

---

## 7. Scope Breakdown (maps to implementation prompt phases)

| Phase | Scope | Requirement(s) covered |
|-------|-------|------------------------|
| 1 | Remove debug OTP/token leaks; gate `DataInitializer` behind profile + explicit flag | FR-1, FR-2 |
| 2 | Fail-closed JWT secret validation | FR-3 |
| 3 | Fix CORS allow-lists (backend + ml-service) | FR-4, FR-8 |
| 4 | Bean Validation on all DTOs + global exception handling | FR-5 |
| 5 | Rate limiting on auth endpoints | FR-6 |
| 6 | Shared-secret auth on ml-service | FR-7 |
| 7 | Backend + frontend test baseline | FR-9 |
| 8 | Full-repo verification pass (all grep/PASS-FAIL checks green) | All |

---

## 8. Acceptance Criteria

This work is complete when all of the following hold simultaneously:

- [ ] No response from any endpoint contains a raw OTP, reset token, or other credential material, in any environment reachable from the public internet.
- [ ] Restarting the production backend does not create or reset any account.
- [ ] Backend refuses to boot if `JWT_SECRET` is missing or under 64 characters.
- [ ] `SecurityConfig.java` contains no `"*"` origin pattern.
- [ ] `ml-service/main.py` allow-list contains the correct live frontend domain and no stale domains.
- [ ] Every controller `@RequestBody` parameter is annotated `@Valid` and its DTO carries real constraints.
- [ ] Login, OTP-send, and password-reset-request return HTTP 429 after exceeding the configured rate limit.
- [ ] Every `/ml/*` route rejects requests missing the internal shared secret.
- [ ] `Backend/src/test` and `Frontend/src` each contain the test files specified in FR-9, and they pass.
- [ ] All eight grep/verification checks in the Phase 8 section of the Cursor prompt return the expected PASS result.

---

## 9. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Fail-closed JWT check breaks the current Render deployment if `JWT_SECRET` isn't already set there | Verify and set the env var on Render *before* deploying this change; treat as a pre-deploy checklist item. |
| Adding `@Valid` validation rejects requests the frontend currently sends in a slightly different shape | Run the full manual test pass (login, crop CRUD, expense CRUD, farm CRUD) against a staging deploy before merging to main. |
| Rate limiting on shared IPs (NAT, campus wifi) blocks legitimate concurrent users | Start at 5 req/min per IP as a conservative default; monitor 429 rates post-launch and tune upward if needed. |
| Removing debug OTP output breaks manual QA workflows that currently rely on reading it from the response | Provide the dev-only fallback behind `farmsync.seed-demo-data` flag (FR-1 allows this) so local testing still works. |

---

## 10. Rollout Plan

1. Implement Phases 1–2 first (P0 items) and deploy immediately — these are the actual exploitable vulnerabilities.
2. Implement Phases 3–6 (P1) as a second deploy.
3. Implement Phase 7 (tests) alongside or immediately after; tests should ideally exist before Phase 1 ships, but given the severity of FR-1/FR-2, shipping the fix first and backfilling tests within the same day is acceptable.
4. Run Phase 8's full verification pass before considering the initiative closed.
5. Rotate the `JWT_SECRET` value on Render as part of this rollout, since the old default may have been exposed via the public repo history.

## 11. Out of Scope / Follow-Up Candidates

- PostgreSQL migration (currently H2 file-based despite docs claiming Postgres).
- Flyway/Liquibase versioned migrations to replace `ddl-auto=update`.
- Independent verification of quantum/classical benchmark numbers before they're used in any external-facing material (resume, pitch deck).
- Broader test coverage beyond the P2 baseline (this PRD intentionally scopes to "enough to catch a regression of the P0/P1 fixes," not full coverage).
