# FarmSync — Security & Correctness Remediation Prompt (Cursor) — v2

Source: audit of https://github.com/Austin-Joshua/FarmSync (live clone, verified July 2026) against the deployed site at farm-sync-sepia.vercel.app and backend at farmsync-zpoe.onrender.com.

**IMPORTANT — READ BEFORE STARTING:** A prior run against this exact codebase claimed all 8 phases were "already fully implemented" without actually making any changes. A fresh clone at that same commit proved every single vulnerability was still present. Do not summarize or claim a phase is complete. For every phase below:

1. Make the actual file edit.
2. Run the verification command for that phase yourself, in the terminal.
3. Paste the literal terminal output (not a paraphrase) into your response before moving to the next phase.
4. If a verification command shows the vulnerability is still present, the phase is **not done** — fix it and re-run, don't report it as done anyway.

At the end, run every command in Phase 8 in one batch and paste all output together. A phase is only "PASS" if the command output matches the stated expectation exactly — not if it "looks reasonable."

---

## PHASE 1 — Stop leaking credentials and secrets in production

**Problem:** `DataInitializer.java` runs on every boot with no profile guard, seeding/resetting an admin account (`admin@farmsync.com` / `admin123`) plus farmer/citizen demo accounts. `AuthController` returns `debug_otp` and `debug_token` (the password-reset token) directly in API responses.

**Task:**

1. In `Backend/src/main/java/com/farmsync/config/DataInitializer.java`, add `@Profile("dev")` to the class, and add `@ConditionalOnProperty(name = "farmsync.seed-demo-data", havingValue = "true", matchIfMissing = false)` as a second guard so it requires an explicit opt-in even in dev.
2. In `application.properties`, add `farmsync.seed-demo-data=${SEED_DEMO_DATA:false}` and set `spring.profiles.active=${SPRING_PROFILES_ACTIVE:prod}` as the default so prod is the safe default, not dev.
3. In `AuthController.java`:
   - `otp/send`: remove `response.put("debug_otp", otp)` entirely, or gate it behind the seed-data flag (see below).
   - `password-reset/request`: remove `"debug_token", token` from the response body, or gate it the same way.
4. If OTP/token visibility is needed for local testing, inject the flag and gate it explicitly:
   ```java
   @Value("${farmsync.seed-demo-data}")
   private boolean seedDemoDataEnabled;
   ...
   if (seedDemoDataEnabled) {
       response.put("debug_otp", otp);
   }
   ```

**Verify (run and paste real output):**
```bash
grep -n "debug_otp\|debug_token" Backend/src/main/java/com/farmsync/controller/AuthController.java
# PASS: no matches, OR matches only inside an `if (seedDemoDataEnabled)` block

grep -n "@Profile\|@ConditionalOnProperty" Backend/src/main/java/com/farmsync/config/DataInitializer.java
# PASS: both annotations present, printed on screen
```

---

## PHASE 2 — Fail closed on missing JWT secret

**Problem:** `application.properties` has a working fallback secret (`FARMSYNC_LOCAL_DEV_SECRET_CHANGE_IN_PRODUCTION_MIN_64_CHARS_REQUIRED_HERE`) checked into the public repo.

**Task:**

1. Remove the inline default from `application.properties`:
   ```properties
   farmsync.jwt.secret=${JWT_SECRET}
   ```
2. In `JwtUtils.java`, add a `@PostConstruct` check that throws if the secret is null, blank, or shorter than 64 characters:
   ```java
   @PostConstruct
   private void validateSecret() {
       if (jwtSecret == null || jwtSecret.isBlank() || jwtSecret.length() < 64) {
           throw new IllegalStateException(
               "JWT_SECRET env var is missing or too short (need 64+ chars). Refusing to start.");
       }
   }
   ```
3. Keep the local dev secret only in `.env.example`, never in `application.properties`.

**Verify (run and paste real output):**
```bash
grep -n "farmsync.jwt.secret" Backend/src/main/resources/application.properties
# PASS: exactly `farmsync.jwt.secret=${JWT_SECRET}`, no fallback after the colon

grep -n "@PostConstruct" Backend/src/main/java/com/farmsync/security/JwtUtils.java
# PASS: present
```

---

## PHASE 3 — Fix CORS (backend + ml-service)

**Problem:** `SecurityConfig.java` allows `"*"` origins with credentials enabled. `ml-service/main.py` allow-list points at a stale domain (`farm-sync-seven.vercel.app`) instead of the live one (`farm-sync-sepia.vercel.app`).

**Task:**

1. In `SecurityConfig.java`:
   ```java
   @Value("${farmsync.frontend.url}")
   private String frontendUrl;

   configuration.setAllowedOriginPatterns(Arrays.asList(frontendUrl, "http://localhost:5173"));
   ```
2. In `ml-service/main.py`:
   ```python
   _ALLOWED_ORIGINS = [
       "http://localhost:5173",
       "http://localhost:3000",
       "https://farm-sync-sepia.vercel.app",
       os.getenv("FRONTEND_URL", "http://localhost:5173"),
   ]
   ```

**Verify (run and paste real output):**
```bash
grep -n '"\*"' Backend/src/main/java/com/farmsync/config/SecurityConfig.java
# PASS: no matches

grep -n "farm-sync-seven\|farm-sync-sepia" ml-service/main.py
# PASS: only "farm-sync-sepia" appears
```

---

## PHASE 4 — Add real input validation

**Problem:** Zero `@Valid` annotations exist in any controller. DTOs have no constraints.

**Task:** Add Bean Validation annotations to every DTO in `Backend/src/main/java/com/farmsync/dto/`. Minimum coverage: `CropRequest`, `ExpenseRequest`, `FarmRequest`, `StockRequest`, `YieldRequest`, `LoginRequest`, `DiseaseScanRequest`. Example:
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
Add `@Valid` to every controller method's `@RequestBody` parameter:
```java
@PostMapping
public ResponseEntity<CropResponse> createCrop(@Valid @RequestBody CropRequest request) { ... }
```
Add a `MethodArgumentNotValidException` handler in `GlobalExceptionHandler.java` returning HTTP 400 with field-level errors.

**Verify (run and paste real output):**
```bash
grep -rn "@Valid" Backend/src/main/java/com/farmsync/controller | wc -l
# PASS: 7 or more

grep -n "MethodArgumentNotValidException" Backend/src/main/java/com/farmsync/controller/GlobalExceptionHandler.java
# PASS: present
```

---

## PHASE 5 — Rate limit auth endpoints

**Problem:** No rate limiting anywhere. `/api/auth/login`, `/otp/send`, `/password-reset/request` are open to brute-force.

**Task:**

1. Add `bucket4j-spring-boot-starter` to `Backend/pom.xml`.
2. Create `Backend/src/main/java/com/farmsync/security/RateLimitFilter.java` limiting `/api/auth/login`, `/api/auth/otp/send`, `/api/auth/password-reset/request` to 5 requests/minute per IP, returning HTTP 429 past the limit.
3. Register it in `SecurityConfig.java` before `JwtAuthenticationFilter`.

**Verify (run and paste real output):**
```bash
grep -n "bucket4j" Backend/pom.xml
# PASS: dependency line present

find Backend/src/main/java/com/farmsync/security -iname "RateLimitFilter.java"
# PASS: file path printed

# Manual: curl /api/auth/login with bad creds 6x in under a minute — 6th response must be HTTP 429, paste the actual status code
```

---

## PHASE 6 — Lock down the ml-service

**Problem:** All `/ml/*` endpoints accept unauthenticated requests.

**Task:**

1. In `ml-service/main.py`:
   ```python
   from fastapi import Header, HTTPException

   ML_SERVICE_SECRET = os.getenv("ML_SERVICE_SECRET")

   async def verify_internal_secret(x_internal_secret: str = Header(None)):
       if not ML_SERVICE_SECRET or x_internal_secret != ML_SERVICE_SECRET:
           raise HTTPException(status_code=403, detail="Forbidden")
   ```
   Add `dependencies=[Depends(verify_internal_secret)]` to every `/ml/*` route.
2. In `AIService.java` (or wherever the backend calls the ml-service), add the `X-Internal-Secret` header to every outgoing call.
3. Set `ML_SERVICE_SECRET` as a matching env var on both Render services.

**Verify (run and paste real output):**
```bash
grep -c "Depends(verify_internal_secret)" ml-service/main.py
# PASS: 7 or more

grep -n "X-Internal-Secret" Backend/src/main/java/com/farmsync/service/AIService.java
# PASS: present
```

---

## PHASE 7 — Add a minimal test baseline

**Problem:** Backend and frontend have zero tests.

**Task:**

1. Backend: add `Backend/src/test/java/com/farmsync/service/AuthServiceTest.java` with JUnit + Mockito, covering login success/failure and asserting the response never contains a raw OTP/token outside the dev-flag branch.
2. Frontend: add Vitest + RTL. Add `"test": "vitest run"` to `package.json`. Write tests for `Login.tsx`, `ProtectedRoute.tsx`, and `passwordValidator.ts`.

**Verify (run and paste real output):**
```bash
find Backend/src/test -iname "AuthServiceTest.java"
# PASS: file path printed

grep -n '"test"' Frontend/package.json
# PASS: present

find Frontend/src -iname "*.test.tsx" -o -iname "*.test.ts" | wc -l
# PASS: 3 or more

# Also run the actual test suites and paste the pass/fail summary:
cd Backend && ./mvnw test
cd Frontend && npm run test
```

---

## PHASE 8 — Final full-repo verification pass

Run every command below in one batch, in order, and paste the complete literal output. Do not summarize it — paste the terminal output itself.

```bash
echo "1) debug leaks:" && grep -n "debug_otp\|debug_token" Backend/src/main/java/com/farmsync/controller/AuthController.java
echo "2) JWT fallback:" && grep -n "FARMSYNC_LOCAL_DEV_SECRET\|farmsync.jwt.secret" Backend/src/main/resources/application.properties
echo "3) CORS wildcard:" && grep -n '"\*"' Backend/src/main/java/com/farmsync/config/SecurityConfig.java
echo "4) @Valid count:" && grep -rn "@Valid" Backend/src/main/java/com/farmsync/controller | wc -l
echo "5) bucket4j:" && grep -n "bucket4j" Backend/pom.xml
echo "6) RateLimitFilter file:" && find Backend/src/main/java/com/farmsync/security -iname "RateLimitFilter.java"
echo "7) ml-service auth dep:" && grep -c "Depends(verify_internal_secret)" ml-service/main.py
echo "8) ml-service origins:" && grep -n "farm-sync" ml-service/main.py
echo "9) DataInitializer profile guard:" && grep -n "@Profile\|@ConditionalOnProperty" Backend/src/main/java/com/farmsync/config/DataInitializer.java
echo "10) backend/frontend test files:" && find Backend/src/test Frontend/src -iname "*test*"
```

**Expected results:**
- (1) empty or only inside a flag-gated block
- (2) exactly `farmsync.jwt.secret=${JWT_SECRET}`
- (3) empty
- (4) 7+
- (5) one line showing the dependency
- (6) one file path
- (7) 7+
- (8) only `farm-sync-sepia`, no `farm-sync-seven`
- (9) both annotations shown
- (10) at least 4 files (1 backend + 3 frontend)

---

## Final Checklist (mark only after real verification, not assumption)

- [ ] Phase 1 — debug_otp/debug_token no longer leak; DataInitializer gated — **verified by pasted grep output**
- [ ] Phase 2 — JWT secret fails closed — **verified by pasted grep output**
- [ ] Phase 3 — CORS wildcard removed on both services — **verified by pasted grep output**
- [ ] Phase 4 — all DTOs validated, 7+ `@Valid` usages — **verified by pasted grep output**
- [ ] Phase 5 — rate limiting live, 429 confirmed manually — **verified by pasted curl output**
- [ ] Phase 6 — ml-service requires internal secret on all routes — **verified by pasted grep output**
- [ ] Phase 7 — test files exist and pass — **verified by pasted test-runner output**
- [ ] Phase 8 — full batch verification pasted and matches expected results exactly

Do not check any box based on a written summary alone — only after the corresponding command has actually been run in this session and its output pasted above the checkbox.

---

## Not included here (flagging, not fixing)

- Migrating from H2 file-based storage to real PostgreSQL (docs already claim Postgres — code doesn't match yet).
- Replacing `ddl-auto=update` with versioned Flyway migrations.
- Verifying whether the quantum VQC ensemble numbers in `models/quantum_performance_report.json` are benchmarked or aspirational before quoting them publicly.
