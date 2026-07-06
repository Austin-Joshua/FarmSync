# FarmSync — Full Project Audit & Startup/Hackathon-Grade Upgrade Prompt

**Scope:** entire repo (Backend, Frontend, ml-service, Database, docs) — not just security this time.
**Goal:** identify every gap between "what the docs/README claim" and "what the code actually does," then close the gaps that matter for (a) a hackathon judge reading the code and demo, and (b) a startup-grade production system a real user or investor would trust.

**Ground rules (non-negotiable — read before starting):**

1. Every claim of "done" or "already implemented" must be backed by a pasted, literal command output in the same response — not a description of what the output would show. If you didn't run the command in this session, you don't get to claim the result.
2. If something is genuinely already correct, say so and show the verification — don't invent work to look busy, and don't claim work that wasn't done.
3. Work phase by phase, in order. Don't skip to whichever phase looks easiest.
4. Where a fix requires a judgment call (e.g., "should we migrate to Postgres now or note it as a roadmap item"), state the tradeoff explicitly and pick one — don't leave it vague.
5. At the end, produce the scorecard in Phase 12 honestly, including categories that are still weak. A hackathon judge or a startup investor will find the weak spots anyway; a defensible "here's what's solid and here's what's next" beats a false "everything is perfect."

---

## PHASE 0 — Establish ground truth

Before touching anything, generate an inventory so later phases have real numbers to work from.

```bash
find . -name "*.java" -not -path "*/target/*" | xargs wc -l | tail -1
find . -name "*.tsx" -o -name "*.ts" | grep -v node_modules | xargs wc -l | tail -1
find . -name "*.py" -not -path "*/__pycache__/*" | xargs wc -l | tail -1
git log --oneline | wc -l
git log -1 --format="%H %ci"
find . -iname "*test*" -not -path "*/node_modules/*" -not -path "*/.git/*"
```

Paste this output. This is your baseline — every later "before/after" claim should reference it.

---

## PHASE 1 — Architecture & code quality audit

**Check for:**
- Duplicate logic across controllers/services (e.g., repeated null-checking, repeated pagination logic).
- Inconsistent error-handling patterns — some controllers return `ResponseEntity.badRequest().body(Map.of(...))`, others may throw and rely on `GlobalExceptionHandler`. Pick one pattern and apply it everywhere.
- God classes / files doing too much (check line counts per file).
- Circular or unclear dependency direction between `service` and `controller` layers.
- Frontend: check `src/services/api.ts` and `src/context/AuthContext.tsx` for consistency in how errors/loading states are handled across pages.

**Task:** Produce `docs/architecture/CODE_QUALITY_REPORT.md` listing every inconsistency found with file:line references, then fix the highest-impact 5 before moving on (don't try to fix all of them — prioritize by how often the pattern repeats).

**Verify:**
```bash
find . -name "*.java" -not -path "*/target/*" | xargs wc -l | sort -rn | head -10
# PASS: no single file over ~400 lines without justification
```

---

## PHASE 2 — Deep security pass (beyond what's already fixed)

The OTP/token leak, JWT fallback, CORS wildcard, missing validation, missing rate limiting, and missing ml-service auth were already fixed and verified in a prior pass. This phase covers what wasn't checked yet.

**Check for:**
1. **Authorization / IDOR:** Can User A fetch, edit, or delete User B's farm/crop/expense/stock records by guessing/incrementing a UUID? Check every `@GetMapping("/{id}")`, `@PutMapping("/{id}")`, `@DeleteMapping("/{id}")` — does the service layer verify `resource.getFarmer().getId().equals(currentUser.getId())` before returning/modifying, or does it just fetch by ID?
2. **Dependency vulnerabilities:**
   ```bash
   cd Backend && ./mvnw dependency-check:check 2>&1 | tail -50
   cd Frontend && npm audit --production
   cd ml-service && pip install pip-audit --break-system-packages && pip-audit -r requirements.txt
   ```
3. **Secrets scan on git history** (not just current files — check if the old JWT fallback secret or any credential was ever committed and is still in history):
   ```bash
   git log -p | grep -i "password\|secret\|api_key" | grep -v "^-" | sort -u | head -50
   ```
4. **File upload validation:** `disease-detect` accepts `UploadFile` — is there a file size limit, content-type allowlist, and filename sanitization before it touches disk or `PIL.Image.open()`?
5. **Firebase service account handling:** confirm `firebase-service-account.json` is never committed and `FirebaseConfig.java` fails closed if the file/env var is missing, rather than silently disabling auth.

**Task:** Fix IDOR issues found in (1) — add ownership checks to every service method that returns/modifies a user-owned resource. Add file validation for (4). Document any dependency vulnerabilities found in (2) that can't be fixed immediately, with a mitigation plan.

**Verify:**
```bash
grep -rln "findById" Backend/src/main/java/com/farmsync/service | xargs grep -L "getFarmer().getId()\|getUser().getId()\|currentUser"
# Investigate every file this lists — each should either have an ownership check or a documented reason it doesn't need one
```

---

## PHASE 3 — Database & data layer

**Problem:** H2 file-based storage is used in production despite docs claiming PostgreSQL + PostGIS. `ddl-auto=update` with no versioned migrations.

**Task:**
1. Decide and document: either (a) actually migrate to PostgreSQL now, or (b) correct all documentation/README/resume claims to say H2 truthfully and add Postgres migration to the roadmap. Don't leave the mismatch standing.
2. If migrating: add Flyway, write versioned migration scripts matching the current JPA-managed schema, set `ddl-auto=validate` once migrations are in place.
3. Add indexes on foreign key columns and frequently-queried fields (e.g., `farm_id`, `user_id`, `email`) if not already present — check `Database/schema.sql` and JPA entity annotations.
4. Add a backup/restore story — even a documented `pg_dump` cron job note is better than nothing.

**Verify:**
```bash
grep -rn "ddl-auto" Backend/src/main/resources/application.properties
grep -c "CREATE INDEX" Database/schema.sql
find . -path "*/db/migration/*" -name "*.sql" | wc -l
```

---

## PHASE 4 — Validate (don't assume) the ML/Quantum claims

**Problem:** Reports like `models/quantum_performance_report.json` and `evaluation_report.json` exist, but it's unverified whether the numbers came from real benchmarking or were written by hand/generated by a prior LLM session.

**Task:**
1. Run `ml-service/evaluation/evaluate_models.py` and `ml-service/evaluation/benchmark_full.py` fresh, and diff the output against what's currently claimed in `models/evaluation_report.json` and `models/quantum_performance_report.json`.
2. If numbers don't match or the scripts don't run cleanly, regenerate the reports from a real run and replace the stale ones. Note the exact command and timestamp used to generate them at the top of each report file.
3. For any quantum-vs-classical comparison claim, confirm it's simulator-based (AerSimulator/statevector), not real quantum hardware, and say so explicitly wherever the claim appears (README, docs, reports) — this is a common and reasonable thing to build, but claiming "quantum advantage" without qualifying "on simulator" is misleading to a judge who asks.
4. Confirm train/test split methodology is documented (what dataset, what split ratio, any cross-validation) — add this to `docs/ml/README.md` if missing.

**Verify:**
```bash
cd ml-service && python evaluation/evaluate_models.py > /tmp/fresh_eval_output.txt 2>&1
diff <(python -c "import json; print(json.load(open('models/evaluation_report.json')))") <(cat /tmp/fresh_eval_output.txt)
# Paste the actual diff — if it's empty, the claimed numbers are reproducible; if not, the report needs regenerating
```

---

## PHASE 5 — API design, consistency, and documentation

**Task:**
1. Add OpenAPI/Swagger docs via `springdoc-openapi-starter-webmvc-ui` so `/swagger-ui.html` gives a judge or future integrator a live, browsable API reference — this alone reads as "startup-grade" versus a README-only API description.
2. Standardize error response shape across every controller (currently a mix of `Map.of("error", ...)` shapes) — pick one envelope, e.g. `{ "error": string, "message": string, "fieldErrors"?: {...} }`, and make `GlobalExceptionHandler` the single source of truth for it.
3. Add API versioning prefix (`/api/v1/...`) if not already present, so future breaking changes don't break the deployed frontend silently.

**Verify:**
```bash
grep -n "springdoc" Backend/pom.xml
curl -s http://localhost:9090/v3/api-docs | head -c 200
# PASS: dependency present, endpoint returns JSON (run against local instance)
```

---

## PHASE 6 — CI/CD and automated quality gates

**Problem:** Tests exist now (from the previous fix pass) but there's no pipeline enforcing them.

**Task:**
1. Add `.github/workflows/backend-ci.yml` running `./mvnw test` on every PR.
2. Add `.github/workflows/frontend-ci.yml` running `npm run lint`, `npm run typecheck`, `npm run test` on every PR.
3. Add `.github/workflows/ml-ci.yml` running the ml-service's `tests/test_ml_quantum.py`.
4. Branch-protect `main` to require these checks to pass before merge (document this as a GitHub repo setting since it can't be done via a file).

**Verify:**
```bash
find .github/workflows -name "*.yml"
# PASS: 3 files present, each referencing the correct test command
```

---

## PHASE 7 — Performance & scalability evidence

**Problem:** Scalability claims (Redis, connection pooling, horizontal scaling readiness) exist in docs but aren't backed by a load test.

**Task:**
1. Run `ml-service/tests/stress_test.py` against a running local instance and record actual throughput/latency numbers.
2. Add a simple load test for the backend (e.g., `k6` or `Apache Bench`) hitting `/api/auth/login` and one data-heavy endpoint (`/api/crops` or similar) at increasing concurrency, and record where latency degrades.
3. Replace any "should scale to X" language in docs with actual measured numbers, or explicitly label projections as untested estimates.

**Verify:**
```bash
cd ml-service && python tests/stress_test.py > /tmp/stress_results.txt 2>&1
cat /tmp/stress_results.txt
# Paste the real numbers — requests/sec, p50/p95 latency
```

---

## PHASE 8 — Frontend UX, accessibility, and visual polish

**Task:**
1. Run a Lighthouse audit against the deployed Vercel URL (performance, accessibility, best practices, SEO) and paste the four scores.
2. Fix any accessibility score below 90 — common culprits: missing `alt` text, insufficient color contrast, missing form labels, no focus indicators.
3. Check mobile responsiveness on the core flows (login, dashboard, crop management) at 375px width — farmers using this in the field are likely on phones, not desktops.
4. Confirm loading states and empty states exist for every data-fetching page (not just spinners — actual "no data yet" messaging), since blank screens read as broken to a judge.

**Verify:**
```
Lighthouse scores (paste actual numbers from a real run against farm-sync-sepia.vercel.app):
Performance: __
Accessibility: __
Best Practices: __
SEO: __
```

---

## PHASE 9 — Observability

**Task:**
1. Add structured logging (not `System.out.println`, which `DataInitializer.java` and others currently use) via SLF4J consistently across the backend.
2. Add a lightweight error-tracking integration (e.g., Sentry free tier) for both frontend and backend so runtime errors in production are visible rather than silent.
3. Confirm `/actuator/health` (Spring Boot Actuator) or the existing `/api/health` endpoint reports real subsystem status (DB reachable, ml-service reachable) rather than just "server is up."

**Verify:**
```bash
grep -rn "System.out.println" Backend/src/main/java | wc -l
# Track this number down toward 0 (excluding acceptable startup banners)
```

---

## PHASE 10 — Documentation & onboarding

**Task:**
1. Rewrite the root `README.md` so a stranger (judge, recruiter, or contributor) can clone, configure env vars, and run the full stack (Backend + Frontend + ml-service) in under 10 minutes, with copy-pasteable commands.
2. Add an architecture diagram (even a simple Mermaid diagram in the README) showing Frontend → Backend → ml-service → DB, since this is worth far more to a judge in 10 seconds of scanning than a paragraph of prose.
3. Add a `CONTRIBUTING.md` and a `.env.example` for every service (Backend, Frontend, ml-service) with every required env var listed and a one-line description of each.
4. Correct any remaining doc/reality mismatches found across Phases 1–9 (e.g., the H2-vs-Postgres claim from Phase 3).

**Verify:**
```bash
find . -iname "CONTRIBUTING.md" -o -iname ".env.example" | grep -v node_modules
# PASS: .env.example present for all 3 services, CONTRIBUTING.md present at root
```

---

## PHASE 11 — Startup & hackathon readiness

This phase is about narrative and business framing, not code — but it's what separates "impressive code" from "fundable/winnable product."

**Task, produce `docs/STARTUP_READINESS.md` covering:**
1. **Who is the paying customer?** State it plainly (individual farmer, NGO/co-op, government extension program) — vague "farmers" framing reads as unvalidated to judges.
2. **What's the wedge feature** — the one thing FarmSync does that a farmer would pay for even if every other feature disappeared? Name it.
3. **Multi-tenancy story:** is data currently isolated per-user correctly (confirmed in Phase 2's IDOR check)? If yes, that's your "ready for multiple real customers" claim — back it with the Phase 2 evidence.
4. **Cost-to-serve:** rough estimate of hosting cost per active user at current architecture (Render + Vercel free/paid tiers, ml-service compute) — judges and investors both ask this.
5. **Competitive framing:** 3-4 bullet comparison against the nearest real alternative (a government portal, a paid SaaS, or manual record-keeping) — what does FarmSync do that they don't?
6. **Honest roadmap:** the 3 items from Phase 3 (DB), Phase 4 (ML validation), and anything else deferred — framed as "next milestones," not hidden gaps.

---

## PHASE 12 — Final scorecard (hackathon judge simulation)

Score each category 1-10, with one sentence of justification citing evidence from the phases above. Do not inflate — a judge doing five minutes of due diligence will find the real number anyway.

| Category | Score (1-10) | Evidence |
|---|---|---|
| Architecture & code quality | | |
| Security | | |
| Database & data integrity | | |
| ML/Quantum — real vs claimed | | |
| API design & docs | | |
| Testing & CI/CD | | |
| Performance & scalability | | |
| Frontend UX/accessibility | | |
| Observability | | |
| Documentation/onboarding | | |
| Startup narrative clarity | | |
| **Overall** | | |

For any category scoring below 7, list the single highest-leverage fix that would move it up — this becomes the actual to-do list after this audit, not a vague "needs improvement" note.

---

## Reminder

Paste real command output at every phase. A polished-sounding report with no pasted evidence is exactly the failure mode that happened last time on the security-only pass — don't repeat it at project scale.
