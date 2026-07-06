# FarmSync — Security & Correctness Remediation Prompt (Cursor)

Source: audit of https://github.com/Austin-Joshua/FarmSync (live clone, July 2026) against the deployed site at farm-sync-sepia.vercel.app and backend at farmsync-zpoe.onrender.com.

Paste each phase into Cursor sequentially. Do not skip ahead — Phase 2 depends on Phase 1's guard being in place, and Phase 8's tests assert on Phase 1–6 behavior.

---

## PHASE 1 — Stop leaking credentials and secrets in production

**Problem:** `DataInitializer.java` runs on every boot with no profile guard, seeding/resetting an admin account (`admin@farmsync.com` / `admin123`) plus farmer/citizen demo accounts. `AuthController` returns `debug_otp` and `debug_token` (the password-reset token) directly in API responses.

**Task:**

1. In `Backend/src/main/java/com/farmsync/config/DataInitializer.java`, add `@Profile("dev")` to the class, and add `@ConditionalOnProperty(name = "farmsync.seed-demo-data", havingValue = "true", matchIfMissing = false)` as a second guard so it requires an explicit opt-in even in dev.
2. In `application.properties`, add `farmsync.seed-demo-data=${SEED_DEMO_DATA:false}` and set `spring.profiles.active=${SPRING_PROFILES_ACTIVE:prod}` as the default so prod is the safe default, not dev.
3. In `AuthController.java`:
   - `otp/send`: remove `response.put("debug_otp", otp)` entirely. Wire `authService.generateAndSendOtp` to an actual SMS provider call (or, if none is integrated yet, log it server-side only via `logger.debug`, never return it to the client).
   - `password-reset/request`: remove `"debug_token", token` from the response body. Return only the generic message.
4. If you need OTP/token visibility for local testing, gate it behind the same `farmsync.seed-demo-data` flag so it's structurally impossible to leak in a prod build:
   ```java
   if (seedDemoDataEnabled) {
       response.put("debug_otp", otp);
   }
   ```

**Verify:**
```bash
grep -n "debug_otp\|debug_token" Backend/src/main/java/com/farmsync/controller/AuthController.java
# PASS: no matches, or matches only inside an `if (seedDemoDataEnabled)` block

grep -n "@Profile\|@ConditionalOnProperty" Backend/src/main/java/com/farmsync/config/DataInitializer.java
# PASS: both annotations present
```

---

## PHASE 2 — Fail closed on missing JWT secret

**Problem:** `application.properties` has `farmsync.jwt.secret=${JWT_SECRET:FARMSYNC_LOCAL_DEV_SECRET_CHANGE_IN_PRODUCTION_MIN_64_CHARS_REQUIRED_HERE}` — a real, working fallback secret checked into a public repo. If the `JWT_SECRET` env var is ever unset on Render, tokens are signed with a secret anyone can read on GitHub.

**Task:**

1. Remove the inline default from `application.properties`:
   ```properties
   farmsync.jwt.secret=${JWT_SECRET}
   ```
2. In `JwtUtils.java`, add a startup check (via `@PostConstruct`) that throws if the secret is null, blank, or shorter than 64 characters:
   ```java
   @PostConstruct
   private void validateSecret() {
       if (jwtSecret == null || jwtSecret.isBlank() || jwtSecret.length() < 64) {
           throw new IllegalStateException(
               "JWT_SECRET env var is missing or too short (need 64+ chars). Refusing to start.");
       }
   }
   ```
3. Keep the local dev secret only in `.env.example` (never in `application.properties`) so devs can copy it locally but it never ships in the jar/image.

**Verify:**
```bash
grep -n "farmsync.jwt.secret" Backend/src/main/resources/application.properties
# PASS: line is exactly `farmsync.jwt.secret=${JWT_SECRET}` with no fallback value after the colon

grep -n "@PostConstruct" Backend/src/main/java/com/farmsync/security/JwtUtils.java
# PASS: present, and throws IllegalStateException for short/missing secrets
```

---

## PHASE 3 — Fix CORS (backend + ml-service)

**Problem:** `SecurityConfig.java` uses `setAllowedOriginPatterns(Arrays.asList("*"))` with `setAllowCredentials(true)` — any origin can send authenticated requests. Separately, `ml-service/main.py`'s `_ALLOWED_ORIGINS` still lists the stale `farm-sync-seven.vercel.app` instead of the live `farm-sync-sepia.vercel.app`.

**Task:**

1. In `SecurityConfig.java`, replace the wildcard with an explicit list driven by env var:
   ```java
   @Value("${farmsync.frontend.url}")
   private String frontendUrl;

   configuration.setAllowedOriginPatterns(Arrays.asList(frontendUrl, "http://localhost:5173"));
   ```
2. In `ml-service/main.py`, fix the stale domain:
   ```python
   _ALLOWED_ORIGINS = [
       "http://localhost:5173",
       "http://localhost:3000",
       "https://farm-sync-sepia.vercel.app",
       os.getenv("FRONTEND_URL", "http://localhost:5173"),
   ]
   ```

**Verify:**
```bash
grep -n '"\*"' Backend/src/main/java/com/farmsync/config/SecurityConfig.java
# PASS: no matches

grep -n "farm-sync-seven\|farm-sync-sepia" ml-service/main.py
# PASS: only "farm-sync-sepia" appears
```

---

## PHASE 4 — Add real input validation

**Problem:** Zero `@Valid` annotations exist across any controller (`grep -rn "@Valid" Backend/src/main/java/com/farmsync/controller` returns nothing). DTOs like `CropRequest` have no constraints, so the backend accepts any garbage payload.

**Task:** For each DTO in `Backend/src/main/java/com/farmsync/dto/`, add Bean Validation annotations matching the field's real constraints. Example for `CropRequest.java`:
```java
@Data
public class CropRequest {
    @NotBlank(message = "Crop name is required")
    private String name;

    private String cropTypeName;
    private UUID cropTypeId;

    @NotNull(message = "Sowing date is required")
    @PastOrPresent
    private LocalDate sowingDate;

    private LocalDate harvestDate;

    @Pattern(regexp = "active|harvested|failed", message = "Invalid status")
    private String status;

    @NotBlank
    private String season;

    @NotNull
    private UUID farmId;
}
```
Then in every controller method taking one of these DTOs as `@RequestBody`, add `@Valid`:
```java
@PostMapping
public ResponseEntity<CropResponse> createCrop(@Valid @RequestBody CropRequest request) { ... }
```
Add a handler in `GlobalExceptionHandler.java` for `MethodArgumentNotValidException` that returns a 400 with field-level errors.

Do this for at minimum: `CropRequest`, `ExpenseRequest`, `FarmRequest`, `StockRequest`, `YieldRequest`, `LoginRequest`, `DiseaseScanRequest`.

**Verify:**
```bash
grep -rn "@Valid" Backend/src/main/java/com/farmsync/controller | wc -l
# PASS: 7+ (one per DTO listed above, some controllers may use more than one)

grep -n "MethodArgumentNotValidException" Backend/src/main/java/com/farmsync/controller/GlobalExceptionHandler.java
# PASS: present
```

---

## PHASE 5 — Rate limit auth endpoints

**Problem:** No rate limiting exists anywhere in the backend or ml-service. `/api/auth/login`, `/otp/send`, and `/password-reset/request` are all open to brute-force/enumeration.

**Task:**

1. Add `bucket4j-spring-boot-starter` to `Backend/pom.xml`.
2. Create `Backend/src/main/java/com/farmsync/security/RateLimitFilter.java` that limits `/api/auth/login`, `/api/auth/otp/send`, and `/api/auth/password-reset/request` to 5 requests per minute per IP, returning HTTP 429 when exceeded.
3. Register the filter in `SecurityConfig.java` before `JwtAuthenticationFilter`.

**Verify:**
```bash
grep -n "bucket4j" Backend/pom.xml
# PASS: dependency present

find Backend/src/main/java/com/farmsync/security -iname "RateLimitFilter.java"
# PASS: file exists

# Manual check: hit /api/auth/login 6x in a minute with wrong credentials — 6th response should be 429
```

---

## PHASE 6 — Lock down the ml-service

**Problem:** All `/ml/*` endpoints in `ml-service/main.py` accept unauthenticated requests. If the Render URL is guessed or leaked, anyone can burn inference compute or hit `/ml/disease-detect` directly.

**Task:**

1. Add a shared-secret header check. In `ml-service/main.py`:
   ```python
   from fastapi import Header, HTTPException

   ML_SERVICE_SECRET = os.getenv("ML_SERVICE_SECRET")

   async def verify_internal_secret(x_internal_secret: str = Header(None)):
       if not ML_SERVICE_SECRET or x_internal_secret != ML_SERVICE_SECRET:
           raise HTTPException(status_code=403, detail="Forbidden")
   ```
   Add `dependencies=[Depends(verify_internal_secret)]` to every `/ml/*` route.
2. In the Spring Boot backend, add the same header (`X-Internal-Secret`) to every outgoing call to the ml-service (wherever `RestTemplate`/`WebClient` calls `ml-service` — check `AIService.java`).
3. Set `ML_SERVICE_SECRET` as a matching env var on both the Render ml-service deployment and the backend deployment.

**Verify:**
```bash
grep -n "verify_internal_secret\|Depends(verify_internal_secret)" ml-service/main.py | wc -l
# PASS: 7+ (one per /ml/* route)

grep -n "X-Internal-Secret" Backend/src/main/java/com/farmsync/service/AIService.java
# PASS: present
```

---

## PHASE 7 — Add a minimal test baseline

**Problem:** Backend and frontend have zero tests (`ml-service/tests/` is the only test directory in the repo; `Frontend/package.json` has no `test` script at all).

**Task:**

1. Backend: add JUnit + Mockito tests for `AuthService` covering login success/failure and the fixed OTP/reset-token behavior from Phase 1 (assert the response body never contains the raw OTP/token outside the dev-flag branch).
2. Frontend: add Vitest + React Testing Library. Add a `"test": "vitest run"` script to `package.json`. Write at minimum one test per: `Login.tsx` (renders + submits), `ProtectedRoute.tsx` (redirects unauthenticated users), `passwordValidator.ts` (unit test on the validation rules).

**Verify:**
```bash
find Backend/src/test -iname "AuthServiceTest.java"
# PASS: exists

grep -n '"test"' Frontend/package.json
# PASS: present, runs vitest

find Frontend/src -iname "*.test.tsx" -o -iname "*.test.ts" | wc -l
# PASS: 3+
```

---

## PHASE 8 — Final full-repo verification pass

Run all of these together after Phases 1–7 are complete. All must PASS before calling this done.

```bash
# No leaked secrets in responses
grep -rn "debug_otp\|debug_token" Backend/src/main/java/com/farmsync/controller/AuthController.java

# No hardcoded JWT fallback
grep -n "FARMSYNC_LOCAL_DEV_SECRET" Backend/src/main/resources/application.properties

# No CORS wildcard
grep -rn '"\*"' Backend/src/main/java/com/farmsync/config/SecurityConfig.java

# Validation coverage
grep -rn "@Valid" Backend/src/main/java/com/farmsync/controller | wc -l

# Rate limiting present
grep -n "bucket4j" Backend/pom.xml

# ml-service auth present
grep -c "Depends(verify_internal_secret)" ml-service/main.py

# DataInitializer gated
grep -n "@Profile" Backend/src/main/java/com/farmsync/config/DataInitializer.java

# Tests exist
find Backend/src/test Frontend/src -iname "*test*" | wc -l
```

Expected: first three checks return **no matches**; the rest return **non-zero counts**.

---

## Not included here (flagging, not fixing)

These came up in the audit but are architecture decisions, not quick fixes — worth a separate pass once the above is merged:

- Migrating from H2 file-based storage to real PostgreSQL (README/earlier docs already claim Postgres — the code doesn't match yet).
- Replacing `ddl-auto=update` with versioned Flyway migrations.
- Deciding whether the quantum VQC ensemble numbers reported in `models/quantum_performance_report.json` were benchmarked against the classical baseline on the same hardware/data split, or are aspirational — worth verifying before quoting them anywhere public (resume, pitch deck, README).
