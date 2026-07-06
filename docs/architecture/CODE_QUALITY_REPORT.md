# FarmSync Code Quality Report

**Generated:** July 2026  
**Scope:** `backend/src/main/java/com/farmsync/` — all Java source files (excluding `target/`)  
**Baseline:** 6,499 Java lines across 22 controllers, 12 services, 10 models, 12 repositories, 5 security filters, 4 config classes

---

## 1. Issues Found

### 1.1 `System.out.println` used instead of SLF4J (HIGH IMPACT — FIXED)
**Affected files (before fix):**
- `config/DataInitializer.java` — 11 instances
- `config/FirebaseConfig.java` — 2 instances
- `security/FirebaseTokenFilter.java` — 2 instances
- `controller/MarketController.java` — 1 instance

**Problem:** `System.out.println` bypasses the logging framework, can't be silenced in production, doesn't include thread names, timestamps, or log levels, and doesn't integrate with log aggregation (e.g., Render's log dashboard).

**Status: ✅ FIXED** — All replaced with `private static final Logger logger = LoggerFactory.getLogger(...)` and `logger.info/warn/error` calls.

---

### 1.2 HealthController returned static "UP" with no subsystem checks (HIGH IMPACT — FIXED)
**Affected file:** `controller/HealthController.java`

**Problem:** `/api/health` returned `{"status":"UP"}` regardless of whether the database or ML service was reachable. A deployment that loses DB connectivity would still appear healthy to uptime monitors.

**Status: ✅ FIXED** — HealthController now:
1. Executes `SELECT 1` to verify DB connectivity
2. Makes a 3-second timeout HTTP call to the ML service root
3. Returns `200 UP` only if both subsystems are reachable; `503 DEGRADED` otherwise

---

### 1.3 Swagger/OpenAPI missing — API not self-documenting (HIGH IMPACT — FIXED)
**Problem:** No `/swagger-ui.html` endpoint. Judges, integrators, and frontend developers must read source code to understand the API surface.

**Status: ✅ FIXED** — Added `springdoc-openapi-starter-webmvc-ui:2.3.0` to `pom.xml`; updated `SecurityConfig.java` to permit `/swagger-ui/**` and `/v3/api-docs/**` without authentication.

---

### 1.4 No CI/CD pipeline — tests never enforced (HIGH IMPACT — FIXED)
**Problem:** Test files existed but were never automatically run. Any broken commit could silently reach `main`.

**Status: ✅ FIXED** — Three GitHub Actions workflows created:
- `.github/workflows/backend-ci.yml` — runs `./mvnw test`
- `.github/workflows/frontend-ci.yml` — runs `npm run typecheck`, `npm run lint`, `npm run test`
- `.github/workflows/ml-ci.yml` — runs `pytest tests/test_ml_quantum.py`

---

### 1.5 Inconsistent error handling pattern in AuthController (MEDIUM IMPACT)
**File:** `controller/AuthController.java`

**Problem:** Auth endpoints manually catch exceptions and return `ResponseEntity.badRequest().body(Map.of("error", e.getMessage()))`. Most other controllers let exceptions propagate to `GlobalExceptionHandler`. This creates two error response shapes and makes error behaviour unpredictable.

**Example (inconsistent):**
```java
// AuthController.java — manual catch, arbitrary Map shape
} catch (Exception e) {
    return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
}
```
vs. `GlobalExceptionHandler` which returns `{"error":"...", "message":"...", "fieldErrors":{...}}`.

**Recommendation:** Remove try/catch blocks from AuthController methods that aren't adding value beyond what `GlobalExceptionHandler` already handles. The controller should only catch exceptions it can meaningfully recover from.

**Status: ⚠️ DOCUMENTED (not fixed)** — Fixing this requires careful testing of auth flows to ensure error codes (400 vs 401 vs 403) are preserved.

---

### 1.6 `YieldService.findAllByUser` is O(N) in the number of crops (MEDIUM IMPACT)
**File:** `service/YieldService.java:32-40`

**Problem:** The method fetches all crops for a user, then issues a separate DB query per crop to get yields. For a user with 100 crops, this is 101 queries.

**Status: ⚠️ DOCUMENTED (not fixed)** — Requires a `@Query("SELECT y FROM Yield y WHERE y.crop.farm.farmer.id = :userId")` on `YieldRepository` to collapse to a single join query.

---

### 1.7 God-class risk in `AnalyticsController.java` and `MarketplaceController.java`
**Files:** `controller/AnalyticsController.java` (8,429 bytes), `controller/MarketplaceController.java` (12,767 bytes)

**Problem:** These files are significantly larger than the average controller (~3–4 KB). `MarketplaceController.java` at 12 KB handles CSV loading, parsing, matching, and HTTP responses — all in one class.

**Status: ⚠️ DOCUMENTED (not fixed)** — The CSV parsing logic in `MarketplaceController` should be extracted to a `MarketService`. This is a significant refactor that risks introducing bugs without a comprehensive test suite.

---

## 2. Summary

| Issue | Severity | Status |
|---|---|---|
| `System.out.println` usage | High | ✅ Fixed |
| Static HealthController | High | ✅ Fixed |
| No Swagger/API docs | High | ✅ Fixed |
| No CI/CD pipeline | High | ✅ Fixed |
| Inconsistent error handling in AuthController | Medium | ⚠️ Documented |
| N+1 query in YieldService | Medium | ⚠️ Documented |
| God-class controllers | Medium | ⚠️ Documented |

**Remaining items are captured in the roadmap and can be addressed in a follow-up refactor sprint without breaking existing functionality.**
